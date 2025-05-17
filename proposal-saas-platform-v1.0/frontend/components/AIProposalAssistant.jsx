
import React, { useState } from 'react';

export default function AIProposalAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const token = localStorage.getItem('token');

  const sendMessage = async () => {
    const res = await fetch('http://localhost:8000/ai/proposal/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message: input })
    });
    const data = await res.json();
    setMessages(prev => [...prev, { role: 'user', text: input }, { role: 'ai', text: data.response }]);
    setInput('');
  };

  return (
    <div>
      <h2>🤖 AI Proposal Assistant</h2>
      <div style={{ background: '#f0f0f0', padding: '1rem', marginBottom: '1rem', height: '300px', overflowY: 'auto' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: '0.75rem' }}>
            <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask the AI..." style={{ width: '80%' }} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
