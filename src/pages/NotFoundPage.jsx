import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 text-center border border-slate-200">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">404</h1>
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Page Not Found</h2>
        <p className="text-slate-500 text-sm mb-6">The page you are looking for does not exist or has been moved.</p>
        <Link 
          to="/dashboard" 
          className="inline-block py-2.5 px-6 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
