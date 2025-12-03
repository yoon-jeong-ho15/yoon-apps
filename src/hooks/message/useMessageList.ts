import { useRef, useEffect } from "react";
import type { Message } from "../../types/message";

export function useMessageList(messages: Message[]) {
  const messageDivRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messageDivRef.current) {
      messageDivRef.current.scrollTop = messageDivRef.current.scrollHeight;
    }
  }, [messages]);

  return {
    messageDivRef,
  };
}
