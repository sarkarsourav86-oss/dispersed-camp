import { useState, useRef, useEffect } from 'react';
import { SendFill, ThreeDots } from 'react-bootstrap-icons';
import type { ChatMessage } from '../../types';

interface TripChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  spotName: string;
  routeReady: boolean;
}

export default function TripChat({ messages, onSendMessage, isLoading, spotName, routeReady }: TripChatProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    onSendMessage(text);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="px-4 py-3 border-b border-stone-800">
        <p className="text-xs text-stone-400 uppercase tracking-wide font-semibold">Trip Assistant</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {/* Welcome message */}
        {messages.length === 0 && !isLoading && (
          <div className="bg-stone-800 rounded-xl rounded-tl-sm p-3 max-w-[85%]">
            <p className="text-sm text-stone-200">
              {routeReady ? (
                <>I can help plan your trip to <span className="font-medium text-amber-400">{spotName}</span>. I know all the services along your route. Ask me to add fuel stops, find water, plan overnight stays, or anything else.</>
              ) : (
                <>Scanning for services along your route to <span className="font-medium text-amber-400">{spotName}</span>...</>
              )}
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`rounded-xl p-3 max-w-[85%] text-sm ${
                msg.role === 'user'
                  ? 'bg-amber-500 text-stone-950 rounded-tr-sm'
                  : 'bg-stone-800 text-stone-200 rounded-tl-sm'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-stone-800 rounded-xl rounded-tl-sm p-3">
              <ThreeDots size={20} className="text-stone-400 animate-pulse" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-stone-800">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={routeReady ? "Add fuel stops along the way..." : "Scanning route for services..."}
            className="flex-1 bg-stone-800 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/50"
            disabled={isLoading || !routeReady}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || !routeReady}
            className="p-2.5 bg-amber-500 text-stone-950 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-400 transition-colors"
          >
            <SendFill size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
