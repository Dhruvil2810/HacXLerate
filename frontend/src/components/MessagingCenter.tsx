import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ConversationItem, MessageItem } from '../types/marketplace';
import { apiRequest } from '../services/api';
import { 
  Send, 
  CheckCheck,
  MessageSquare
} from 'lucide-react';

export const MessagingCenter: React.FC = () => {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>('');
  const [messagesMap, setMessagesMap] = useState<Record<string, MessageItem[]>>({});
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const loadConversations = async () => {
      if (!token) return;
      try {
        const res = await apiRequest<{ conversations: ConversationItem[] }>('/messages/conversations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.success && res.data?.conversations) {
          setConversations(res.data.conversations);
          if (res.data.conversations.length > 0 && !activeConvId) {
            setActiveConvId(res.data.conversations[0].conversationId);
          }
        }
      } catch (err) {
        console.error('Failed to load conversations', err);
      }
    };
    loadConversations();
  }, [token]);

  useEffect(() => {
    if (!activeConvId || !token) return;
    const loadThread = async () => {
      try {
        const res = await apiRequest<{ messages: MessageItem[] }>(`/messages/conversations/${activeConvId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.success && res.data && res.data.messages) {
          const msgs = res.data.messages;
          setMessagesMap((prev) => ({
            ...prev,
            [activeConvId]: msgs,
          }));
        }
      } catch (err) {
        console.error('Failed to load thread messages', err);
      }
    };
    loadThread();
  }, [activeConvId, token]);

  const activeMessages = activeConvId ? (messagesMap[activeConvId] || []) : [];
  const activeConversation = conversations.find((c) => c.conversationId === activeConvId);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConvId || !token || sending) return;

    setSending(true);
    const content = newMessage.trim();
    try {
      const res = await apiRequest<{ message: MessageItem }>(`/messages/conversations/${activeConvId}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content }),
      });

      if (res.success && res.data?.message) {
        const sent = res.data.message;
        setMessagesMap((prev) => ({
          ...prev,
          [activeConvId]: [...(prev[activeConvId] || []), sent],
        }));
        setNewMessage('');
      }
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h3>Collaboration & Direct Messaging</h3>
        <p style={{ fontSize: '0.875rem' }}>
          Coordinate campaign briefs, script approvals, draft revisions, and publishing links.
        </p>
      </div>

      {conversations.length === 0 ? (
        <div className="card text-center" style={{ padding: '3.5rem 2rem' }}>
          <MessageSquare size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3>No Active Discussions Yet</h3>
          <p style={{ maxWidth: '440px', margin: '0.5rem auto 1.5rem', color: 'var(--text-muted)' }}>
            Discussions start automatically when you apply to campaigns, invite creators, or initiate an engagement brief.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden', minHeight: '520px', display: 'flex' }}>
          {/* Left Pane: Conversations List */}
          <div style={{
            width: '320px',
            borderRight: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-subtle)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: '0.875rem' }}>
              Active Discussions ({conversations.length})
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {conversations.map((conv) => {
                const otherUser = conv.participants.find((p) => p.id !== user?.id) || conv.participants[0];
                const isSelected = conv.conversationId === activeConvId;

                return (
                  <div
                    key={conv.conversationId}
                    onClick={() => setActiveConvId(conv.conversationId)}
                    style={{
                      padding: '0.875rem 1rem',
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: isSelected ? 'var(--bg-surface)' : 'transparent',
                      borderLeft: isSelected ? '3px solid var(--color-brand)' : '3px solid transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <div className="flex items-center justify-between" style={{ marginBottom: '0.25rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{otherUser?.name}</div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {conv.lastMessage?.createdAt}
                      </span>
                    </div>

                    {conv.campaign && (
                      <div style={{
                        fontSize: '0.72rem',
                        color: 'var(--color-brand)',
                        fontWeight: 600,
                        marginBottom: '0.25rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {conv.campaign.title}
                      </div>
                    )}

                    <div style={{
                      fontSize: '0.775rem',
                      color: 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {conv.lastMessage?.content}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Pane: Active Message Thread */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-surface)' }}>
          {/* Thread Header */}
          <div style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                {activeConversation?.participants.find((p) => p.id !== user?.id)?.name || 'Direct Thread'}
              </div>
              {activeConversation?.campaign && (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-brand)' }}>
                  Campaign: <strong>{activeConversation.campaign.title}</strong>
                </div>
              )}
            </div>

            <span className="badge badge-verified">
              <CheckCheck size={12} /> REST In-App Messaging
            </span>
          </div>

          {/* Message Bubbles History */}
          <div style={{
            flex: 1,
            padding: '1.5rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            {activeMessages.map((msg) => {
              const isMe = msg.senderId === user?.id || msg.sender?.name === 'You' || msg.senderId === 'current_user';

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div style={{
                    fontSize: '0.725rem',
                    color: 'var(--text-muted)',
                    marginBottom: '0.2rem',
                    display: 'flex',
                    gap: '6px',
                  }}>
                    <span>{msg.sender?.name || 'User'}</span>
                    <span>• {msg.createdAt}</span>
                  </div>

                  <div style={{
                    maxWidth: '70%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '0.875rem',
                    lineHeight: '1.4',
                    backgroundColor: isMe ? 'var(--color-brand)' : 'var(--bg-subtle)',
                    color: isMe ? '#ffffff' : 'var(--text-primary)',
                    border: isMe ? 'none' : '1px solid var(--border-subtle)',
                  }}>
                    {msg.content}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message Composer */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              placeholder="Type your message or campaign feedback..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
            >
              <Send size={15} /> Send
            </button>
          </form>
        </div>
      </div>
      )}
    </div>
  );
};
