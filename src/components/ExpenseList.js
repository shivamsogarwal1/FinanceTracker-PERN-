import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaEdit, FaTrash, FaSync } from 'react-icons/fa';

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editedAmount, setEditedAmount] = useState('');
  const [editedCategory, setEditedCategory] = useState('');
  const [editedDate, setEditedDate] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetchExpenses();
  }, [token]);

  const fetchExpenses = async () => {
    try {
      setIsFetching(true);
      const response = await axios.get('https://backend-expense-tracker-2.onrender.com/expenses', {
        headers: { Authorization: token }
      });
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleDelete = async (expenseId) => {
    try {
      await axios.delete(`https://backend-expense-tracker-2.onrender.com/expenses/${expenseId}`, {
        headers: { Authorization: token }
      });
      setExpenses(expenses.filter((expense) => expense._id !== expenseId));
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense._id);
    setEditedAmount(expense.amount);
    setEditedCategory(expense.category);
    setEditedDate(expense.date);
  };

  const handleUpdate = async (expenseId) => {
    try {
      await axios.put(`https://backend-expense-tracker-2.onrender.com/expenses/${expenseId}`, {
        amount: Number(editedAmount),
        category: editedCategory,
        date: editedDate
      }, {
        headers: { Authorization: token }
      });
      setExpenses(expenses.map((expense) =>
        expense._id === expenseId ? { ...expense, amount: editedAmount, category: editedCategory, date: editedDate } : expense
      ));
      setEditingExpense(null);
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 max-w-3xl mx-auto mb-6 transition-all duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Expense List</h2>
        <button
          onClick={fetchExpenses}
          disabled={isFetching}
          className="text-gray-700 hover:text-indigo-600 transition-colors duration-200"
        >
          <FaSync className={`text-xl ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <ul className="space-y-3">
        {expenses.map((expense) => (
          <li
            key={expense._id}
            className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200 shadow-sm transition hover:shadow-md"
          >
            {editingExpense === expense._id ? (
              <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">
                <input
                  type="number"
                  value={editedAmount}
                  onChange={(e) => setEditedAmount(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition duration-200"
                />
                <input
                  type="text"
                  value={editedCategory}
                  onChange={(e) => setEditedCategory(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition duration-200"
                />
                <input
                  type="date"
                  value={editedDate}
                  onChange={(e) => setEditedDate(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition duration-200"
                />
                <button
                  onClick={() => handleUpdate(expense._id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingExpense(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4">
                <span className="font-medium text-gray-800">{expense.amount}</span>
                <span className="font-medium text-gray-700">{expense.category}</span>
                <span className="text-gray-500">{expense.date}</span>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <button
                    onClick={() => handleEdit(expense)}
                    className="text-indigo-600 hover:text-indigo-800 transition duration-200"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(expense._id)}
                    className="text-red-600 hover:text-red-800 transition duration-200"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExpenseList;
