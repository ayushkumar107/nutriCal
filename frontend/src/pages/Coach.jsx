import { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const quickPrompts = [
  { text: 'What should I eat right now?', icon: '🍽️' },
  { text: 'How am I doing today?', icon: '📊' },
  { text: 'I ate 3 eggs and bread, is it good?', icon: '🥚' },
  { text: 'Suggest a high-protein snack', icon: '💪' },
  { text: 'Am I on track for my goal?', icon: '🎯' },
  { text: 'Give me a meal plan for today', icon: '📋' },
];

const Coach = () => {
  const { user, loading } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Welcome message
  useEffect(() => {
    if (user && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Hey ${user.name}! 👋 I'm your AI Diet Coach. I know your goal is **${user.goal}** and I can see everything you've eaten today.\n\nAsk me anything — what to eat next, whether a meal fits your goals, or get a full meal plan. Let's crush it! 💪`,
      }]);
    }
  }, [user]);

  const sendMessage = async (text) => {
    const userMessage = text || input.trim();
    if (!userMessage || isTyping) return;

    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      // Build history for context (exclude the welcome message)
      const history = newMessages
        .filter((_, i) => i > 0) // skip welcome
        .map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          content: m.content,
        }));

      const res = await axios.post('/chat', {
        message: userMessage,
        history: history.slice(0, -1), // don't include current message in history
      });

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.data.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '😔 Sorry, I had a hiccup. Try asking again!',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleQuickPrompt = (text) => {
    sendMessage(text);
  };

  if (loading) return <div className="main-content" style={{ textAlign: 'center' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  // Simple markdown-like rendering for bold text
  const renderContent = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      // Handle newlines
      return part.split('\n').map((line, j) => (
        <span key={`${i}-${j}`}>
          {j > 0 && <br />}
          {line}
        </span>
      ));
    });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 65px)', // subtract header height
      maxWidth: '800px',
      margin: '0 auto',
      width: '100%',
    }}>
      {/* Chat Header */}
      <div style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0ea5e9, #a855f7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.25rem',
          flexShrink: 0,
        }}>🧠</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>NutriCoach AI</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--accent-success)',
              display: 'inline-block',
              animation: 'pulse-glow 2s ease-in-out infinite',
            }}></span>
            Online • Knows your {user.goal} goal
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        {/* Quick Prompts (shown when few messages) */}
        {messages.length <= 1 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            justifyContent: 'center',
            marginBottom: '0.5rem',
          }}>
            {quickPrompts.map((prompt) => (
              <button
                key={prompt.text}
                onClick={() => handleQuickPrompt(prompt.text)}
                className="quick-prompt-btn"
                style={{
                  background: 'rgba(14, 165, 233, 0.1)',
                  border: '1px solid rgba(14, 165, 233, 0.3)',
                  color: 'var(--text-accent)',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '2rem',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {prompt.icon} {prompt.text}
              </button>
            ))}
          </div>
        )}

        {/* Chat Messages */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className="animate-fade-in"
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              gap: '0.5rem',
              animationDelay: `${i * 0.05}s`,
            }}
          >
            {msg.role === 'assistant' && (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0ea5e9, #a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
                flexShrink: 0,
                marginTop: '0.25rem',
              }}>🧠</div>
            )}
            <div style={{
              maxWidth: '75%',
              padding: '0.85rem 1.1rem',
              borderRadius: msg.role === 'user'
                ? '1.25rem 1.25rem 0.25rem 1.25rem'
                : '1.25rem 1.25rem 1.25rem 0.25rem',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
                : 'var(--bg-card)',
              border: msg.role === 'user' ? 'none' : '1px solid var(--border-color)',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              color: 'var(--text-primary)',
              boxShadow: msg.role === 'user' ? '0 2px 12px rgba(14,165,233,0.25)' : 'none',
            }}>
              {renderContent(msg.content)}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0ea5e9, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              flexShrink: 0,
            }}>🧠</div>
            <div style={{
              padding: '0.85rem 1.1rem',
              borderRadius: '1.25rem 1.25rem 1.25rem 0.25rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              gap: '0.35rem',
              alignItems: 'center',
            }}>
              <span className="typing-dot" style={{ animationDelay: '0s' }}></span>
              <span className="typing-dot" style={{ animationDelay: '0.15s' }}></span>
              <span className="typing-dot" style={{ animationDelay: '0.3s' }}></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} style={{
        padding: '1rem 1.5rem',
        borderTop: '1px solid var(--border-color)',
        background: 'var(--bg-card)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'center',
      }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your diet coach..."
          disabled={isTyping}
          style={{
            flex: 1,
            padding: '0.85rem 1.1rem',
            borderRadius: '2rem',
            border: '1px solid var(--border-color)',
            background: 'rgba(0,0,0,0.25)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
        />
        <button
          type="submit"
          disabled={isTyping || !input.trim()}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: 'none',
            background: isTyping || !input.trim()
              ? 'rgba(14,165,233,0.3)'
              : 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            color: 'white',
            fontSize: '1.2rem',
            cursor: isTyping || !input.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
        >
          ➤
        </button>
      </form>
    </div>
  );
};

export default Coach;
