import React from 'react';
import { useParams, Link } from 'react-router-dom';

const TestRoute = () => {
  const { id } = useParams();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white p-8">
      <h1 className="text-3xl font-bold text-cyan-800 mb-4">✅ Test Route Works!</h1>
      <p className="text-gray-700 mb-4">Route parameter: {id || 'No ID provided'}</p>
      <div className="space-y-4">
        <Link to="/" className="block text-cyan-600 hover:text-cyan-700">Go to Home</Link>
        <Link to="/skills" className="block text-cyan-600 hover:text-cyan-700">Go to Skills</Link>
        <Link to="/skill/test123" className="block text-cyan-600 hover:text-cyan-700">Test Skill Details</Link>
        <Link to="/booking/test123" className="block text-cyan-600 hover:text-cyan-700">Test Booking</Link>
        <Link to="/add-skill" className="block text-cyan-600 hover:text-cyan-700">Test Add Skill</Link>
      </div>
    </div>
  );
};

export default TestRoute;