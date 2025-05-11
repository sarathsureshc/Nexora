import mongoose from 'mongoose';

interface IUser {
    name: string;
    email: string;
    password: string;
    otp: string;
    otpExpiration: Date;
}

const userSchema = new mongoose.Schema<IUser>({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    otp: {type: String, required: true},
    otpExpiration: {type: Date, required: true},
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;