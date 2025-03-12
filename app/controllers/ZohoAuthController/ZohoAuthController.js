import axios from "axios";
import { catchAsync, sendResponse } from "../../../libs/helpers/global.js";
import prisma from "../../../prisma/client.js";

const saveTokensToDatabase = async (accessToken, refreshToken) => {
    try {
        // Store the access and refresh tokens in the ZohoTokens table
        await prisma.zohoTokens.create({
            data: {
                access_token: accessToken,
                refresh_token: refreshToken,
            },
        });
    } catch (error) {
        console.error('Error storing Zoho tokens:', error);
    }
};

const getTokensFromDatabase = async () => {
    try {
        const zohoTokens = await prisma.zohoTokens.findFirst({
            orderBy: {
                created_at: 'desc', // Get the most recent tokens
            },
        });

        return zohoTokens;
    } catch (error) {
        console.error('Error retrieving Zoho tokens:', error);
    }
};


const updateTokensInDatabase = async (newAccessToken, newRefreshToken) => {
    try {
        const zohoToken = await prisma.zohoTokens.findFirst({
            orderBy: { created_at: 'desc' }, // Get the most recent token
        });

        if (zohoToken) {
            await prisma.zohoTokens.update({
                where: { id: zohoToken.id },
                data: {
                    access_token: newAccessToken,
                    refresh_token: newRefreshToken,
                },
            });
        }
    } catch (error) {
        console.error('Error updating Zoho tokens:', error);
    }
};



export const redirectToZoho = catchAsync(async (req, res) => {

    const clientId = process.env.ZOHO_CLIENT_ID; // Use your actual client ID

    const redirectUri = 'http://localhost:8000/api/zoho/callback'; // Use your actual redirect URI

    const zohoAuthUrl = `https://accounts.zoho.com/oauth/v2/auth?scope=AaaServer.profile.Read,ZohoCRM.modules.ALL&client_id=${clientId}&response_type=code&access_type=offline&redirect_uri=${redirectUri}`;

    res.redirect(zohoAuthUrl);

});

export const handleZohoCallback = catchAsync(async (req, res) => {

    try {
        const authorizationCode = req.query.code;
        console.log(authorizationCode);
        if (!authorizationCode) {
            return res.status(400).send('Authorization code missing');
        }

        // Exchange authorization code for access token
        const tokenResponse = await axios.post(
            `https://accounts.zoho.in/oauth/v2/token`,
            null,
            {
                params: {
                    code: authorizationCode,
                    client_id: process.env.ZOHO_CLIENT_ID,
                    client_secret: process.env.ZOHO_CLIENT_SECRET,
                    redirect_uri: process.env.ZOHO_REDIRECT_URL,
                    grant_type: 'authorization_code'
                }
            }
        );
        console.log(tokenResponse.data);
        // Extract tokens from response
        const { access_token, refresh_token, expires_in: expiresIn } = tokenResponse.data;
        if (typeof expiresIn !== 'number' || isNaN(expiresIn)) {
            throw new Error('Invalid token expiration received from Zoho');
        }

        // Calculate expiration time properly
        const expiresAt = new Date(Date.now() + (expiresIn * 1000));

        const newToken = await prisma.zohoTokens.create({
            data: {
                access_token,
                refresh_token,
                expires_at: expiresAt,
                is_refreshing: false
            }
        });


        // Send response (you can customize this)
        res.json({
            success: true,
            message: 'Authorization successful!',
            access_token,
            expires_in: expiresIn,
            refresh_token,
            data: tokenResponse.data,
            newToken
        });

    } catch (error) {
        console.error('Callback error:', error.response ? error.response.data : error.message);
        res.status(500).send('Authentication failed');
    }

});