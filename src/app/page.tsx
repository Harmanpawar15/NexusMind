

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";

type Message = {
  role: "user" | "ai";
  content: string;
  timestamp: string;
};

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: "Hello! How can I help you today?",
      timestamp: dayjs().format("hh:mm A"),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [urlsInput, setUrlsInput] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  const handleSend = async () => {
    if (!message.trim() || !urlsInput.trim()) return;

    const timestamp = dayjs().format("hh:mm A");
    const userMessage: Message = { role: "user", content: message, timestamp };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const urls = urlsInput
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          urls,
          question: message,
        }),
      });

      const data = await response.json();

      const aiMessage: Message = {
        role: "ai",
        content: data.answer || `Error: ${data.error}`,
        timestamp: dayjs().format("hh:mm A"),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: "ai",
        content: "Something went wrong.",
        timestamp: dayjs().format("hh:mm A"),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  
  const handleShare = async () => {
    try {
      const res = await fetch("/api/save_chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messages),
      });
  
      const data = await res.json();
      if (data.id) {
        const shareUrl = `${window.location.origin}/?chat=${data.id}`;
        await navigator.clipboard.writeText(shareUrl);
        alert("Share link copied to clipboard!");
      }
    } catch (err) {
      alert("Failed to share conversation.");
    }
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    // Load shared chat
  const params = new URLSearchParams(window.location.search);
  const chatId = params.get("chat");
  if (chatId) {
    fetch(`/api/save_chat?id=${chatId}`)
      .then(res => res.json())
      .then(data => {
        if (data.messages) {
          setMessages(data.messages);
        }
      })
      .catch(() => alert("Failed to load shared chat."));
  }
  }, [darkMode]);

  

  return (
    <div
      className={`flex flex-col h-screen ${
        darkMode ? "bg-black text-white" : "bg-white text-black"
      } transition-all`}
    >
      {/* Header */}
      <header className="w-full p-5 border-b dark:border-gray-800 border-gray-300 shadow-md sticky top-0 bg-white dark:bg-gray-900 z-10 flex justify-between items-center">
  <div>
    <h1 className="text-2xl font-bold text-cyan-500">Web Scraper AI Chat</h1>
    <p className="text-sm text-gray-500 dark:text-gray-400">
      Ask anything based on provided URLs.
    </p>
  </div>
  <div className="flex gap-2">
    <button
      onClick={handleShare}
      className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-xl shadow hover:bg-green-700 transition"
    >
      Share
    </button>
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="text-sm bg-cyan-600 text-white px-3 py-1.5 rounded-xl shadow hover:bg-cyan-700 transition"
    >
      Toggle {darkMode ? "Light" : "Dark"} Mode
    </button>
  </div>
</header>


      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
        <div className="max-w-4xl mx-auto space-y-5">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div className="flex gap-2 max-w-[80%] md:max-w-[70%] items-end">
                  <div className="text-2xl">
                    {msg.role === "user" ? "🙂" : "🧠"}
                  </div>
                  <div
                    className={`px-5 py-3 rounded-2xl shadow ${
                      msg.role === "user"
                        ? "bg-cyan-600 text-white rounded-br-none"
                        : "bg-gray-100 dark:bg-gray-800 dark:text-white text-gray-900 rounded-bl-none"
                    }`}
                  >
                    <p>{msg.content}</p>
                    <div className="text-xs mt-2 text-gray-400">
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex gap-2 max-w-[70%] items-center">
                <div className="text-2xl">🧠</div>
                <div className="px-5 py-3 rounded-2xl bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 animate-pulse">
                  <span className="inline-flex gap-1">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer Inputs */}
      <footer className="w-full border-t border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto space-y-3">
          <input
            value={urlsInput}
            onChange={(e) => setUrlsInput(e.target.value)}
            placeholder="Enter URLs (comma separated)..."
            className="w-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-500 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <div className="flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your question..."
              className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-500 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-5 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
