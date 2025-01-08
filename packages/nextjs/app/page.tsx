"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Lucy from "../public/assets/lucy.webp";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/pitch");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image src={Lucy} alt="AI Capital" width={640} height={640} placeholder="blur" className="rounded" />
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            AI Capital: Convince Lucy to Invest in Your Token
          </h1>
          <div className="max-w-3xl mx-auto">
            <p className="text-xl text-gray-600 mb-4">
              Play the game by pitching your favorite token to our advanced AI and see if you can convince it to invest.
            </p>
            <p className="text-xl text-gray-600 mb-12">
              Challenge yourself in this interactive game where AI meets human ingenuity.
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
