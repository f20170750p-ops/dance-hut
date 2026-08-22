import { supabase, isSupabaseConfigured } from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface ParticipantInfo {
  id: string;
  name: string;
  role: 'dancer' | 'choreographer' | 'studio';
  avatarInitials: string;
  online?: boolean;
}

export interface Conversation {
  id: string;
  eventId?: number | null;
  eventTitle?: string | null;
  eventStudio?: string | null;
  participant: ParticipantInfo;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  isSelf?: boolean;
}

const LOCAL_CONVERSATIONS_KEY = 'dancehut_local_conversations';
const LOCAL_MESSAGES_KEY = 'dancehut_local_messages';

// Seed initial demo conversations so users immediately have conversations to test
const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: 'seed-conv-1',
    eventId: 1,
    eventTitle: 'Afro House Grooves',
    eventStudio: 'Studio 21, Indiranagar',
    participant: {
      id: 'instructor-aria',
      name: 'Aria Kapoor',
      role: 'choreographer',
      avatarInitials: 'AK',
      online: true,
    },
    lastMessage: 'Hey! Yes, sneakers with clean soles are perfect for the afro session 🙌',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    unreadCount: 1,
  },
  {
    id: 'seed-conv-2',
    eventId: 2,
    eventTitle: 'Contemporary Flow & Floorwork',
    eventStudio: 'Attakkalari, Wilson Garden',
    participant: {
      id: 'instructor-rohan',
      name: 'Rohan Verma',
      role: 'choreographer',
      avatarInitials: 'RV',
      online: false,
    },
    lastMessage: 'Looking forward to seeing you in class tomorrow! Bring comfortable knee pads if you have them.',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    unreadCount: 0,
  },
  {
    id: 'seed-conv-3',
    eventId: 3,
    eventTitle: 'Street Jazz Foundations',
    eventStudio: 'The Bohemian House, Richmond Road',
    participant: {
      id: 'studio-team',
      name: 'DanceHut Community Desk',
      role: 'studio',
      avatarInitials: 'DH',
      online: true,
    },
    lastMessage: 'Welcome to DanceHut! Need help finding your first workshop or booking a slot?',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
    unreadCount: 0,
  },
];

const SEED_MESSAGES: Record<string, ChatMessage[]> = {
  'seed-conv-1': [
    {
      id: 'm1',
      conversationId: 'seed-conv-1',
      senderId: 'current-user',
      content: 'Hi Aria! I just booked the Afro House Grooves class for Saturday. What footwear do you recommend?',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: 'm2',
      conversationId: 'seed-conv-1',
      senderId: 'instructor-aria',
      content: 'Hey! Yes, sneakers with clean soles are perfect for the afro session 🙌',
      createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    },
  ],
  'seed-conv-2': [
    {
      id: 'm3',
      conversationId: 'seed-conv-2',
      senderId: 'current-user',
      content: 'Hi Rohan, is Contemporary Flow suitable if I have beginner experience in ballet?',
      createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    },
    {
      id: 'm4',
      conversationId: 'seed-conv-2',
      senderId: 'instructor-rohan',
      content: 'Absolutely! Ballet background will help immensely with alignment.',
      createdAt: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
    },
    {
      id: 'm5',
      conversationId: 'seed-conv-2',
      senderId: 'instructor-rohan',
      content: 'Looking forward to seeing you in class tomorrow! Bring comfortable knee pads if you have them.',
      createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    },
  ],
  'seed-conv-3': [
    {
      id: 'm6',
      conversationId: 'seed-conv-3',
      senderId: 'studio-team',
      content: 'Welcome to DanceHut! Need help finding your first workshop or booking a slot?',
      createdAt: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
    },
  ],
};

function getLocalConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(LOCAL_CONVERSATIONS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_CONVERSATIONS_KEY, JSON.stringify(SEED_CONVERSATIONS));
      return SEED_CONVERSATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_CONVERSATIONS;
  }
}

function saveLocalConversations(conversations: Conversation[]) {
  try {
    localStorage.setItem(LOCAL_CONVERSATIONS_KEY, JSON.stringify(conversations));
  } catch {
    // ignore
  }
}

function getLocalMessages(conversationId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(LOCAL_MESSAGES_KEY);
    const store: Record<string, ChatMessage[]> = raw ? JSON.parse(raw) : SEED_MESSAGES;
    return store[conversationId] || [];
  } catch {
    return SEED_MESSAGES[conversationId] || [];
  }
}

