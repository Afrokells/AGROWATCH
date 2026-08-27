import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageCircle, Send, CheckCheck, Bell } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { messagingAPI } from '../../services/api';

const formatTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (iso) => {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString();
};

export default function MessagesPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const initialThreadId = searchParams.get('thread');

  const [threads, setThreads] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyBody, setReplyBody] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [tab, setTab] = useState('chats'); // 'chats' | 'notifications'
  const messagesEndRef = useRef(null);

  // Load threads and notifications
  useEffect(() => {
    async function load() {
      setLoadingThreads(true);
      try {
        const [t, n] = await Promise.all([
          messagingAPI.listThreads(),
          messagingAPI.listNotifications(),
        ]);
        setThreads(t);
        setNotifications(n);
        // Auto-select thread from URL param
        if (initialThreadId) {
          const found = t.find(th => String(th.id) === String(initialThreadId));
          if (found) openThread(found);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingThreads(false);
      }
    }
    load();
  }, []);

  const openThread = async (thread) => {
    setSelectedThread(thread);
    setLoadingMessages(true);
    try {
      const msgs = await messagingAPI.getMessages(thread.id);
      setMessages(msgs);
      // Update unread count in thread list
      setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, unread_count: 0 } : t));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyBody.trim() || !selectedThread) return;
    setSending(true);
    try {
      const msg = await messagingAPI.reply(selectedThread.id, replyBody.trim());
      setMessages(prev => [...prev, msg]);
      setReplyBody('');
    } catch (err) {
      console.error(err);
      addToast('Failed to send reply.', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await messagingAPI.markAllNotifsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      addToast('All notifications marked as read.', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotifClick = async (notif) => {
    // Mark this notification as read
    if (!notif.is_read) {
      try {
        await messagingAPI.markNotifRead(notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      } catch {}
    }
    // Open the thread
    if (notif.thread) {
      const thread = threads.find(t => t.id === notif.thread);
      if (thread) {
        setTab('chats');
        openThread(thread);
      }
    }
  };

  const unreadNotifs = notifications.filter(n => !n.is_read).length;

  const getOtherParty = (thread) => {
    if (!user) return '';
    return thread.buyer === user.id ? thread.seller_name : thread.buyer_name;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)', height: 'calc(100vh - 80px)' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Messages</h1>
          <p className="page-subtitle">Your conversations and notifications.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 'var(--sp-6)', flex: 1, minHeight: 0 }}>
        {/* Left sidebar: threads + notifications */}
        <Card style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
            {[
              { key: 'chats', label: 'Chats', count: threads.reduce((s, t) => s + (t.unread_count || 0), 0) },
              { key: 'notifications', label: 'Alerts', count: unreadNotifs },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  flex: 1, padding: 'var(--sp-3) var(--sp-4)',
                  background: 'none', border: 'none',
                  borderBottom: tab === key ? '2px solid var(--accent)' : '2px solid transparent',
                  color: tab === key ? 'var(--accent)' : 'var(--text-muted)',
                  fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  transition: 'color 0.2s',
                }}
              >
                {label}
                {count > 0 && (
                  <span style={{
                    background: 'var(--accent)', color: '#0a1410',
                    borderRadius: 99, fontSize: '0.6875rem', fontWeight: 800,
                    padding: '1px 6px',
                  }}>{count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Chats tab */}
          {tab === 'chats' && (
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loadingThreads ? (
                <div style={{ padding: 'var(--sp-6)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                  {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 'var(--radius-md)' }} />)}
                </div>
              ) : threads.length === 0 ? (
                <div style={{ padding: 'var(--sp-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <MessageCircle size={32} style={{ margin: '0 auto var(--sp-3)' }} />
                  <p style={{ fontSize: '0.875rem' }}>No conversations yet.<br />Contact a seller to get started.</p>
                </div>
              ) : (
                threads.map(thread => {
                  const isSelected = selectedThread?.id === thread.id;
                  const other = getOtherParty(thread);
                  const initials = other ? other.charAt(0).toUpperCase() : '?';
                  return (
                    <button
                      key={thread.id}
                      onClick={() => openThread(thread)}
                      style={{
                        width: '100%', textAlign: 'left', padding: 'var(--sp-3) var(--sp-4)',
                        background: isSelected ? 'var(--accent-dim)' : 'none',
                        border: 'none', borderBottom: '1px solid var(--border)',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
                        transition: 'background 0.15s',
                      }}
                    >
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                        background: isSelected ? 'var(--accent)' : 'var(--bg-input)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.9rem',
                        color: isSelected ? '#0a1410' : 'var(--text-secondary)',
                      }}>
                        {initials}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', truncate: true }}>
                            {other}
                          </span>
                          {thread.last_message && (
                            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                              {formatTime(thread.last_message.created_at)}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                            {thread.last_message ? thread.last_message.body : thread.listing_crop ? `Re: ${thread.listing_crop}` : 'New conversation'}
                          </span>
                          {thread.unread_count > 0 && (
                            <span style={{
                              background: 'var(--accent)', color: '#0a1410',
                              borderRadius: 99, fontSize: '0.6875rem', fontWeight: 800,
                              padding: '1px 6px', flexShrink: 0,
                            }}>{thread.unread_count}</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* Notifications tab */}
          {tab === 'notifications' && (
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              {unreadNotifs > 0 && (
                <div style={{ padding: 'var(--sp-3) var(--sp-4)', borderBottom: '1px solid var(--border)' }}>
                  <button
                    onClick={handleMarkAllRead}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: '0.8125rem', fontWeight: 600 }}
                  >
                    Mark all as read
                  </button>
                </div>
              )}
              {notifications.length === 0 ? (
                <div style={{ padding: 'var(--sp-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Bell size={32} style={{ margin: '0 auto var(--sp-3)' }} />
                  <p style={{ fontSize: '0.875rem' }}>No notifications yet.</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <button
                    key={notif.id}
                    onClick={() => handleNotifClick(notif)}
                    style={{
                      width: '100%', textAlign: 'left', padding: 'var(--sp-3) var(--sp-4)',
                      background: notif.is_read ? 'none' : 'rgba(74,222,128,0.05)',
                      border: 'none', borderBottom: '1px solid var(--border)',
                      cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)',
                    }}
                  >
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', marginTop: 6, flexShrink: 0,
                      background: notif.is_read ? 'var(--border)' : 'var(--accent)',
                    }} />
                    <div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
                        {notif.message}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                        {formatDate(notif.created_at)} · {formatTime(notif.created_at)}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </Card>

        {/* Right panel: chat view */}
        <Card style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          {!selectedThread ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: 'var(--sp-3)' }}>
              <MessageCircle size={48} />
              <p style={{ fontSize: '0.9375rem' }}>Select a conversation to start chatting</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={{ padding: 'var(--sp-4) var(--sp-5)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.875rem', color: 'var(--accent)',
                }}>
                  {getOtherParty(selectedThread)?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                    {getOtherParty(selectedThread)}
                  </div>
                  {selectedThread.listing_crop && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      Re: {selectedThread.listing_crop} listing
                    </div>
                  )}
                </div>
              </div>

              {/* Messages list */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                {loadingMessages ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                    {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 48, borderRadius: 'var(--radius-lg)', width: i % 2 === 0 ? '60%' : '50%', alignSelf: i % 2 === 0 ? 'flex-start' : 'flex-end' }} />)}
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 'var(--sp-10)' }}>
                    <p style={{ fontSize: '0.875rem' }}>No messages yet. Send one below!</p>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isMine = msg.sender === user?.id;
                    return (
                      <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                          maxWidth: '70%',
                          padding: 'var(--sp-3) var(--sp-4)',
                          borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          background: isMine ? 'var(--accent)' : 'var(--bg-input)',
                          color: isMine ? '#0a1410' : 'var(--text-primary)',
                          fontSize: '0.875rem', lineHeight: 1.5,
                        }}>
                          {!isMine && (
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 4, opacity: 0.7 }}>
                              {msg.sender_name}
                            </div>
                          )}
                          <p style={{ margin: 0 }}>{msg.body}</p>
                          <div style={{ fontSize: '0.6875rem', opacity: 0.6, marginTop: 4, textAlign: 'right', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                            {formatTime(msg.created_at)}
                            {isMine && <CheckCheck size={12} />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply input */}
              <form
                onSubmit={handleReply}
                style={{ padding: 'var(--sp-4)', borderTop: '1px solid var(--border)', display: 'flex', gap: 'var(--sp-3)', alignItems: 'flex-end' }}
              >
                <textarea
                  value={replyBody}
                  onChange={e => setReplyBody(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(e); } }}
                  placeholder="Type a message... (Enter to send)"
                  rows={2}
                  style={{
                    flex: 1, padding: 'var(--sp-3)',
                    background: 'var(--bg-input)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                    outline: 'none', resize: 'none', fontFamily: 'inherit', fontSize: '0.875rem',
                  }}
                />
                <Button
                  type="submit"
                  variant="primary"
                  icon={<Send size={16} />}
                  loading={sending}
                  disabled={!replyBody.trim()}
                >
                  Send
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
