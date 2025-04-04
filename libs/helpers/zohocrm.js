import axios from 'axios';
import prisma from '../../prisma/client.js';


export const ZohoCRM = {
    async getAuthUrl() {
        return `${process.env.ZOHO_AUTH_URL}?scope=ZohoCRM.modules.ALL,ZohoCRM.settings.fields.ALL,ZohoCRM.settings.related_lists.ALL&client_id=${process.env.ZOHO_CLIENT_ID}&response_type=code&access_type=offline&redirect_uri=${process.env.ZOHO_REDIRECT_URL}`;
    },
    async getTokenRecord() {
        return prisma.zohoTokens.findFirst();
    },

    async authenticate() {
        try {
            const tokenRecord = await this.getTokenRecord();

            if (!tokenRecord) {
                throw new Error('No Zoho token record found');
            }

            const url = `${process.env.ZOHO_TOKEN_URL}?refresh_token=${tokenRecord.refresh_token}&client_id=${process.env.ZOHO_CLIENT_ID}&client_secret=${process.env.ZOHO_CLIENT_SECRET}&grant_type=refresh_token`;
            console.log(url);
            const response = await axios.post(url, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    "Authorization": `Zoho-oauthtoken ${tokenRecord.access_token}`
                }
            });


            console.log(response.data);

            // Validate expires_in value
            const expiresIn = response.data.expires_in;
            if (typeof expiresIn !== 'number' || isNaN(expiresIn)) {
                throw new Error('Invalid token expiration received from Zoho');
            }

            // Calculate expiration time properly
            const expiresAt = new Date(Date.now() + (expiresIn * 1000));

            // Validate date before proceeding
            if (isNaN(expiresAt.getTime())) {
                throw new Error('Invalid expiration date calculation');
            }

            // Update database record with validated data
            return prisma.zohoTokens.update({
                where: { id: tokenRecord.id },
                data: {
                    access_token: response.data.access_token,
                    expires_at: expiresAt,
                    is_refreshing: false
                }
            });
        } catch (error) {
            console.error('Authentication failed:', error.message);
            throw error;
        }
    },
    async handleTokenRefresh() {
        return prisma.$transaction(async (tx) => {
            // Get token record with lock
            const tokenRecord = await tx.zohoTokens.findFirst({
                select: { id: true, is_refreshing: true }
            });

            if (!tokenRecord) throw new Error('No Zoho token record found');

            if (tokenRecord.is_refreshing) {
                // Refresh already in progress
                return false;
            }

            // Set refresh lock
            await tx.zohoTokens.update({
                where: { id: tokenRecord.id },
                data: { is_refreshing: true }
            });

            return true;
        });
    },

    async postDataPrev(module, data) {
        try {
            let tokenRecord = await this.getTokenRecord();

            // Check if token exists and is valid
            if (!tokenRecord || !tokenRecord.access_token || new Date() > tokenRecord.expires_at) {
                const shouldRefresh = await this.handleTokenRefresh();

                if (shouldRefresh) {
                    try {
                        tokenRecord = await this.authenticate();
                    } finally {
                        // Always release refresh lock
                        await prisma.zohoTokens.update({
                            where: { id: tokenRecord.id },
                            data: { is_refreshing: false }
                        });
                    }
                } else {
                    // Wait and retry if another process is refreshing
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return this.postData(module, data);
                }
            }
            // OLD TOKEN
            // 1000.4475051528e29d71d7751706e757aa09.b90ed5b9608f43285f930bf155d53356
            try {
                const response = await axios.post(
                    `${process.env.ZOHO_API_URL}${module}`,
                    { data: [data] },
                    {
                        headers: {
                            Authorization: `Zoho-oauthtoken 1000.4475051528e29d71d7751706e757aa09.b90ed5b9608f43285f930bf155d53356`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                return response.data;
            }
            catch (error) {
                console.log(error?.response);
                if (error.response?.status === 401) {

                    // Token might have been revoked - clear local cache
                    // await prisma.zohoTokens.deleteMany();
                    throw new Error('Authentication failed - please reauthenticate');
                }
                console.error('Zoho CRM API Error:', error.response?.data || error.message);
                // throw error with the error message
                throw new Error(error.response?.data || error.message);
            }
        } catch (error) {
            if (error.response?.status === 401) {

                throw new Error('Authentication failed - please reauthenticate');
            }
            console.error('Zoho CRM API Error:', error.response?.data || error.message);
            throw error;
        }
    },
    async postData(module, data, retryCount = 0) {

        const MAX_RETRIES = 1;
        try {
            let tokenRecord = await this.getTokenRecord();

            // Token check and refresh logic
            if (!tokenRecord || !tokenRecord.access_token || new Date() > tokenRecord.expires_at) {
                const shouldRefresh = await this.handleTokenRefresh();
                if (shouldRefresh) {
                    try {
                        tokenRecord = await this.authenticate();
                    } finally {
                        await prisma.zohoTokens.update({
                            where: { id: tokenRecord.id },
                            data: { is_refreshing: false }
                        });
                    }
                } else {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return this.postData(module, data, retryCount);
                }
            }

            // API request with current token
            const response = await axios.post(
                `${process.env.ZOHO_API_URL}${module}`,
                { data: [data] },
                {
                    headers: {
                        Authorization: `Zoho-oauthtoken ${tokenRecord.access_token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;

        } catch (error) {
            // Handle token errors
            if (retryCount < MAX_RETRIES &&
                (error.response?.data?.code === 'INVALID_TOKEN' || error.response?.status === 401)) {

                const shouldRefresh = await this.handleTokenRefresh();
                if (shouldRefresh) {
                    try {
                        await this.authenticate();
                        return this.postData(module, data, retryCount + 1);
                    } finally {
                        const tokenRecord = await this.getTokenRecord();
                        await prisma.zohoTokens.update({
                            where: { id: tokenRecord.id },
                            data: { is_refreshing: false }
                        });
                    }
                } else {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return this.postData(module, data, retryCount + 1);
                }
            }

            console.log('Zoho CRM API Error:', error.response?.data || error.message);

            // Final error handling
            if (error.response?.status === 401) {
                // await prisma.zohoTokens.deleteMany();

                throw Error({
                    statusCode: error.response?.status,
                    message: 'Authentication failed - please reauthenticate',
                    data: error.response?.data
                });
            }
            console.error('Zoho CRM API Error:', error.response?.data || error.message);
            throw Error({ error: error.response?.data?.message || error.message });
        }
    },

    // Initial setup function (run once)
    async initializeTokens(accessToken, refreshToken, expires_at) {
        return prisma.zohoTokens.create({
            data: {
                access_token: '', // Will be populated on first refresh
                refresh_token: refreshToken,
                expires_at: expires_at || new Date(Date.now() + 3600 * 1000), // Default to 1 hour from now
            }
        });
    },

    async getTokenStatus() {
        try {
            const tokenRecord = await this.getTokenRecord();

            if (!tokenRecord) {
                return {
                    exists: false,
                    message: 'No Zoho token record found in database'
                };
            }

            const now = new Date();
            const expiresAt = new Date(tokenRecord.expires_at);
            const isExpired = expiresAt < now;
            const secondsRemaining = Math.round((expiresAt - now) / 1000);
            const isValid = !isExpired && tokenRecord.access_token;

            return {
                exists: true,
                isValid,
                isRefreshing: tokenRecord.is_refreshing,
                expiresAt,
                secondsRemaining: Math.max(0, secondsRemaining),
                createdAt: tokenRecord.created_at,
                updatedAt: tokenRecord.updated_at,
                hasRefreshToken: !!tokenRecord.refresh_token
            };
        } catch (error) {
            console.error('Token status check failed:', error);
            return {
                exists: false,
                error: error.message
            };
        }
    }
};