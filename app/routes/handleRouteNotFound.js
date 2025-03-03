import fs from 'fs';
import path from 'path';
import httpStatus from 'http-status';
import { getRequestFulllUrl } from '../../libs/helpers/global.js';

const handleRouteNotFound = (req, res) => {
    const filePath = path.join(process.cwd(), 'public', 'html', 'NotFound.html');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).send('Error loading page.');
        }

        const updatedHtml = data.replace('${req.originalUrl}', getRequestFulllUrl(req));

        res.status(httpStatus.NOT_FOUND).send(updatedHtml);
    });
};

export default handleRouteNotFound;