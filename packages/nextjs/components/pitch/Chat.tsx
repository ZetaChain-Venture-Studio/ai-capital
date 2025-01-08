"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { AIResponse } from "~~/utils/types/types";

export default function Chat() {
  const { address } = useAccount();
  const [messages, setMessages] = useState<AIResponse[]>([]);
  const [showGlobal, setShowGlobal] = useState(true);
  const [limit, setLimit] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [cursorRecord, setCursorRecord] = useState<number[]>([]); // Almacena los cursos anteriores
  const [nextCursor, setNextCursor] = useState<number | null>(null); // Cursor para la próxima página
  const [previousFlag, setPreviousFlag] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLimit = Number(e.target.value);
    if (selectedLimit !== limit) {
      setLimit(selectedLimit);
    }
  };

  const getChat = async () => {
    setLoading(true);
    let _url = showGlobal
      ? `/api/paginated-chat?limit=${limit}`
      : `/api/paginated-chat?userAddress=${address}&limit=${limit}`;
    if (currentPage > 1 && nextCursor !== null) _url += `&cursor=${nextCursor}`;
    // console.log(`calling ${_url}`);

    const response = await fetch(_url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    // console.log(data);

    if (data) {
      setMessages(data.data);

      if (!previousFlag) {
        setNextCursor(data.nextCursor);
      } else {
        setPreviousFlag(false);
      }
      setLoading(false);
    }
  };

  const goToNextPage = () => {
    if (nextCursor !== null) {
      setCursorRecord(prev => [...prev, nextCursor]);
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (cursorRecord.length > 0) {
      // const correctIndex = nextCursor !== null ? 1 : 2;
      const previousCursor = cursorRecord[cursorRecord.length - 1];
      setCursorRecord(prev => prev.slice(0, -1));
      setNextCursor(previousCursor);
      setPreviousFlag(true);
      setCurrentPage(prev => prev - 1);
    }
  };

  useEffect(() => {
    getChat();
  }, [limit, showGlobal, currentPage]);

  useEffect(() => {
    if (!address) setShowGlobal(true);
  }, [address]);

  return (
    <div className="p-8 bg-white rounded-lg shadow-sm flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Chat</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGlobal(true)}
            className={`btn-sm bg-sky-600 text-white rounded-md px-4 ${showGlobal && "font-black"}`}
          >
            Global
          </button>
          <button
            onClick={() => setShowGlobal(false)}
            className={`btn-sm ${address ? "bg-sky-500" : "bg-stone-500"} text-white rounded-md px-4 ${!showGlobal && "font-black"}`}
            disabled={!address}
          >
            Private
          </button>
        </div>
      </div>

      <div className={`min-h-[200px] relative ${loading && "blur"}`}>
        {messages.length > 0 &&
          messages.map((message, index) => (
            <div key={index} className={`mb-4 p-6 rounded ${message.success ? "bg-green-100" : "bg-red-100"}`}>
              <div className="flex justify-between">
                <span className="font-bold">
                  {"User: "}
                  <span className="font-normal">
                    {message.userAddress.slice(0, 6)}...{message.userAddress.slice(-6)}
                  </span>
                </span>
                <span className="font-bold">
                  {"Score: "}
                  <span className="font-normal">999</span>
                </span>
              </div>
              <p>{message.pitch}</p>
              <p className={message.success ? "text-green-600 font-semibold" : "text-red-600"}>
                <strong>AI:</strong> {message.aiResponseText}
              </p>
              <p className="text-sm text-gray-500">
                {message.tradeType} {message.allocation}% of {message.token}
              </p>
            </div>
          ))}
      </div>

      <div className="w-full flex gap-2 justify-center items-center">
        <button
          onClick={goToPreviousPage}
          className={`btn-sm ${cursorRecord.length > 0 ? "bg-sky-500" : "bg-stone-500"} text-white rounded-md px-4 font-bold`}
          disabled={cursorRecord.length === 0}
        >
          {"<< Prev"}
        </button>
        <div className="btn-sm bg-sky-500 text-white rounded-md px-4 py-2 font-bold">{currentPage}</div>
        <button
          onClick={goToNextPage}
          className={`btn-sm ${nextCursor !== null ? "bg-sky-500" : "bg-stone-500"} text-white rounded-md px-4 font-bold`}
          disabled={nextCursor === null}
        >
          {"Next >>"}
        </button>

        <select
          id="limit-select"
          name="limit-select"
          onChange={handleSelectChange}
          className="bg-white rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
        </select>
      </div>
    </div>
  );
}
