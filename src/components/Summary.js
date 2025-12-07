import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaSync } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid, ReferenceDot } from 'recharts';

const Summary = () => {
  const { token } = useAuth();
  const [summary, setSummary] = useState({ total: 0, categories: [], monthly: {}, yearly: {} });
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setIsFetching(true);
      const response = await axios.get('https://backend-expense-tracker-2.onrender.com/expenses', {
        headers: { Authorization: token },
      });
      const expenses = response.data;
      let total = 0;
      const categories = {};
      const monthly = {};
      const yearly = {};

      expenses.forEach((expense) => {
        total += expense.amount;
        const expenseDate = new Date(expense.date);
        const year = expenseDate.getFullYear();
        const monthName = expenseDate.toLocaleString('default', { month: 'long' });
        if (year === new Date().getFullYear()) monthly[monthName] = (monthly[monthName] || 0) + expense.amount;
        yearly[year] = (yearly[year] || 0) + expense.amount;
        categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
      });

      const categoriesArray = Object.entries(categories)
        .map(([category, amount]) => ({ category, amount, percentage: (amount / total) * 100 }))
        .sort((a, b) => b.amount - a.amount);

      const currentYear = new Date().getFullYear();
      const monthNames = Array.from({ length: 12 }, (_, i) => new Date(currentYear, i, 1).toLocaleString('default', { month: 'long' }));
      monthNames.forEach(month => { if (!monthly[month]) monthly[month] = 0; });

      setSummary({ total, categories: categoriesArray, monthly, yearly });
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'];

  const yearlyData = Object.entries(summary.yearly).map(([year, amount]) => ({ year, amount })).sort((a, b) => parseInt(a.year) - parseInt(b.year));
  const monthNames = Array.from({ length: 12 }, (_, i) => new Date(new Date().getFullYear(), i, 1).toLocaleString('default', { month: 'long' }));
  const monthlyData = monthNames.map(month => ({ month, amount: summary.monthly[month] || 0 }));

  const animationDuration = 1000;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-gray-900">Summary</h2>
        <button onClick={fetchSummary} disabled={isFetching} className="text-gray-700 hover:text-indigo-600 transition-colors duration-200">
          <FaSync className={`text-xl ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expense Trend */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Expense Trend (Current Year)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#374151" />
              <YAxis stroke="#374151" />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="#4f46e5" animationDuration={animationDuration} strokeWidth={3} />
              {monthlyData.map((entry, idx) => idx === new Date().getMonth() ? <ReferenceDot key={idx} x={entry.month} y={entry.amount} r={6} fill="#4f46e5" /> : null)}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category List */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm overflow-x-auto">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Category Breakdown</h3>
          <table className="w-full text-left border border-gray-200">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {summary.categories.map((cat, idx) => (
                <tr key={idx} className="border-b border-gray-200 hover:bg-gray-100 transition">
                  <td className="px-4 py-2 font-medium text-gray-700">{cat.category}</td>
                  <td className="px-4 py-2 text-gray-800">{cat.amount}</td>
                  <td className="px-4 py-2 text-gray-600">{cat.percentage.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pie Chart */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Pie Chart</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={summary.categories} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={80} label>
                {summary.categories.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Doughnut Chart</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={summary.categories} dataKey="amount" nameKey="category" cx="50%" cy="50%" innerRadius={60} outerRadius={80} label>
                {summary.categories.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Bar Chart */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Monthly Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#374151" />
              <YAxis stroke="#374151" />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Yearly Comparison */}
        {yearlyData.length > 1 && (
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Yearly Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="year" stroke="#374151" />
                <YAxis stroke="#374151" />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default Summary;
