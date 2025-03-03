import nodemailer from 'nodemailer'
import { config } from '../server/config'

const transporter = nodemailer.createTransport({
    host: config.MAIL.SENDER_EMAIL_HOSTNAME,
    port: Number(config.MAIL.SENDER_EMAIL_PORT),
    auth: {
        user: config.MAIL.SENDER_EMAIL_ID,
        pass: config.MAIL.SENDER_EMAIL_PASSWORD,
    },
})

export default transporter 