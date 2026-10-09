import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ConversationItem, MessageItem } from '../types/marketplace';
import { 
  Send, 
  CheckCheck
} from 'lucide-react';

const INITIAL_CONVERSATIONS: ConversationItem[] = [
  {
    conversationId: 'conv_1',
    campaign: {
      id: 'camp_demo_1',
      title: 'Creator Studio Mechanical Keyboard Q4 Launch',
    },
    participants: [
      { id: 'usr_brand_1', name: 'Nexus Tech Labs', email: 'brand@nexus.com' },
      { id: 'usr_creator_1', name: 'Alex Rivera', email: 'alex@techreview.io' },
    ],
    lastMessage: {
      id: 'm1',
      content: 'Hey Alex! We reviewed your application and love your recent sound test format.',
      createdAt: '10 mins ago',
    },
    updatedAt: new Date().toISOString(),
  },
  {
    conversationId: 'conv_2',
    campaign: {
      id: 'camp_demo_2',
      title: 'AirGlide Wireless Mouse Launch',
    },
    participants: [
      { id: 'usr_brand_1', name: 'Nexus Tech Labs', email: 'brand@nexus.com' },
      { id: 'usr_creator_2', name: 'Sarah Chen', email: 'sarah@codes.io' },
    ],
    lastMessage: {
      id: 'm2',
      content: 'Can you deliver the draft video by next Tuesday?',
      createdAt: '2 hours ago',
    },
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_MESSAGES: Record<string, MessageItem[]> = {
  conv_1: [
    {
      id: 'msg_1',
      conversationId: 'conv_1',
      senderId: 'usr_creator_1',
      content: 'Hi Nexus Tech team! I applied to your keyboard launch campaign. I can film in 4K with custom macro shots.',
      createdAt: '1 hour ago',
      sender: { id: 'usr_creator_1', name: 'Alex Rivera' },
    },
    {
      id: 'msg_2',
      conversationId: 'conv_1',
      senderId: 'usr_brand_1',
      content: 'Hey Alex! We reviewed your application and love your recent sound test format. When could you have the sample unit tested?',
      createdAt: '10 mins ago',
      sender: { id: 'usr_brand_1', name: 'Nexus Tech Labs' },
    },
  ],
  conv_2: [
    {
      id: 'msg_3',
      conversationId: 'conv_2',
      senderId: 'usr_brand_1',
      content: 'Can you deliver the draft video by next Tuesday?',
      createdAt: '2 hours ago',
      sender: { id: 'usr_brand_1', name: 'Nexus Tech Labs' },
    },
  ],
};

export const MessagingCenter: React.FC = () => {
  const { user } = useAuth();
  const [conversations] = useState<ConversationItem[]>(INITIAL_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string>('conv_1');
  const [messagesMap, setMessagesMap] = useState<Record<string, MessageItem[]>>(INITIAL_MESSAGES);
  const [newMessage, setNewMessage] = useState('');

  const activeMessages = messagesMap[activeConvId] || [];
  const activeConversation = conversations.find((c) => c.conversationId === activeConvId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newMsg: MessageItem = {
      id: `msg_${Date.now()}`,
      conversationId: activeConvId,
      senderId: user?.id || 'current_user',
      content: newMessage.trim(),
      createdAt: 'Just now',
      sender: {
        id: user?.id || 'current_user',
        name: user?.name || 'You',
      },
    };

    setMessagesMap((prev) => ({
      ...prev,
      [activeConvId]: [...(prev[activeConvId] || []), newMsg],
    }));

    setNewMessage('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h3>Collaboration & Direct Messaging</h3>
        <p style={{ fontSize: '0.875rem' }}>
          Coordinate campaign briefs, script approvals, draft revisions, and publishing links.
        </p>
      </div>

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
    </div>
  );
};
