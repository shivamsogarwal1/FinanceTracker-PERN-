import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'https://backend-expense-tracker-2.onrender.com/signup',
        { name, email, password, confirmPassword }
      );

      if (response.status === 201) {
        navigate('/'); // Redirect to login page
      } else {
        console.error('Signup failed');
      }
    } catch (error) {
      console.error('Error during signup:', error);
      alert('Signup failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-xl border border-gray-200 transition-all duration-300">
        
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 tracking-tight">
          Create Account
        </h2>

        <p className="text-center text-gray-500 mb-6 text-sm">
          Sign up to start tracking your expenses
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 text-black
                         focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none
                         transition-all duration-200"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 text-black
                         focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none
                         transition-all duration-200"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            className="w-full py-2.5 bg-violet-600 text-white font-medium rounded-lg
                       hover:bg-violet-700 active:scale-[0.98]
                       focus:ring-4 focus:ring-violet-300 transition-all duration-200"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-gray-600 mt-5 text-sm">
          Already have an account?{' '}
          <Link className="text-violet-600 font-medium hover:underline" to="/">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
