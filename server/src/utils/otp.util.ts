import nodemailer from 'nodemailer';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async (email: string, otp: string): Promise<void> => {
    
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: 465,
        secure: true,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        }, 
    });

    const mailOptions = {
    from: process.env.MAIL_FROM,
    to: email,
    subject: 'Nexora Verification Code',
    text: `Dear customer,

        Your One-Time Password (OTP) for verifying your account on Nexora is: ${otp}

        This code is valid for the next 5 minutes.

        Thank you,
        Team Nexora`,
    };

    try {
        await transporter.sendMail(mailOptions);    
    } catch (error) {
        throw new Error('Error sending OTP email');
    }
};

export { generateOTP, sendOTP };