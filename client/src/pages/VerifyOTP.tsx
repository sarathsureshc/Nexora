import React, { useState } from 'react';
import axios from '../utils/axios';

const VerifyOTP = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/auth/verify-otp', { email, otp });
      setToken(response.data.token);
      setMessage('OTP Verified. You are logged in!');
      // Store token in localStorage if needed
      localStorage.setItem('token', response.data.token);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Verification failed');
    }
  };

  return (
    <div>
      <h2>Verify OTP</h2>
      <form onSubmit={handleVerify}>
        <input
          type="email"
          placeholder="Email used during signup"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Enter OTP"
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <button type="submit">Verify OTP</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default VerifyOTP;