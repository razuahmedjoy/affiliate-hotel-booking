import moment from "moment";
import { httpLogger } from "./logConfig.js";
import { getRequestFulllUrl } from "../../libs/helpers/global.js";

const requestLogger = (req, res, next) => {
    const { method } = req;
    const startTime = moment();

    res.on('finish', () => {
        const endTime = moment();
        const duration = endTime.diff(startTime);
        const formattedDuration = moment.duration(duration).asMilliseconds();
        const message = `${method} ${getRequestFulllUrl(req)} ${res.statusCode} - ${formattedDuration}ms`;
        httpLogger.http(message);
    });

    next();
};

export default requestLogger;