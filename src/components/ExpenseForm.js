import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ExpenseForm = () => {
  const { token } = useAuth();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !category || !date) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await axios.post(
        'https://backend-expense-tracker-2.onrender.com/expenses',
        {
          amount: Number(amount),
          category,
          date,
        },
        { headers: { Authorization: token } }
      );

      setAmount('');
      setCategory('');
      setDate('');
      alert('Expense added successfully!');
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense');
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 max-w-md mx-auto mb-6 transition-all duration-300">
      <h2 className="text-2xl font-semibold mb-5 text-gray-900">Add Expense</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <input
            id="amount"
            type="number"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900
                       focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none
                       transition duration-200 shadow-sm"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <input
            id="category"
            type="text"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900
                       focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none
                       transition duration-200 shadow-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            id="date"
            type="date"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900
                       focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none
                       transition duration-200 shadow-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-lg shadow
                     hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400
                     focus:ring-opacity-50 transition duration-200"
        >
          Add Expense
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;
