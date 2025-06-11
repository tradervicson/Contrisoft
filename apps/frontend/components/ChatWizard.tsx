"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import BuildSheet from './BuildSheet';

// Types
type Role = 'system' | 'user' | 'assistant';
interface ChatMessage {
  role: Role;
  content: string;
}

type ResponseType = 'text' | 'choices' | 'table' | 'areas';
interface Question {
  id: string;
  text: string;
  responseType: ResponseType;
  choices?: string[];
  allowCustom?: boolean;
  multiSelect?: boolean;
  floorCount?: number;
  roomTypes?: string[];
  publicAreas?: string[];
}

interface ChatResponse {
  question?: Question;
  model?: any;
  message?: string;
  error?: string;
}

interface FloorRoomMix {
  floorIndex: number;
  roomsByType: Record<string, number>;
}

interface PublicAreaSelection {
  area: string;
  enabled: boolean;
  size: number;
}

// Styles
const containerStyle: React.CSSProperties = {
  width: '100%',
  minHeight: '500px',
  maxHeight: '80vh',
  display: 'flex',
  flexDirection: 'column',
  background: 'var(--white)',
  borderRadius: 'var(--border-radius)',
  border: '1px solid var(--medium-gray)',
  overflow: 'hidden'
};
const messagesStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '1rem',
  background: 'var(--light-gray)'
};
const inputAreaStyle: React.CSSProperties = {
  borderTop: '1px solid var(--medium-gray)',
  padding: '1rem',
  background: 'var(--white)'
};

