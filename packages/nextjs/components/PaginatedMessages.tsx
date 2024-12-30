import { useEffect, useState } from "react";
import { AIResponse } from "@/utils/types/types";

/* eslint-disable */
function usePaginatedMessages() {
  const [messages, setMessages] = useState<AIResponse[]>([]);
  const [nextCursor, setNextCursor] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  async function fetchMessages(cursor?: number) {
    setLoading(true);
    const url = cursor ? `/api/messages?cursor=${cursor}` : "/api/messages";
    const response = await fetch(url);
    const data = await response.json();

    setMessages(prev => [...prev, ...data.data]);
    setNextCursor(data.nextCursor);
    setLoading(false);
  }

  useEffect(() => {
    fetchMessages(); // Initial fetch
  }, []);

  return { messages, fetchMore: () => fetchMessages(nextCursor), loading };
}
