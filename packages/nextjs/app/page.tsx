"use client";

import { ArrowRight, Brain } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/pitch');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <Brain className="h-16 w-16 text-gray-900" />
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            AI Capital: Your AI-Driven Hedge Fund
          </h1>
          <div className="max-w-3xl mx-auto">
            <p className="text-xl text-gray-600 mb-4">
              Harness the power of artificial intelligence to revolutionize your
              investment strategy. Our advanced algorithms analyze market patterns,
              predict trends, and execute trades with unprecedented precision.
            </p>
            <p className="text-xl text-gray-600 mb-12">
              Join the future of algorithmic trading where AI-driven decisions meet
              human expertise, delivering consistent returns in any market
              condition.
            </p>
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 transition-colors"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
