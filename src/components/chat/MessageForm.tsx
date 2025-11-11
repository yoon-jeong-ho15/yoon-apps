import type { User } from "../../lib/types";
import { useRef, useState, useEffect } from "react";
import { useChatroom } from "../../contexts/ChatroomContext";
import { insertChat, fetchChatById } from "../../lib/data/chat";
import { supabase } from "../../lib/supabase";

export default function MessageForm({ user }: { user: User }) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isWaiting, setIsWaiting] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const chatroomContext = useChatroom()!;
  const isSubmitting = chatroomContext.isSubmitting;
  const setIsSubmitting = chatroomContext.setIsSubmitting;
  const selectedChatroom = chatroomContext.selectedChatroom;

  useEffect(() => {
    if (textareaRef.current && buttonRef.current) {
      const textarea = textareaRef.current;
      const button = buttonRef.current;
      const form = textarea.parentElement;

      textarea.value = "";
      textarea.style.height = "auto";
      setIsEmpty(true);

      if (!form) {
        return;
      }

      const formRect = form.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      const bottomPosition = formRect.height / 2 - buttonRect.height / 2;
      button.style.bottom = `${bottomPosition}px`;
    }
  }, [selectedChatroom]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isWaiting && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (remainingTime === 0 && isWaiting) {
      setIsWaiting(false);
    }

    return () => clearInterval(timer);
  }, [isWaiting, remainingTime]);

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    e.currentTarget.style.height = "auto";
    const newHeight = Math.min(e.currentTarget.scrollHeight, 160);
    e.currentTarget.style.height = newHeight + "px";

    const isZero = e.currentTarget.textLength === 0;
    setIsEmpty(isZero);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || isEmpty || isWaiting) {
      return;
    }
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const newMessageId = await insertChat(formData);
    const newMessage = await fetchChatById(newMessageId);

    const channel = supabase.channel(`ch${selectedChatroom}`);
    const result = await channel.send({
      type: "broadcast",
      event: "new-message",
      payload: newMessage,
    });

    if (result === "ok") {
      if (textareaRef.current) {
        textareaRef.current.value = "";
        setIsEmpty(true);
      }
      setIsSubmitting(false);
      setIsWaiting(true);
      setRemainingTime(10);
    } else {
      setIsSubmitting(false);
    }
  };

  if (!selectedChatroom) return null;

  return (
    <div className="">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-200 w-full pt-1 p-0.5 relative rounded-b-md items-center flex flex-row"
      >
        <div className="rounded-lg size-6 mx-2 bg-blue-400"></div>
        <textarea
          name="message"
          ref={textareaRef}
          className="bg-gray-100 px-4 py-3 resize-none min-h-10 max-h-40 focus:outline-1 outline-sky-400 -outline-offset-1 shadow rounded-lg w-10/12"
          rows={1}
          onInput={handleInput}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              const button = buttonRef.current;
              if (!isEmpty && !isWaiting) {
                button?.click();
              }
            }
          }}
        />
        {selectedChatroom && (
          <>
            <input type="hidden" name="user_id" value={user.id} />
            <input type="hidden" name="chatroom" value={selectedChatroom} />
            <button
              type="submit"
              ref={buttonRef}
              disabled={isEmpty || isSubmitting || isWaiting}
              className={`h-full max-h-8 rounded-2xl shadow w-20 absolute right-4 bottom-3.5 text-white
                  ${
                    isSubmitting
                      ? "bg-blue-400"
                      : isWaiting
                      ? "bg-amber-600"
                      : isEmpty
                      ? "bg-gray-200 hover:bg-gray-200"
                      : "bg-blue-600 hover:bg-blue-500 cursor-pointer"
                  }
                  `}
            >
              {isWaiting ? remainingTime : isSubmitting ? "전송중" : "전송"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
