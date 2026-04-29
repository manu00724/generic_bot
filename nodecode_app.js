import React, { useState, useRef, useEffect } from 'react';

export default function LangGraphChat() {
  // --- State Management ---
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      content: 'Hello! I am your LangGraph assistant. I can help execute tasks, but I might pause to ask for your permission before doing anything sensitive.',
      requiresAction: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Create a pseudo-random session ID for LangGraph thread memory
  const [sessionId] = useState(() => "thread-" + Math.random().toString(36).substr(2, 9));
  
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // --- Handlers ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 1. Add user message to UI
    const userMsg = { id: Date.now(), role: 'user', content: input, requiresAction: false };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // 2. TODO: Connect to your actual LangGraph API
    /*
      try {
        const response = await fetch('http://localhost:8000/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ thread_id: sessionId, message: userMsg.content })
        });
        const data = await response.json();
        
        setIsTyping(false);
        setMessages(prev => [...prev, { 
          id: Date.now(), 
          role: 'bot', 
          content: data.reply, 
          requiresAction: data.status === 'requires_action' 
        }]);
      } catch (error) { ... }
    */

    // Mock Backend Response (Remove this when you connect your API)
    setTimeout(() => {
      setIsTyping(false);
      const isSensitive = userMsg.content.toLowerCase().includes('delete') || userMsg.content.toLowerCase().includes('execute');
      
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: 'bot',
          content: isSensitive 
            ? "I am about to execute a sensitive tool. Do you approve this action?" 
            : "I received your message! If you ask me to 'delete' or 'execute' something, I will trigger the Human-in-the-Loop workflow.",
          requiresAction: isSensitive,
        },
      ]);
    }, 1500);
  };

  const handleHitlAction = (messageId, action) => {
    // Remove the buttons from the UI immediately
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, requiresAction: false, content: `${msg.content} (Action: ${action.toUpperCase()})` } : msg
      )
    );

    // Add user's decision to the chat
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: 'user', content: `I ${action} the action.`, requiresAction: false },
    ]);
    
    setIsTyping(true);

    // TODO: Send the decision to LangGraph to resume the graph
    // fetch('http://localhost:8000/resume', { ... })

    // Mock response after approval/rejection
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: 'bot', content: `Understood. I have ${action === 'approve' ? 'executed' : 'cancelled'} the task successfully.`, requiresAction: false },
      ]);
    }, 1500);
  };

  return (
    <div className="bg-gray-900 text-gray-100 h-screen flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold shadow-lg">AI</div>
          <div>
            <h1 className="font-semibold text-lg">Agentic Assistant</h1>
            <p className="text-xs text-green-400 flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-1 inline-block"></span> Online
            </p>
          </div>
        </div>
        <div className="text-xs text-gray-400 bg-gray-700 px-3 py-1 rounded-full">
          Session ID: <span>{sessionId}</span>
        </div>
      </header>

      {/* Chat Container */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6 flex flex-col custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col space-y-2 max-w-[80%] animate-fade-in ${msg.role === 'user' ? 'self-end' : 'self-start'}`}>
            <div className={`p-4 rounded-2xl text-sm shadow-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-sm' 
                : 'bg-gray-800 border border-gray-700 text-gray-200 rounded-tl-sm'
            }`}>
              {msg.content}
            </div>

            {/* Human-in-the-Loop Buttons */}
            {msg.requiresAction && (
              <div className="flex space-x-2 mt-2">
                <button 
                  onClick={() => handleHitlAction(msg.id, 'approve')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Approve Action
                </button>
                <button 
                  onClick={() => handleHitlAction(msg.id, 'reject')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Reject Action
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex flex-col space-y-2 max-w-[80%] self-start animate-fade-in">
            <div className="bg-gray-800 border border-gray-700 p-4 rounded-2xl rounded-tl-sm flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
        
        {/* Invisible div to anchor the auto-scroll */}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="bg-gray-800 border-t border-gray-700 p-4">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-400"
            placeholder="Message the assistant..."
            autoComplete="off"
            disabled={isTyping}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors focus:outline-none disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
        <div className="text-center text-xs text-gray-500 mt-2">
          LLMs can make mistakes. Consider verifying important information.
        </div>
      </footer>

      {/* Basic global styles for scrollbar and animations */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4B5563; border-radius: 10px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
      `}} />
    </div>
  );
}
