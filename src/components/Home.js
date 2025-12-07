import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import Summary from './Summary';

const Home = () => {
  const { user, token, logout } = useAuth();
  const [salary, setSalary] = useState('NA');
  const [newSalaryInput, setNewSalaryInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !token) return;

    const fetchUserData = async () => {
      try {
        const salaryResponse = await axios.get(
          `https://backend-expense-tracker-2.onrender.com/salary`,
          { headers: { Authorization: token } }
        );
        setSalary(Number(salaryResponse.data));
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user, token]);

  const handleSaveSalary = async () => {
    try {
      await axios.put(
        `https://backend-expense-tracker-2.onrender.com/salary`,
        { salary: Number(newSalaryInput) },
        { headers: { Authorization: token } }
      );
      setSalary(newSalaryInput);
      setNewSalaryInput('');
    } catch (error) {
      console.error('Error updating salary:', error);
    }
  };

  const handleInputChange = (e) => {
    setNewSalaryInput(e.target.value);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Welcome, {user.name}</h1>
        <button
          onClick={handleLogout}
          className="py-2 px-5 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50"
        >
          Logout
        </button>
      </div>

      <div className="mb-6 bg-white shadow-md rounded-xl p-5 border border-gray-200">
        <h2 className="text-xl font-semibold mb-3">Salary Overview</h2>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-lg">
            Your Salary:{" "}
            {salary === 'NA' ? (
              <span className="text-red-500 font-medium">{salary}</span>
            ) : (
              <span className="font-medium">{salary}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newSalaryInput}
              onChange={handleInputChange}
              placeholder="Enter new salary"
              className="px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-300 outline-none shadow-sm transition duration-200 w-full md:w-auto"
            />
            <button
              onClick={handleSaveSalary}
              className="bg-indigo-500 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <ExpenseForm />
        <ExpenseList />
        <Summary />
      </div>
    </div>
  );
};

export default Home;
