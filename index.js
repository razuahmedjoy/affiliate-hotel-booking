import express from 'express'; 
import path from 'path'; 
import cors from 'cors';
import helmet from "helmet";
import xss from 'xss-clean';
import sanitize from 'express-mongo-sanitize';
import { routes } from './app/routes/routes.js';
import bootstrap from './config/server/bootstrap.js';
import { registerRoutes } from './config/server/registerRoutes.js';
import requestLogger from './config/logger/requestLogger.js';
import upload from './config/multer/multerConfig.js';
import handleRouteNotFound from './app/routes/handleRouteNotFound.js';
import handleGlobalErrors from './config/errors/handleGlobalErrors.js';
import { ZohoCRM } from './libs/helpers/zohocrm.js'; 
import prisma from './prisma/client.js';
import { sendResponse } from './libs/helpers/global.js';

const app = express();


const allowedOrigins = [
    // allow all origins
    '*',
    'http://localhost:5173',
    'http://localhost:5174',
    'https://yolast.com',
    'https://yolast.vercel.app',
    'https://www.yolast.com',
]


// CORS setup for multiple allowed origins
const corsOptions = {
    origin: function (origin, callback) {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            // Allow the request if the origin is in the allowedOrigins list or if no origin is provided
            callback(null, true);
        } else {
            // Reject the request if the origin is not in the allowed list
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,  // Allow credentials
};

// Middleware
app.use(cors(corsOptions));
// Handle preflight OPTIONS requests
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sanitize());
app.use(xss());
app.use(helmet());
app.use(requestLogger);

// multer configure
app.use(
    upload.fields([
        { name: "single", maxCount: 1 },
        { name: "multiple", maxCount: 10 },
    ])
);

// files route
app.use('/public', express.static('public'));

// Welcome route
app.get('/', (req, res) => {
    const filePath = path.join(process.cwd(), 'public', 'html', 'index.html');
    res.sendFile(filePath);
});



app.get('/delete-zoho-tokens', async (req, res) => {
    try {
        await prisma.zohoTokens.deleteMany();
        res.json({ message: 'Tokens deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/test-zoho-post', async (req, res) => {
    try {
        console.log(req.body);
        const response = await ZohoCRM.postData("Affiliates", req.body);
        res.status(200).json(response);

    } catch (error) {
        console.log(error)
        sendResponse(res, error.response);
    }
});

app.get('/zoho/authenticate', async (req, res) => {
    try {
        const status = await ZohoCRM.authenticate();
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/token-status', async (req, res) => {
    try {
        const status = await ZohoCRM.getTokenStatus();
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/tokeninitiate', async (req, res) => {
    // redirect to zoho auth url
    // first check if there is both access token and refresh token in the database
    // if not, redirect to zoho auth url
    // if yes, check if the access token is still valid
    const isTokenExists = await prisma.zohoTokens.findFirst({});
    if (!isTokenExists?.access_token || !isTokenExists?.refresh_token) {
        // redirect to zoho auth url
        const authUrl = await ZohoCRM.getAuthUrl();
        console.log(authUrl);
        res.redirect(authUrl);
    } else {
        // check if the token is still valid
        res.json({ message: 'Token exists' });
    }
});

// Register all routes under `/api`
registerRoutes(app, '/api', routes);

// Global error handler (should be before RouteNotFound)
app.use((err, req, res, next) => {
    handleGlobalErrors(err, req, res, next);
});

// Handle route not found (should be the last middleware)
app.use(handleRouteNotFound);

// Server & database



bootstrap(app);

export default app;