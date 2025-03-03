import httpStatus from "http-status";
import { errorLogger, infoLogger } from "../logger/logConfig";
import { ApiError } from "../../libs/helpers/global";
import { config } from "../server/config";
import transporter from "./transporter";

const sendMail = async ({ formEmail = config.MAIL.SENDER_EMAIL_ID, toEmail, subject, content }) => {
    try {
        await transporter.verify();
        infoLogger.info(`Server is ready to take our messages`);

        const response = await transporter.sendMail({
            from: formEmail,
            to: toEmail,
            subject: subject,
            html: content
        });

        return response;
    } catch (error) {
        errorLogger.error(`Error on mail server: ${error instanceof Error ? error.message : 'unknown'}`);
        throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to send email to user.');
    }
};

export default sendMail;