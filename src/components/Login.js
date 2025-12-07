import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'https://backend-expense-tracker-2.onrender.com/login',
        { email, password }
      );

      const { token, user } = response.data;
      localStorage.setItem('userId', user._id);

      login(token, user);
      navigate('/home');
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-xl border border-gray-200 transition-all duration-300">
        
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 tracking-tight">
          Welcome Back
        </h2>

        <p className="text-center text-gray-500 mb-6 text-sm">
          Login to continue tracking your expenses
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 text-black
                         focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none
                         transition-all duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 text-black
                         focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none
                         transition-all duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-2.5 bg-violet-600 text-white font-medium rounded-lg
                       hover:bg-violet-700 active:scale-[0.98]
                       focus:ring-4 focus:ring-violet-300 transition-all duration-200"
          >
            Login
          </button>
        </form>

        <p className="text-center text-gray-600 mt-5 text-sm">
          Don’t have an account?{' '}
          <Link className="text-violet-600 font-medium hover:underline" to="/signup">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
