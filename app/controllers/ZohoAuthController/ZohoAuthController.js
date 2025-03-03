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

    const authorizationCode = req.query.code;
    const clientId = process.env.ZOHO_CLIENT_ID;
    const clientSecret = process.env.ZOHO_CLIENT_SECRET;
    const redirectUri = 'http://localhost:8000/api/zoho/callback';


    // Exchange the authorization code for an access token and refresh token
    const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', null, {
        params: {
            client_id: clientId,
            client_secret: clientSecret,
            code: authorizationCode,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
        },
    });
    console.log(response)
    const { access_token, refresh_token } = response.data;

    // Save the access token and refresh token securely (e.g., in the database)
    await saveTokensToDatabase(access_token, refresh_token);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        data:response?.data,
        message: 'Zoho CRM authentication successful.',
    });

});