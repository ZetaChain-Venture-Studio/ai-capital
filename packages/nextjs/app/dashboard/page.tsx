'use client';

import PerformanceMetrics from '@/components/metrics/PerformanceMetrics';
import PitchForm from '@/components/pitch/PitchForm';
import PortfolioTable from '@/components/portfolio/PortfolioTable';
import { useState } from 'react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'pitch'>('portfolio');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === 'portfolio'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Portfolio
            </button>
            <button
              onClick={() => setActiveTab('pitch')}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === 'pitch'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              New Pitch
            </button>
          </div>
        </div>

        <PerformanceMetrics />

        {activeTab === 'portfolio' ? <PortfolioTable /> : <PitchForm />}
      </div>
    </div>
  );
}