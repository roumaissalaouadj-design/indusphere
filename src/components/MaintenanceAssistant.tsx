'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function MaintenanceAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)
    try {
      const res = await fetch('/api/ai/maintenance-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ حدث خطأ، حاول مجدداً.' }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ تعذر الاتصال بالمساعد.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatMessage = (text: string) => {
    return text
      .replace(/## (.*)/g, '<div style="color:#f59e0b;font-weight:700;margin:12px 0 4px">$1</div>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/- (.*)/g, '<div style="padding:2px 0 2px 12px;color:#94a3b8">• $1</div>')
      .replace(/\n/g, '<br/>')
  }

  const chatWindowStyle: React.CSSProperties = isMobile ? {
    position: 'fixed',
    bottom: '5rem',
    left: '0.5rem',
    right: '0.5rem',
    width: 'auto',
    height: '70vh',
    maxHeight: '500px',
    backgroundColor: '#0d1425',
    border: '1px solid #1e2d4a',
    borderRadius: '1rem',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 999,
    boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
    overflow: 'hidden',
  } : {
    position: 'fixed',
    bottom: '6rem',
    left: '2rem',
    width: '380px',
    height: '520px',
    backgroundColor: '#0d1425',
    border: '1px solid #1e2d4a',
    borderRadius: '1rem',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 999,
    boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
    overflow: 'hidden',
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          left: '1.5rem',
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: '#f59e0b',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.4rem',
          boxShadow: '0 4px 20px rgba(245,158,11,0.4)',
          zIndex: 1000,
          transition: 'all 0.3s',
        }}
        title="مساعد الصيانة الذكي"
      >
        {open ? '✕' : '🤖'}
      </button>

      {/* Chat Window */}
      {open && (
        <div style={chatWindowStyle} dir="rtl">
          {/* Header */}
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid #1e2d4a',
            backgroundColor: '#131d35',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              backgroundColor: 'rgba(245,158,11,0.15)',
              border: '1px solid rgba(245,158,11,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', flexShrink: 0,
            }}>🤖</div>
            <div>
              <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.9rem' }}>مساعد الصيانة الذكي</div>
              <div style={{ color: '#10b981', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                متصل
              </div>
            </div>
            <button onClick={() => setMessages([])}
              style={{ marginRight: 'auto', backgroundColor: 'transparent', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '0.75rem' }}>
              مسح
            </button>
            {isMobile && (
              <button onClick={() => setOpen(false)}
                style={{ backgroundColor: 'transparent', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '1rem' }}>
                ✕
              </button>
            )}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: '#475569', fontSize: '0.8rem', marginTop: '1rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔧</div>
                <p>صف المشكلة أو العطل وسأساعدك في التشخيص</p>
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {['المضخة تصدر صوتاً غريباً', 'المحرك يسخن بشكل زائد', 'تسرب زيت في الناقل'].map(suggestion => (
                    <button key={suggestion} onClick={() => setInput(suggestion)}
                      style={{
                        backgroundColor: '#131d35', border: '1px solid #1e2d4a',
                        borderRadius: '0.5rem', padding: '0.4rem 0.75rem',
                        color: '#94a3b8', fontSize: '0.75rem', cursor: 'pointer',
                        textAlign: 'right',
                      }}>
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                gap: '0.5rem', alignItems: 'flex-start',
              }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                  backgroundColor: msg.role === 'user' ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem',
                }}>
                  {msg.role === 'user' ? '👤' : '🤖'}
                </div>
                <div style={{
                  maxWidth: '85%',
                  backgroundColor: msg.role === 'user' ? 'rgba(245,158,11,0.1)' : '#131d35',
                  border: `1px solid ${msg.role === 'user' ? 'rgba(245,158,11,0.2)' : '#1e2d4a'}`,
                  borderRadius: msg.role === 'user' ? '1rem 0.25rem 1rem 1rem' : '0.25rem 1rem 1rem 1rem',
                  padding: '0.625rem 0.875rem', fontSize: '0.8rem', color: '#f1f5f9', lineHeight: 1.6,
                }}
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                />
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>🤖</div>
                <div style={{ backgroundColor: '#131d35', border: '1px solid #1e2d4a', borderRadius: '0.25rem 1rem 1rem 1rem', padding: '0.75rem 1rem' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#475569', animation: `bounce 1s infinite ${i * 0.2}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '0.75rem', borderTop: '1px solid #1e2d4a', display: 'flex', gap: '0.5rem' }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="صف المشكلة أو العطل..."
              rows={1}
              style={{
                flex: 1, backgroundColor: '#131d35', border: '1px solid #1e2d4a',
                borderRadius: '0.5rem', padding: '0.5rem 0.75rem',
                color: '#f1f5f9', fontSize: '0.8rem', outline: 'none',
                resize: 'none', fontFamily: 'inherit',
              }}
            />
            <button onClick={sendMessage} disabled={!input.trim() || loading}
              style={{
                backgroundColor: input.trim() && !loading ? '#f59e0b' : '#131d35',
                border: '1px solid #1e2d4a', borderRadius: '0.5rem', padding: '0.5rem 0.75rem',
                color: input.trim() && !loading ? '#0a0f1e' : '#475569',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                fontWeight: 700, fontSize: '0.875rem',
              }}>
              إرسال
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </>
  )
}