'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { mockPortfolio } from '../portfolio/PortfolioTable';

export default function PitchForm() {
  const [formData, setFormData] = useState({
    token: '',
    tradeType: '',
    allocation: '',
    pitch: '',
  });
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.pitch.length < 1) {
      setStatus('error');
      return;
    }
    console.log('Form submitted:', formData);
    setStatus('success');
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Submit a Pitch</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="token"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select Token
          </label>
          <select
            id="token"
            name="token"
            required
            value={formData.token}
            onChange={handleChange}
            className="bg-white w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option value="">Select a token</option>
            {mockPortfolio.map((item) => (
              <option key={item.symbol} value={item.symbol}>
                {item.token} ({item.symbol})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trade Type
          </label>
          <div className="space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="tradeType"
                value="buy"
                checked={formData.tradeType === 'buy'}
                onChange={handleChange}
                className="form-radio text-gray-900"
              />
              <span className="ml-2">Buy</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="tradeType"
                value="sell"
                checked={formData.tradeType === 'sell'}
                onChange={handleChange}
                className="form-radio text-gray-900"
              />
              <span className="ml-2">Sell</span>
            </label>
          </div>
        </div>

        <div>
          <label
            htmlFor="allocation"
            className="block text-sm font-medium text-gray-700 mb-2 bg-white"
          >
            Allocation Percentage (0-100)
          </label>
          <input
            type="number"
            id="allocation"
            name="allocation"
            min="0"
            max="100"
            required
            value={formData.allocation}
            onChange={handleChange}
            className="bg-white w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            style={{ backgroundColor: 'white' }}
          />
        </div>

        <div>
          <label
            htmlFor="pitch"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Investment Pitch
          </label>
          <textarea
            id="pitch"
            name="pitch"
            required
            value={formData.pitch}
            onChange={handleChange}
            rows={4}
            className="bg-white w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Explain your investment thesis..."
          />
        </div>

        {status !== 'idle' && (
          <div
            className={`p-4 rounded-md ${
              status === 'success'
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            <div className="flex items-center">
              {status === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-1" />
              )}
              <p>
                {status === 'success'
                  ? 'Pitch submitted successfully!'
                  : 'Please ensure your pitch is at least 1 character.'}
              </p>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-gray-900 text-white py-3 px-6 rounded-md hover:bg-gray-800 transition-colors"
        >
          Submit Pitch
        </button>
      </form>
    </div>
  );
}