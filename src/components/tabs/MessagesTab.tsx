import { useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  Clock,
  HelpCircle,
  MessageCircle,
  Search,
  Send,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import {
  getConversations,
  getConversationMessages,
  sendChatMessage,
  subscribeToConversation,
  type Conversation,
  type ChatMessage,
} from '../../services/messages';

interface MessagesTabProps {
  currentUserId: string;
  currentUserName: string;
  selectedConversationId?: string | null;
  onSelectConversation?: (id: string | null) => void;
  onFindClass?: () => void;
}

const QUICK_PROMPTS = [
  '👟 What footwear or outfit is best for this session?',
  '✨ Is this class suitable for complete beginners?',
  '🚗 Is parking available at the studio?',
  '⏰ What time do studio doors open before class?',
];

function formatTimeAgo(isoString: string) {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return 'Recently';
  }
}

function formatMessageTime(isoString: string) {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(isoString));
  } catch {
    return '';
  }
}

export function MessagesTab({
  currentUserId,
  currentUserName,
  selectedConversationId,
  onSelectConversation,
  onFindClass,
}: MessagesTabProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(selectedConversationId || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  // Sync external selectedConversationId prop
  useEffect(() => {
    if (selectedConversationId) {
      setActiveConvId(selectedConversationId);
      setMobileView('chat');
    }
  }, [selectedConversationId]);

  // Load conversations on mount
  useEffect(() => {
    setLoadingConvs(true);
    getConversations(currentUserId)
      .then(({ data }) => {
        setConversations(data);
        if (selectedConversationId) {
          setActiveConvId(selectedConversationId);
        } else if (data.length > 0 && !activeConvId) {
          setActiveConvId(data[0].id);
        }
      })
      .finally(() => setLoadingConvs(false));
  }, [currentUserId, selectedConversationId]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConvId) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    getConversationMessages(activeConvId, currentUserId)
      .then(({ data }) => {
        setMessages(data);
        setTimeout(() => scrollToBottom(false), 60);
      })
      .finally(() => setLoadingMessages(false));

    // Subscribe to realtime updates
    const channel = subscribeToConversation(activeConvId, (newMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, { ...newMsg, isSelf: newMsg.senderId === currentUserId }];
      });
      setTimeout(() => scrollToBottom(true), 60);
    });

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [activeConvId, currentUserId]);

  const activeConversation = conversations.find((c) => c.id === activeConvId) || null;

  const handleSelectConv = (id: string) => {
    setActiveConvId(id);
    onSelectConversation?.(id);
    setMobileView('chat');
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? inputText).trim();
    if (!text || !activeConvId || sending) return;

    setSending(true);
    if (!textToSend) setInputText('');

    const { data: newMsg } = await sendChatMessage(activeConvId, currentUserId, text);

    if (newMsg) {
      setMessages((prev) => [...prev, newMsg]);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? { ...c, lastMessage: text, lastMessageAt: newMsg.createdAt }
            : c
        )
      );
      setTimeout(() => scrollToBottom(true), 60);
    }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.participant.name.toLowerCase().includes(q) ||
      (c.eventTitle && c.eventTitle.toLowerCase().includes(q)) ||
      c.lastMessage.toLowerCase().includes(q)
    );
  });

  return (
    <section className="tab-view messages-page-view">
      <div className="tab-heading">
        <span className="section-kicker">Your space</span>
        <h2>Messages & Inquiries</h2>
        <p>Connect with workshop choreographers, partner dance studios, and fellow attendees.</p>
      </div>

      <div className="messages-layout-card">
        {/* Left Pane: Conversations list */}
        <aside className={`messages-inbox-sidebar ${mobileView === 'chat' ? 'hide-mobile' : ''}`}>
          <div className="inbox-search-wrap">
            <div className="inbox-search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="inbox-threads-list">
            {loadingConvs ? (
              <div className="inbox-loading">Loading conversations...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="inbox-empty">
                <UserRound size={26} />
                <p>No conversations found</p>
                <span>Ask questions directly from any workshop card.</span>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === activeConvId;
                return (
                  <button
                    key={conv.id}
                    type="button"
                    className={`inbox-item ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelectConv(conv.id)}
                  >
                    <div className="inbox-avatar-wrap">
                      <div className="inbox-avatar">{conv.participant.avatarInitials}</div>
                      {conv.participant.online && <span className="inbox-online-indicator" />}
                    </div>
                    <div className="inbox-meta">
                      <div className="inbox-meta-top">
                        <strong className="inbox-name">{conv.participant.name}</strong>
                        <span className="inbox-time">{formatTimeAgo(conv.lastMessageAt)}</span>
                      </div>
                      {conv.eventTitle && (
                        <span className="inbox-event-pill">
                          Re: {conv.eventTitle}
                        </span>
                      )}
                      <p className="inbox-snippet">{conv.lastMessage}</p>
                    </div>
                    {conv.unreadCount > 0 && <span className="inbox-unread-dot" />}
                  </button>
                );
              })
            )}
          </div>

          <div className="inbox-footer-note">
            <Sparkles size={14} />
            <span>Instant answers from instructors & community</span>
          </div>
        </aside>

        {/* Right Pane: Active Chat Room */}
        <main className={`messages-chat-room ${mobileView === 'list' ? 'hide-mobile' : ''}`}>
          {activeConversation ? (
            <>
              {/* Chat Room Header */}
              <div className="chat-room-header">
                <button
                  type="button"
                  className="chat-back-mobile"
                  onClick={() => setMobileView('list')}
                  aria-label="Back to conversations"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="chat-recipient-wrap">
                  <div className="inbox-avatar-wrap">
                    <div className="inbox-avatar">{activeConversation.participant.avatarInitials}</div>
                    {activeConversation.participant.online && (
                      <span className="inbox-online-indicator" />
                    )}
                  </div>
                  <div>
                    <div className="chat-title-line">
                      <h3>{activeConversation.participant.name}</h3>
                      <span className="recipient-role-pill">
                        {activeConversation.participant.role === 'choreographer'
                          ? 'Choreographer'
                          : activeConversation.participant.role === 'studio'
                          ? 'Studio Host'
                          : 'Dancer'}
                      </span>
                    </div>
                    {activeConversation.eventTitle && (
                      <span className="recipient-event-link">
                        Workshop: <strong>{activeConversation.eventTitle}</strong>
                        {activeConversation.eventStudio && ` · ${activeConversation.eventStudio}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Chat Message List */}
              <div className="chat-messages-scroll">
                {loadingMessages ? (
                  <div className="chat-loading-history">Loading message history...</div>
                ) : messages.length === 0 ? (
                  <div className="chat-empty-convo">
                    <MessageCircle size={36} />
                    <p>Start a conversation with {activeConversation.participant.name}</p>
                    <span>Ask about music style, pace, attire, or studio directions.</span>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isSelf = Boolean(msg.isSelf);
                    return (
                      <div
                        key={msg.id}
                        className={`chat-bubble-row ${isSelf ? 'is-self' : 'is-peer'}`}
                      >
                        {!isSelf && (
                          <div className="chat-peer-avatar">
                            {activeConversation.participant.avatarInitials}
                          </div>
                        )}
                        <div className="chat-bubble-box">
                          <p>{msg.content}</p>
                          <span className="chat-time-tag">
                            <Clock size={11} /> {formatMessageTime(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Inquiry Prompts */}
              <div className="chat-prompts-bar">
                <div className="chat-prompts-label">
                  <HelpCircle size={13} /> Quick inquiries:
                </div>
                <div className="chat-prompts-row">
                  {QUICK_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      type="button"
                      className="chat-prompt-pill"
                      onClick={() => handleSendMessage(prompt)}
                      disabled={sending}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input Bar */}
              <div className="chat-composer-bar">
                <input
                  type="text"
                  placeholder={`Write a message to ${activeConversation.participant.name}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                />
                <button
                  type="button"
                  className="chat-send-btn"
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || sending}
                  aria-label="Send message"
                >
                  <Send size={16} />
                  <span>Send</span>
                </button>
              </div>
            </>
          ) : (
            <div className="chat-no-selection">
              <MessageCircle size={44} />
              <h3>Select a conversation</h3>
              <p>Choose an ongoing thread from the sidebar or reach out to instructors on class pages.</p>
              {onFindClass && (
                <button type="button" className="primary-btn" onClick={onFindClass}>
                  Browse workshops
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </section>
  );
}
