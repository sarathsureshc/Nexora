import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/user.model';
import { generateOTP, sendOTP } from '../utils/otp.util';

dotenv.config();

const signup = async (req: Request, res: Response): Promise<void> => {
    try{
        const { name, email, password } = req.body;
        console.log("Received signup request:", { name, email, password });

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }


        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpiration = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration
        await user.save();
        await sendOTP(user.email, otp);

        res.status(201).json({message: 'Signup successful. Check your email for OTP verification.' });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
};

const verifyOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        if (!user || user.otp !== otp) {
      res.status(400).json({ message: 'Invalid OTP' });
      return;
    }

    if (new Date() > user.otpExpiration) {
      res.status(400).json({ message: 'OTP expired' });
      return;
    }
 // OTP verified, generate JWT
 console.log("JWT_SECRET:", process.env.JWT_SECRET); // 👈 Add this before jwt.sign

    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRATION ? parseInt(process.env.JWT_EXPIRATION, 10) : undefined }
    );

    res.status(200).json({ message: 'OTP verified', token });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'User not found' });
      return;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(400).json({ message: 'Invalid password' });
      return;
    }

    const token = jwt.sign(
  { userId: user._id },
  process.env.JWT_SECRET as string,
  { expiresIn: process.env.JWT_EXPIRATION ? parseInt(process.env.JWT_EXPIRATION, 10) : undefined }
);

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

export { signup, verifyOTP, login };