function saveLocalMessage(conversationId: string, message: ChatMessage) {
  try {
    const raw = localStorage.getItem(LOCAL_MESSAGES_KEY);
    const store: Record<string, ChatMessage[]> = raw ? JSON.parse(raw) : { ...SEED_MESSAGES };
    const list = store[conversationId] ? [...store[conversationId], message] : [message];
    store[conversationId] = list;
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

/**
 * Fetch all conversations for the user
 */
export async function getConversations(userId?: string): Promise<{ data: Conversation[]; error: Error | null }> {
  if (!isSupabaseConfigured || !userId) {
    return { data: getLocalConversations(), error: null };
  }

  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        event_id,
        participant_1,
        participant_2,
        last_message,
        updated_at,
        created_at,
        events (
          id,
          title,
          studio
        ),
        p1:profiles!conversations_participant_1_fkey (
          id,
          display_name,
          role
        ),
        p2:profiles!conversations_participant_2_fkey (
          id,
          display_name,
          role
        )
      `)
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error || !data || data.length === 0) {
      // Fallback to local storage seeds if table is empty or errored
      return { data: getLocalConversations(), error: null };
    }

    const conversations: Conversation[] = data.map((row: any) => {
      const otherProfile = row.participant_1 === userId ? row.p2 : row.p1;
      const otherName = otherProfile?.display_name || 'Dancer';
      const initials = otherName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'DH';

      return {
        id: row.id,
        eventId: row.event_id,
        eventTitle: row.events?.title || null,
        eventStudio: row.events?.studio || null,
        participant: {
          id: otherProfile?.id || (row.participant_1 === userId ? row.participant_2 : row.participant_1),
          name: otherName,
          role: otherProfile?.role || 'dancer',
          avatarInitials: initials,
          online: true,
        },
        lastMessage: row.last_message || 'Start the conversation...',
        lastMessageAt: row.updated_at,
        unreadCount: 0,
      };
    });

    return { data: conversations, error: null };
  } catch (err: any) {
    return { data: getLocalConversations(), error: null };
  }
}

/**
 * Fetch messages in a conversation
 */
export async function getConversationMessages(
  conversationId: string,
  currentUserId?: string
): Promise<{ data: ChatMessage[]; error: Error | null }> {
  if (!isSupabaseConfigured || conversationId.startsWith('seed-')) {
    const local = getLocalMessages(conversationId).map((m) => ({
      ...m,
      isSelf: currentUserId ? m.senderId === currentUserId || m.senderId === 'current-user' : true,
    }));
    return { data: local, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('messages')
      .select('id, conversation_id, sender_id, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      const local = getLocalMessages(conversationId);
      return { data: local, error: null };
    }

    const messages: ChatMessage[] = (data || []).map((row: any) => ({
      id: row.id,
      conversationId: row.conversation_id,
      senderId: row.sender_id,
      content: row.content,
      createdAt: row.created_at,
      isSelf: currentUserId ? row.sender_id === currentUserId : false,
    }));

    return { data: messages, error: null };
  } catch (err: any) {
    return { data: getLocalMessages(conversationId), error: null };
  }
}

/**
 * Send a message
 */
export async function sendChatMessage(
  conversationId: string,
  senderId: string,
  content: string
): Promise<{ data: ChatMessage | null; error: Error | null }> {
  const trimmed = content.trim();
  if (!trimmed) return { data: null, error: new Error('Message cannot be empty') };

  const newMsg: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    conversationId,
    senderId,
    content: trimmed,
    createdAt: new Date().toISOString(),
    isSelf: true,
  };

  // Update local storage regardless
  saveLocalMessage(conversationId, newMsg);

  // Update conversation last message in local
  const convs = getLocalConversations();
  const updatedConvs = convs.map((c) =>
    c.id === conversationId
      ? { ...c, lastMessage: trimmed, lastMessageAt: newMsg.createdAt }
      : c
  );
  saveLocalConversations(updatedConvs);

  if (!isSupabaseConfigured || conversationId.startsWith('seed-')) {
    return { data: newMsg, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: trimmed,
      })
      .select()
      .single();

    if (error) {
      return { data: newMsg, error: null };
    }

    // Update conversation timestamp & last_message
    await supabase
      .from('conversations')
      .update({
        last_message: trimmed,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId);

    return {
      data: {
        id: data.id,
        conversationId: data.conversation_id,
        senderId: data.sender_id,
        content: data.content,
        createdAt: data.created_at,
        isSelf: true,
      },
      error: null,
    };
  } catch (err: any) {
    return { data: newMsg, error: null };
  }
}

/**
 * Start or retrieve a conversation with a workshop instructor or user
 */
export async function startOrGetInstructorChat(
  currentUserId: string,
  instructorName: string,
  eventId?: number,
  eventTitle?: string,
  eventStudio?: string
): Promise<{ conversation: Conversation; error: Error | null }> {
  const localConvs = getLocalConversations();

  // Check if a conversation with this instructor or for this event exists
  const existing = localConvs.find(
    (c) => c.participant.name.toLowerCase() === instructorName.toLowerCase() || (eventId && c.eventId === eventId)
  );

  if (existing) {
    return { conversation: existing, error: null };
  }

  const initials = instructorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'IN';

  const newConv: Conversation = {
    id: `conv-${Date.now()}`,
    eventId: eventId || null,
    eventTitle: eventTitle || null,
    eventStudio: eventStudio || null,
    participant: {
      id: `host-${instructorName.toLowerCase().replace(/\s+/g, '-')}`,
      name: instructorName,
      role: 'choreographer',
      avatarInitials: initials,
      online: true,
    },
    lastMessage: `Hi ${instructorName}! I have a question about the ${eventTitle || 'workshop'}.`,
    lastMessageAt: new Date().toISOString(),
    unreadCount: 0,
  };

  const updated = [newConv, ...localConvs];
  saveLocalConversations(updated);

  // Pre-seed an initial question
  saveLocalMessage(newConv.id, {
    id: `msg-init-${Date.now()}`,
    conversationId: newConv.id,
    senderId: currentUserId,
    content: `Hi ${instructorName}! I'm interested in joining ${eventTitle || 'your workshop'}.`,
    createdAt: new Date().toISOString(),
    isSelf: true,
  });

  return { conversation: newConv, error: null };
}

/**
 * Subscribe to realtime incoming messages for a conversation
 */
export function subscribeToConversation(
  conversationId: string,
  onNewMessage: (message: ChatMessage) => void
): RealtimeChannel | null {
  if (!isSupabaseConfigured || conversationId.startsWith('seed-') || conversationId.startsWith('conv-')) {
    return null;
  }

  const channel = supabase
    .channel(`chat:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        if (payload.new) {
          const row = payload.new as any;
          onNewMessage({
            id: row.id,
            conversationId: row.conversation_id,
            senderId: row.sender_id,
            content: row.content,
            createdAt: row.created_at,
          });
        }
      }
    )
    .subscribe();

  return channel;
}
