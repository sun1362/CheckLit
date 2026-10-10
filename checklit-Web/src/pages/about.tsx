import React from 'react';
import { ShoppingBag, Server, Database, Code } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800">About CheckLit</h1>
              <p className="text-slate-500 text-sm">Grocery Shopping List & Real-Time Price Calculation System</p>
            </div>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed">
            CheckLit is a full-stack grocery shopping list web application. Users can build custom shopping lists by selecting food ingredients organized into intuitive categories (Vegetables, Fruits, Meat, Seasonings, Dairy, and Snacks).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <Code className="w-6 h-6 text-emerald-600" />
              <h4 className="text-sm font-bold text-slate-800">Frontend Stack</h4>
              <p className="text-xs text-slate-500">React + TypeScript, Tailwind CSS, React Router, Lucide Icons, and custom hooks.</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <Server className="w-6 h-6 text-teal-600" />
              <h4 className="text-sm font-bold text-slate-800">Backend API</h4>
              <p className="text-xs text-slate-500">Node.js + Express REST API with configured Axios client instance.</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <Database className="w-6 h-6 text-indigo-600" />
              <h4 className="text-sm font-bold text-slate-800">Database</h4>
              <p className="text-xs text-slate-500">MongoDB Atlas / Mongoose schema validation and state persistence.</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
