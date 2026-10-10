import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-md w-full space-y-5">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <img src="../src/assets/image-noIdea.jpg" className="w-75 h-75 flex items-center justify-center mx-auto"/>
        <h2 className="text-lg font-bold text-slate-800">Page Not Found</h2>
        <p className="text-slate-500 text-xs">
          The page you requested does not exist yet. Return to the CheckLit landing page.
        </p>
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
