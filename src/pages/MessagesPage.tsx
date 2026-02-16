import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { canSendMessage, incrementMessageCount } from '../lib/messageTracking';
import { ArrowLeft, Send, User } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read_status: boolean;
  created_at: string;
}

interface Conversation {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export default function MessagesPage() {
  const [searchParams] = useSearchParams();
  const recipientId = searchParams.get('to');
  const { user, subscription } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(recipientId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || subscription?.tier === 'none') {
      navigate('/subscribe');
      return;
    }

    fetchConversations();
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [user, subscription]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      markMessagesAsRead(selectedConversation);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const conversationMap = new Map<string, Conversation>();

      for (const msg of messagesData || []) {
        const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;

        if (!conversationMap.has(otherUserId)) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('user_id', otherUserId)
            .maybeSingle();

          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('sender_id', otherUserId)
            .eq('receiver_id', user.id)
            .eq('read_status', false);

          conversationMap.set(otherUserId, {
            user_id: otherUserId,
            display_name: profileData?.display_name || null,
            avatar_url: profileData?.avatar_url || null,
            last_message: msg.content,
            last_message_time: msg.created_at,
            unread_count: count || 0,
          });
        }
      }

      setConversations(Array.from(conversationMap.values()));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    }
  };

  const fetchMessages = async (otherUserId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markMessagesAsRead = async (otherUserId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('messages')
        .update({ read_status: true })
        .eq('sender_id', otherUserId)
        .eq('receiver_id', user.id)
        .eq('read_status', false);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedConversation || !newMessage.trim() || !subscription) return;

    setSending(true);
    try {
      const messageCheck = await canSendMessage(user.id, selectedConversation, subscription.tier);

      if (!messageCheck.canSend) {
        alert(messageCheck.reason || 'You cannot send this message.');
        setSending(false);
        return;
      }

      const isFirstMessage = messages.length === 0;

      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: selectedConversation,
        content: newMessage.trim(),
        read_status: false,
      });

      if (error) throw error;

      if (isFirstMessage && subscription.tier === 'standard') {
        await incrementMessageCount(user.id);
      }

      setNewMessage('');
      await fetchMessages(selectedConversation);
      await fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-[#FF1493] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-[#FF1493] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-900 rounded-2xl border-2 border-gray-800 overflow-hidden h-[600px] flex">
          <div className="w-1/3 border-r border-gray-800 flex flex-col">
            <div className="p-4 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Messages</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  No conversations yet
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.user_id}
                    onClick={() => setSelectedConversation(conv.user_id)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-gray-800 transition-colors border-b border-gray-800 ${
                      selectedConversation === conv.user_id ? 'bg-gray-800' : ''
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
                      {conv.avatar_url ? (
                        <img
                          src={conv.avatar_url}
                          alt={conv.display_name || 'User'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white">
                          {conv.display_name || 'Anonymous'}
                        </span>
                        {conv.unread_count > 0 && (
                          <span className="w-5 h-5 bg-[#FF1493] text-[#0A0A0A] text-xs font-bold rounded-full flex items-center justify-center">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 truncate">{conv.last_message}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender_id === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          msg.sender_id === user?.id
                            ? 'bg-[#FF1493] text-[#0A0A0A]'
                            : 'bg-gray-800 text-white'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.sender_id === user?.id
                              ? 'text-[#0A0A0A]/70'
                              : 'text-gray-400'
                          }`}
                        >
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 bg-[#0A0A0A] border-2 border-gray-800 rounded-lg text-white focus:border-[#FF1493] focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      className="px-6 py-3 bg-[#0A0A0A] border-2 border-[#FF1493] text-white rounded-lg hover:bg-[#FF1493] hover:text-[#0A0A0A] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