export default function ChatWizard() {
  const initialSystemMessage: ChatMessage = { role: 'system', content: 'You are Contrisoft, a hotel planning assistant. Ask one question at a time to gather necessary hotel specs.' };
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for different input types - always declare at top level
  const [selected, setSelected] = useState<string[]>([]);
  const [mix, setMix] = useState<FloorRoomMix[]>([]);
  const [sel, setSel] = useState<PublicAreaSelection[]>([]);

  const resetConversation = () => {
    setMessages([initialSystemMessage]);
    setCurrentQuestion(null);
    setError(null);
    setLoading(false);
    setSelected([]);
    setMix([]);
    setSel([]);
  };

  // Initialize conversation
  useEffect(() => {
    setMessages([initialSystemMessage]);
  }, []);

  // Reset input states when question changes
  useEffect(() => {
    if (currentQuestion) {
      setSelected([]);
      if (currentQuestion.responseType === 'table') {
        const floors = currentQuestion.floorCount || 1;
        const types = currentQuestion.roomTypes || [];
        setMix(Array.from({ length: floors }, (_, idx) => ({ 
          floorIndex: idx + 1, 
          roomsByType: types.reduce((acc, t) => ({ ...acc, [t]: 0 }), {}) 
        })));
      } else {
        setMix([]);
      }
      if (currentQuestion.responseType === 'areas') {
        const areas = currentQuestion.publicAreas || [];
        setSel(areas.map(a => ({ area: a, enabled: false, size: 0 })));
      } else {
        setSel([]);
      }
    }
  }, [currentQuestion]);

  const callChatApi = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please log in to continue');
      }

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ messages })
      });
      const data: ChatResponse = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.model) {
        // Completed - show success message
        const successMessage = data.message || "Perfect! I've created your hotel base model.";
        setMessages(prev => [...prev, { role: 'assistant', content: successMessage }]);
        
        // Redirect after a brief delay to show the success message
        setTimeout(() => {
          router.push('/projects');
        }, 2000);
        return;
      }
      if (data.question) {
        // Append assistant question
        setMessages(prev => [...prev, { role: 'assistant', content: data.question!.text }]);
        setCurrentQuestion(data.question);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [messages, router]);

  // Trigger API call when messages change and no question pending
  useEffect(() => {
    if (messages.length > 0 && !currentQuestion && !loading) {
      callChatApi();
    }
  }, [messages, currentQuestion, loading, callChatApi]);

  const handleUserAnswer = (answer: string | string[] | FloorRoomMix[] | PublicAreaSelection[]) => {
    const content = typeof answer === 'string' ? answer : JSON.stringify(answer);
    setMessages(prev => [...prev, { role: 'user', content }]);
    setCurrentQuestion(null);
  };

  // Render message bubbles
  const renderMessages = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {messages.map((m, i) => {
        if (m.role === 'system') return null;
        const isUser = m.role === 'user';
        const bubbleStyle: React.CSSProperties = {
          maxWidth: '80%',
          padding: '1rem 1.5rem',
          alignSelf: isUser ? 'flex-end' : 'flex-start',
          background: isUser ? 'var(--primary-blue)' : 'var(--white)',
          color: isUser ? 'var(--white)' : 'var(--dark-gray)',
          borderRadius: isUser ? '1.5rem 1.5rem 0.5rem 1.5rem' : '1.5rem 1.5rem 1.5rem 0.5rem',
          boxShadow: 'var(--shadow-sm)',
          border: isUser ? 'none' : '1px solid var(--medium-gray)',
          fontSize: '1rem',
          lineHeight: '1.5'
        };
        
        return (
          <div key={i} style={bubbleStyle}>
            {isUser && <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.5rem' }}>You</div>}
            {!isUser && <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.5rem', color: 'var(--primary-blue)' }}>🏨 Assistant</div>}
            {m.content}
          </div>
        );
      })}
    </div>
  );

  // Input UI per question type
  const renderInput = () => {
    if (error) {
      return (
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <p style={{ color: 'var(--danger-red)', marginBottom: '1rem' }}>❌ {error}</p>
          <button onClick={callChatApi} className="btn-primary">Try Again</button>
        </div>
      );
    }
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              border: '2px solid var(--medium-gray)',
              borderTop: '2px solid var(--primary-blue)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
          <p style={{ color: 'var(--secondary-gray)', margin: 0 }}>Assistant is typing...</p>
        </div>
      );
    }
    if (!currentQuestion) return null;
    const q = currentQuestion;
    switch (q.responseType) {
      case 'text': {
        let input = '';
        return (
          <form onSubmit={e => { e.preventDefault(); if (input.trim()) handleUserAnswer(input); }} style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              autoFocus 
              type="text" 
              aria-label="Your answer" 
              placeholder="Type your answer here..." 
              onChange={e => { input = e.target.value; }} 
              style={{ 
                flex: 1,
                padding: '0.75rem 1rem',
                border: '2px solid var(--medium-gray)',
                borderRadius: 'var(--border-radius)',
                fontSize: '1rem'
              }} 
            />
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ 
                padding: '0.75rem 1.5rem',
                whiteSpace: 'nowrap'
              }}
            >
              Send
            </button>
          </form>
        );
      }
      case 'choices': {
        if (q.multiSelect) {
          const toggleSelection = (choice: string) => {
            setSelected(prev => prev.includes(choice) ? prev.filter(c => c !== choice) : [...prev, choice]);
          };
          return <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              {q.choices?.map(choice => (
                <button 
                  key={choice} 
                  onClick={() => toggleSelection(choice)} 
                  style={{ 
                    padding: '0.75rem 1.25rem', 
                    transition: 'all 0.2s',
                    background: selected.includes(choice) ? 'var(--primary-blue)' : 'var(--white)',
                    color: selected.includes(choice) ? 'var(--white)' : 'var(--primary-blue)',
                    border: `2px solid var(--primary-blue)`,
                    borderRadius: 'var(--border-radius)',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {selected.includes(choice) ? '✓ ' : ''}{choice}
                </button>
              ))}
            </div>
            <button 
              onClick={() => handleUserAnswer(selected)} 
              disabled={selected.length === 0}
              className="btn-primary"
              style={{ 
                padding: '0.75rem 1.5rem', 
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              Continue with {selected.length} selected
            </button>
          </div>;
        } else {
          return <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {q.choices?.map(choice => (
              <button 
                key={choice} 
                onClick={() => handleUserAnswer(choice)} 
                className="btn-outline"
                style={{ 
                  padding: '0.75rem 1.25rem', 
                  transition: 'all 0.2s',
                  background: 'var(--white)',
                  color: 'var(--primary-blue)',
                  border: '2px solid var(--primary-blue)',
                  borderRadius: 'var(--border-radius)',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)'
                }} 
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--primary-blue)';
                  e.currentTarget.style.color = 'var(--white)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--white)';
                  e.currentTarget.style.color = 'var(--primary-blue)';
                }}
              >
                {choice}
              </button>
            ))}
            {q.allowCustom && (
              <button 
                onClick={() => {
                  const custom = prompt('Please enter your custom option:');
                  if (custom) handleUserAnswer(custom);
                }} 
                style={{ 
                  padding: '0.75rem 1.25rem',
                  background: 'var(--warning-orange)',
                  color: 'var(--white)',
                  border: '2px solid var(--warning-orange)',
                  borderRadius: 'var(--border-radius)',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                Other (Custom)
              </button>
            )}
          </div>;
        }
      }
      case 'table': {
        // Floor/room mix editor
        const floors = q.floorCount || 1;
        const types = q.roomTypes || [];
        const updateCell = (floorIdx: number, type: string, value: number) => {
          setMix(prev => prev.map(row => row.floorIndex === floorIdx ? { ...row, roomsByType: { ...row.roomsByType, [type]: value } } : row));
        };
        return (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem',
            maxHeight: '60vh' // Limit the table area height
          }}>
            <div style={{ 
              flex: '1',
              overflowY: 'auto',
              overflowX: 'auto',
              border: '1px solid var(--medium-gray)',
              borderRadius: 'var(--border-radius)',
              background: 'var(--white)'
            }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                background: 'var(--white)',
                minWidth: `${Math.max(400, types.length * 100 + 200)}px` // Ensure minimum width
              }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                  <tr style={{ background: 'var(--primary-blue)', color: 'var(--white)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', minWidth: '100px' }}>Floor</th>
                    {types.map(t => (
                      <th key={t} style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', minWidth: '120px' }}>{t}</th>
                    ))}
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', minWidth: '80px' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {mix.map((row, index) => (
                    <tr key={row.floorIndex} style={{ 
                      background: index % 2 === 0 ? 'var(--light-gray)' : 'var(--white)',
                      borderBottom: '1px solid var(--medium-gray)'
                    }}>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>Floor {row.floorIndex}</td>
                      {types.map(t => (
                        <td key={t} style={{ padding: '0.5rem', textAlign: 'center' }}>
                          <input 
                            type="number" 
                            aria-label={`Floor ${row.floorIndex} ${t} count`} 
                            min={0} 
                            value={row.roomsByType[t]} 
                            onChange={e => updateCell(row.floorIndex, t, Number(e.target.value))} 
                            style={{ 
                              width: '70px',
                              padding: '0.5rem',
                              border: '1px solid var(--medium-gray)',
                              borderRadius: 'var(--border-radius)',
                              textAlign: 'center',
                              fontSize: '0.9rem'
                            }} 
                          />
                        </td>
                      ))}
                      <td style={{ 
                        padding: '1rem', 
                        textAlign: 'center',
                        fontWeight: '600',
                        color: 'var(--primary-blue)'
                      }}>
                        {Object.values(row.roomsByType).reduce((a, b) => a + b, 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot style={{ position: 'sticky', bottom: 0, zIndex: 10 }}>
                  <tr style={{ 
                    background: 'var(--primary-blue)', 
                    color: 'var(--white)',
                    fontWeight: '600'
                  }}>
                    <td style={{ padding: '1rem' }}>Total</td>
                    {types.map(t => (
                      <td key={t} style={{ padding: '1rem', textAlign: 'center' }}>
                        {mix.reduce((sum, r) => sum + r.roomsByType[t], 0)}
                      </td>
                    ))}
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      {mix.reduce((a, r) => a + Object.values(r.roomsByType).reduce((x, y) => x + y, 0), 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            {/* Always visible submit button */}
            <div style={{ 
              textAlign: 'center',
              padding: '1rem',
              background: 'var(--white)',
              borderTop: '1px solid var(--medium-gray)',
              borderRadius: 'var(--border-radius)'
            }}>
              <button 
                onClick={() => handleUserAnswer(mix)} 
                className="btn-primary"
                style={{ 
                  padding: '0.75rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                Continue with Room Layout
              </button>
            </div>
          </div>
        );
      }
      case 'areas': {
        const areas = q.publicAreas || [];
        const toggleArea = (area: string, enabled: boolean) => {
          setSel(prev => prev.map(s => s.area === area ? { ...s, enabled, size: enabled ? s.size || 100 : 0 } : s));
        };
        const updateSize = (area: string, size: number) => {
          setSel(prev => prev.map(s => s.area === area ? { ...s, size } : s));
        };
        return (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem',
            maxHeight: '60vh' // Limit the areas section height
          }}>
            {/* Scrollable areas grid */}
            <div style={{ 
              flex: '1',
              overflowY: 'auto',
              padding: '0.5rem',
              border: '1px solid var(--medium-gray)',
              borderRadius: 'var(--border-radius)',
              background: 'var(--white)'
            }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '1rem'
              }}>
                {sel.map(s => (
                  <div key={s.area} style={{ 
                    padding: '1rem',
                    border: s.enabled ? '2px solid var(--primary-blue)' : '2px solid var(--medium-gray)',
                    borderRadius: 'var(--border-radius)',
                    background: s.enabled ? 'rgba(0, 123, 255, 0.05)' : 'var(--white)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      cursor: 'pointer',
                      marginBottom: s.enabled ? '0.75rem' : '0'
                    }}>
                      <input 
                        type="checkbox" 
                        checked={s.enabled} 
                        onChange={e => toggleArea(s.area, e.target.checked)}
                        style={{ 
                          width: '18px',
                          height: '18px',
                          accentColor: 'var(--primary-blue)'
                        }}
                      />
                      <span style={{ 
                        fontWeight: s.enabled ? '600' : '400',
                        color: s.enabled ? 'var(--primary-blue)' : 'var(--dark-gray)'
                      }}>
                        {s.area}
                      </span>
                    </label>
                    {s.enabled && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--secondary-gray)' }}>
                          Size (sq ft):
                        </label>
                        <input 
                          type="number" 
                          aria-label={`${s.area} size`} 
                          min={0} 
                          value={s.size} 
                          onChange={e => updateSize(s.area, Number(e.target.value))} 
                          style={{ 
                            width: '100px',
                            padding: '0.5rem',
                            border: '1px solid var(--medium-gray)',
                            borderRadius: 'var(--border-radius)',
                            textAlign: 'center'
                          }} 
                          placeholder="0"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Always visible submit button */}
            <div style={{ 
              textAlign: 'center',
              padding: '1rem',
              background: 'var(--white)',
              borderTop: '1px solid var(--medium-gray)',
              borderRadius: 'var(--border-radius)'
            }}>
              <button 
                onClick={() => handleUserAnswer(sel.filter(s => s.enabled))}
                className="btn-primary"
                style={{ 
                  padding: '0.75rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                Complete Hotel Model ({sel.filter(s => s.enabled).length} areas selected)
              </button>
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  // Build sheet data (very basic for now)
  const buildSheet = messages
    .filter((m) => m.role === 'user')
    .map((m, idx) => ({ label: `Q${idx + 1}`, value: m.content.slice(0, 25) + (m.content.length > 25 ? '…' : '') }));

  const saveDraft = () => {
    localStorage.setItem('chatDraft', JSON.stringify(messages));
    alert('Draft saved! You can come back later.');
  };

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={containerStyle}>
          <div style={messagesStyle}>{renderMessages()}</div>
          <div style={inputAreaStyle}>
            {renderInput()}
            <div style={{ textAlign: 'center', marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button 
                onClick={resetConversation} 
                className="btn-outline"
                style={{ 
                  fontSize: '0.9rem',
                  padding: '0.5rem 1rem',
                  background: 'transparent',
                  border: '1px solid var(--medium-gray)',
                  color: 'var(--secondary-gray)'
                }}
              >
                🔄 Restart Conversation
              </button>
              <button
                onClick={saveDraft}
                className="btn-primary"
                style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
              >
                💾 Save Draft
              </button>
            </div>
          </div>
        </div>
      </div>
      <BuildSheet summary={buildSheet} />
    </div>
  );
} 