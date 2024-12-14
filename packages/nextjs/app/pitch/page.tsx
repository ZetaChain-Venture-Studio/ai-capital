'use client';

import { useState } from 'react';
import TokenSelect from '../../components/pitch/TokenSelect';
import TradeTypeSelect from '../../components/pitch/TradeTypeSelect';
import AllocationInput from '../../components/pitch/AllocationInput';
import PitchTextarea from '../../components/pitch/PitchTextarea';
import { validateAllocation } from '../../lib/utils';
import Chat from '~~/components/pitch/Chat';

import { useScaffoldWriteContract } from '~~/hooks/scaffold-eth';
import { parseEther } from 'viem';

export interface FormData {
  token: string;
  tradeType: string;
  allocation: string;
  pitch: string;
}

export interface AIResponse extends FormData {
  aiResponseText: string;
  success: boolean;
}

export default function Pitch() {
  const [formData, setFormData] = useState<FormData>({
    token: '',
    tradeType: '',
    allocation: '',
    pitch: '',
  });
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [messages, setMessages] = useState<AIResponse[]>([]);

  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract("YourContract");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate allocation
    const allocationValidation = validateAllocation(formData.allocation);
    if (!allocationValidation.isValid) {
      setStatus('error');
      setErrorMessage(allocationValidation.message || 'Invalid allocation');
      return;
    }

    // Validate pitch length
    if (formData.pitch.length < 1) {
      setStatus('error');
      setErrorMessage('Please ensure your pitch is at least 1 character.');
      return;
    }

    console.log('Form submitted:', formData);
    setErrorMessage('');
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setStatus('idle');
    setErrorMessage('');
  };

  const sendMessage = async () => {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userMessage: JSON.stringify(formData),
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Respuesta de OpenAI:", data);

      const aiResponse = JSON.parse(data.content);

      const newResponse: AIResponse = {
        ...formData,
        aiResponseText: aiResponse.aiResponseText,
        success: aiResponse.success,
      };

      setMessages(prevMessages => [...prevMessages, newResponse]);

    } else {
      console.error("Error al llamar a la API:", response.status);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Submit a Pitch</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <TokenSelect value={formData.token} onChange={handleChange} />
            <TradeTypeSelect value={formData.tradeType} onChange={handleChange} />
            <AllocationInput
              value={formData.allocation}
              onChange={handleChange}
            />
            <PitchTextarea value={formData.pitch} onChange={handleChange} />

            {status !== 'idle' && (
              <div
                className={`p-4 rounded-md ${status === 'success'
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
                  }`}
              >
                <p>{status === 'success' ? 'Pitch submitted successfully!' : errorMessage}</p>
              </div>
            )}

            <button
              className="w-full bg-gray-900 text-white py-3 px-6 rounded-md hover:bg-gray-800 transition-colors"
              onClick={async () => {
                try {
                  await writeYourContractAsync({
                    functionName: "setGreeting",
                    args: ["The value to set"],
                    value: parseEther("0.001"),
                  });                  
                  await sendMessage();
                  
                  setStatus('success');
                } catch (e) {
                  console.error("Error setting greeting:", e);
                  setStatus('error');
                  setErrorMessage('Error submitting pitch');
                }
              }}
            >
              Submit Pitch for 0.001 ETH
            </button>
          </form>
        </div>

        <Chat messages={messages} />
      </div>
    </div>
  );
}