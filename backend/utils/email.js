const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transport = {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    };

    const transporter = nodemailer.createTransport(transport);

    const message = {
        from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    try {
        await transporter.sendMail(message);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        console.error('SMTP Host:', process.env.SMTP_HOST);
        console.error('SMTP Port:', process.env.SMTP_PORT);
        console.error('SMTP User:', process.env.SMTP_USER);
        throw new Error('Email could not be sent');
    }
};

module.exports = sendEmail;
