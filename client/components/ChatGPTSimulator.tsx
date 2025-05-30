import { useState, useRef, useEffect, FormEvent } from "react";
import { motion } from "framer-motion";
import { createChatStream } from "../lib/chatAgent";
// import { Subscription } from "rxjs";

type Message = {
  from: "user" | "gpt";
  text: string;
};

export const ChatGPTSimulator: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isTyping]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    const threadId = "thread-1";
    const runId = crypto.randomUUID();

    const inputData = {
      threadId,
      runId,
      messages: [{ role: "user" as const, content: input }],
      tools: [],
      context: [],
    };

    let currentText = "";
    createChatStream(inputData).subscribe({
      next: (event) => {
        if (event.type === "TEXT_MESSAGE_CONTENT") {
          currentText += event.delta;
          setMessages((prev) => {
            const others = prev.filter((m) => m.from !== "gpt");
            return [...others, { from: "gpt", text: currentText }];
          });
        } else if (event.type === "RUN_FINISHED") {
          setIsTyping(false);
        } else if (event.type === "RUN_ERROR") {
          setIsTyping(false);
          setMessages((prev) => [...prev, { from: "gpt", text: "⚠️ Error del servidor" }]);
        }
      },
      error: (err) => {
        console.error(err);
        setIsTyping(false);
        setMessages((prev) => [...prev, { from: "gpt", text: "❌ Error de conexión" }]);
      },
      complete: () => {
        setIsTyping(false);
      },
    });
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-gray-100 rounded-lg shadow-md flex flex-col h-[600px]">
      <div className="overflow-y-auto flex-1 space-y-2 p-2">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className={`p-3 rounded-lg max-w-[80%] whitespace-pre-wrap ${
              msg.from === "gpt"
                ? "bg-white text-black self-start"
                : "bg-green-500 text-white self-end"
            }`}
          >
            {msg.text}
          </motion.div>
        ))}
        {isTyping && (
          <motion.div
            className="text-gray-500 px-4 py-2"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          >
            ChatGPT está escribiendo<span className="animate-pulse">...</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Escribe tu mensaje aquí..."
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Enviar
        </button>
      </form>
    </div>
  );
};
