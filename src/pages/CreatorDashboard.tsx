import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { MessageSquare, LogOut, User, Save, Camera, BarChart3, Settings, Send, Heart, Image as ImageIcon, Video, Trash2, Upload, Link as LinkIcon, Copy, Check, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { validateSquareImage } from '../utils/imageValidation';

type Tab = 'profile' | 'messages' | 'analytics' | 'media' | 'profileLink' | 'viewProfile';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_status: boolean;
  sender_profile: {
    display_name: string;
    avatar_url: string | null;
  };
}

interface Conversation {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface MediaItem {
  id: string;
  profile_id: string;
  media_type: 'image' | 'video';
  image_url: string | null;
  video_url: string | null;
  display_order: number;
  duration: number | null;
  created_at: string;
}

export default function CreatorDashboard() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('messages');
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [category, setCategory] = useState(profile?.category || '');
  const [height, setHeight] = useState(profile?.height || '');
  const [build, setBuild] = useState(profile?.build || '');
  const [hairColour, setHairColour] = useState(profile?.hair_colour || '');
  const [eyeColour, setEyeColour] = useState(profile?.eye_colour || '');
  const [smoke, setSmoke] = useState<boolean | null>(profile?.smoke ?? null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !profile) {
      navigate('/auth');
      return;
    }

    if (activeTab === 'messages') {
      fetchConversations();
    } else if (activeTab === 'analytics') {
      fetchAnalytics();
    } else if (activeTab === 'media') {
      fetchMedia();
    } else if (activeTab === 'profileLink') {
      fetchAnalytics();
    } else if (activeTab === 'viewProfile') {
      fetchMedia();
    }
  }, [user, profile, activeTab]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select(`
          id,
          sender_id,
          receiver_id,
          content,
          created_at,
          read_status
        `)
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
            .single();

          conversationMap.set(otherUserId, {
            user_id: otherUserId,
            display_name: profileData?.display_name || 'Unknown User',
            avatar_url: profileData?.avatar_url || null,
            last_message: msg.content,
            last_message_time: msg.created_at,
            unread_count: 0,
          });
        }

        if (msg.receiver_id === user.id && !msg.read_status) {
          const conv = conversationMap.get(otherUserId)!;
          conv.unread_count += 1;
        }
      }

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (otherUserId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          sender_id,
          content,
          created_at,
          read_status
        `)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', otherUserId)
        .single();

      const messagesWithProfiles = (data || []).map(msg => ({
        ...msg,
        sender_profile: {
          display_name: msg.sender_id === user.id ? (profile?.display_name || 'You') : (senderProfile?.display_name || 'Unknown'),
          avatar_url: msg.sender_id === user.id ? (profile?.avatar_url || null) : (senderProfile?.avatar_url || null),
        },
      }));

      setMessages(messagesWithProfiles);

      await supabase
        .from('messages')
        .update({ read_status: true })
        .eq('receiver_id', user.id)
        .eq('sender_id', otherUserId)
        .eq('read_status', false);

      await fetchConversations();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !selectedConversation || !newMessage.trim()) return;

    try {
      setSending(true);

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedConversation,
          content: newMessage.trim(),
          read_status: false,
        });

      if (error) throw error;

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

  const fetchAnalytics = async () => {
    if (!user || !profile) return;

    try {
      const { count: favCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', profile.id);

      setFavoritesCount(favCount || 0);

      const { count: msgCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id);

      setTotalMessages(msgCount || 0);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchMedia = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('profile_id', profile.id)
        .order('display_order', { ascending: true });

      if (error) throw error;

      setMediaItems(data || []);
    } catch (error) {
      console.error('Error fetching media:', error);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !profile) return;

    try {
      const imageCount = mediaItems.filter(item => item.media_type === 'image').length;
      if (imageCount >= 10) {
        alert('You can only upload up to 10 images');
        return;
      }

      setUploadingMedia(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-media')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('media')
        .insert({
          profile_id: profile.id,
          media_type: 'image',
          image_url: publicUrl,
          display_order: imageCount,
        });

      if (dbError) throw dbError;

      await fetchMedia();
    } catch (error: any) {
      console.error('Image upload error:', error);
    } finally {
      setUploadingMedia(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !profile) return;

    try {
      const videoExists = mediaItems.some(item => item.media_type === 'video');
      if (videoExists) {
        alert('You can only upload 1 video. Please delete the existing video first.');
        return;
      }

      setUploadingMedia(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];

      const video = document.createElement('video');
      video.preload = 'metadata';

      const checkDuration = () => {
        return new Promise<number>((resolve, reject) => {
          video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src);
            resolve(video.duration);
          };
          video.onerror = () => reject(new Error('Failed to load video'));
          video.src = URL.createObjectURL(file);
        });
      };

      const duration = await checkDuration();

      if (duration > 20) {
        alert('Video must be 20 seconds or less');
        setUploadingMedia(false);
        if (event.target) event.target.value = '';
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/videos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-media')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('media')
        .insert({
          profile_id: profile.id,
          media_type: 'video',
          video_url: publicUrl,
          duration: duration,
          display_order: 0,
        });

      if (dbError) throw dbError;

      await fetchMedia();
    } catch (error: any) {
      console.error('Video upload error:', error);
    } finally {
      setUploadingMedia(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleDeleteMedia = async (mediaId: string, mediaType: 'image' | 'video', url: string | null) => {
    if (!confirm('Are you sure you want to delete this media?')) return;

    try {
      const { error: dbError } = await supabase
        .from('media')
        .delete()
        .eq('id', mediaId);

      if (dbError) throw dbError;

      if (url) {
        const urlParts = url.split('/profile-media/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          await supabase.storage
            .from('profile-media')
            .remove([filePath]);
        }
      }

      await fetchMedia();
      alert('Media deleted successfully!');
    } catch (error: any) {
      console.error('Delete media error:', error);
      alert(`Delete failed: ${error.message}`);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        setUploading(false);
        return;
      }

      const file = event.target.files[0];

      const validation = await validateSquareImage(file);
      if (!validation.isValid) {
        alert(validation.error);
        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          avatar_url: avatarUrl,
          bio,
          category: category || null,
          height: height || null,
          build: build || null,
          hair_colour: hairColour || null,
          eye_colour: eyeColour || null,
          smoke: smoke,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshProfile();
      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert(`Failed to update profile: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const getCategoryLabel = (category: string | null) => {
    const labels: Record<string, string> = {
      dating: 'Dating',
      content_creator: 'Content Creator',
      escort: 'Escort',
      ladyboy: 'Ladyboy',
      massage: 'Massage Shop',
    };
    return category ? labels[category] || category : 'General';
  };

  const imageItems = mediaItems.filter(item => item.media_type === 'image');

  const handlePrevImage = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : imageItems.length - 1);
  };

  const handleNextImage = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex(lightboxIndex < imageItems.length - 1 ? lightboxIndex + 1 : 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevImage();
    if (e.key === 'ArrowRight') handleNextImage();
    if (e.key === 'Escape') setLightboxIndex(null);
  };

  const unreadCount = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#FF1493]">Only Thais - Creator Portal</h1>
            <button
              onClick={signOut}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-2 mb-8 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${
              activeTab === 'profile'
                ? 'text-[#FF1493] border-b-2 border-[#FF1493]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`relative flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${
              activeTab === 'messages'
                ? 'text-[#FF1493] border-b-2 border-[#FF1493]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            Messages
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-[#FF1493] text-[#0A0A0A] text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${
              activeTab === 'analytics'
                ? 'text-[#FF1493] border-b-2 border-[#FF1493]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${
              activeTab === 'media'
                ? 'text-[#FF1493] border-b-2 border-[#FF1493]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-5 h-5" />
            Media
          </button>
          <button
            onClick={() => setActiveTab('profileLink')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${
              activeTab === 'profileLink'
                ? 'text-[#FF1493] border-b-2 border-[#FF1493]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-5 h-5" />
            My Profile Link
          </button>
          <button
            onClick={() => setActiveTab('viewProfile')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${
              activeTab === 'viewProfile'
                ? 'text-[#FF1493] border-b-2 border-[#FF1493]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Eye className="w-5 h-5" />
            View My Profile
          </button>
        </div>

        {activeTab === 'profile' && (
          <div className="bg-gray-900 rounded-2xl border-2 border-gray-800 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Manage Your Profile</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border-2 border-gray-800 rounded-lg text-white focus:border-[#FF1493] focus:outline-none transition-colors"
                  placeholder="Your display name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border-2 border-gray-800 rounded-lg text-white focus:border-[#FF1493] focus:outline-none transition-colors"
                >
                  <option value="">Select a category</option>
                  <option value="dating">Dating</option>
                  <option value="content_creator">Content Creator</option>
                  <option value="escort">Escort</option>
                  <option value="ladyboy">Ladyboy</option>
                  <option value="massage">Massage Shop</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Height
                  </label>
                  <input
                    type="text"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border-2 border-gray-800 rounded-lg text-white focus:border-[#FF1493] focus:outline-none transition-colors"
                    placeholder="e.g. 165 cm or 5'5&quot;"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Build
                  </label>
                  <select
                    value={build}
                    onChange={(e) => setBuild(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border-2 border-gray-800 rounded-lg text-white focus:border-[#FF1493] focus:outline-none transition-colors"
                  >
                    <option value="">Select build</option>
                    <option value="slim">Slim</option>
                    <option value="medium">Medium</option>
                    <option value="curvy">Curvy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hair Colour
                  </label>
                  <input
                    type="text"
                    value={hairColour}
                    onChange={(e) => setHairColour(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border-2 border-gray-800 rounded-lg text-white focus:border-[#FF1493] focus:outline-none transition-colors"
                    placeholder="e.g. Black, Brown"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Eye Colour
                  </label>
                  <input
                    type="text"
                    value={eyeColour}
                    onChange={(e) => setEyeColour(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border-2 border-gray-800 rounded-lg text-white focus:border-[#FF1493] focus:outline-none transition-colors"
                    placeholder="e.g. Brown, Black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Smoke
                  </label>
                  <select
                    value={smoke === null ? '' : smoke ? 'yes' : 'no'}
                    onChange={(e) => setSmoke(e.target.value === '' ? null : e.target.value === 'yes')}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border-2 border-gray-800 rounded-lg text-white focus:border-[#FF1493] focus:outline-none transition-colors"
                  >
                    <option value="">Select option</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div
                      className="w-32 h-32 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#FF1493] transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-16 h-16 text-gray-600" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-10 h-10 bg-[#FF1493] rounded-full flex items-center justify-center hover:bg-[#FF1493]/80 transition-colors"
                      disabled={uploading}
                    >
                      <Camera className="w-5 h-5 text-white" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-2">
                      Click the photo to upload a new square profile picture
                      <br />
                      <span className="text-xs text-gray-500">Image must be 1:1 aspect ratio</span>
                    </p>
                    {uploading && (
                      <p className="text-sm text-[#FF1493]">Uploading...</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  About Me
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 bg-[#0A0A0A] border-2 border-gray-800 rounded-lg text-white focus:border-[#FF1493] focus:outline-none transition-colors resize-none"
                  placeholder="Tell potential clients about yourself, your services, and what makes you unique..."
                />
                <p className="mt-2 text-sm text-gray-400">
                  {bio.length} / 1000 characters
                </p>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saving || uploading}
                className="w-full py-4 bg-[#0A0A0A] border-2 border-[#FF1493] text-white rounded-lg hover:bg-[#FF1493] hover:text-[#0A0A0A] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : uploading ? 'Uploading...' : 'Save Profile'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            <div className="bg-gray-900 rounded-2xl border-2 border-gray-800 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">Conversations</h2>
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
                          <img src={conv.avatar_url} alt={conv.display_name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-12 h-12 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-white">{conv.display_name}</p>
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

            <div className="lg:col-span-2 bg-gray-900 rounded-2xl border-2 border-gray-800 overflow-hidden flex flex-col">
              {selectedConversation ? (
                <>
                  <div className="p-4 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white">
                      {conversations.find(c => c.user_id === selectedConversation)?.display_name}
                    </h2>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${
                          msg.sender_id === user?.id ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
                          {msg.sender_profile.avatar_url ? (
                            <img src={msg.sender_profile.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-8 h-8 text-gray-500" />
                          )}
                        </div>
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            msg.sender_id === user?.id
                              ? 'bg-[#FF1493] text-white'
                              : 'bg-gray-800 text-white'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="p-4 border-t border-gray-800">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 bg-[#0A0A0A] border-2 border-gray-800 rounded-lg text-white focus:border-[#FF1493] focus:outline-none transition-colors"
                        disabled={sending}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={sending || !newMessage.trim()}
                        className="px-6 py-3 bg-[#FF1493] text-white rounded-lg hover:bg-[#FF1493]/80 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  Select a conversation to start messaging
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-2xl border-2 border-gray-800 p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-[#FF1493]/20 rounded-full flex items-center justify-center">
                  <Heart className="w-8 h-8 text-[#FF1493]" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Favorites</p>
                  <p className="text-4xl font-bold text-white">{favoritesCount}</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Number of users who have favorited your profile
              </p>
            </div>

            <div className="bg-gray-900 rounded-2xl border-2 border-gray-800 p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-[#FF1493]/20 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-[#FF1493]" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Messages</p>
                  <p className="text-4xl font-bold text-white">{totalMessages}</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Total messages received from users
              </p>
            </div>

            <div className="md:col-span-2 bg-gray-900 rounded-2xl border-2 border-gray-800 p-8">
              <h3 className="text-xl font-bold text-white mb-4">Profile Performance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Profile Completeness</span>
                  <span className="text-white font-semibold">
                    {[displayName, avatarUrl, bio, category, height].filter(Boolean).length * 20}%
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-[#FF1493] h-2 rounded-full transition-all"
                    style={{ width: `${[displayName, avatarUrl, bio, category, height].filter(Boolean).length * 20}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-4">
                  Complete profiles get more visibility and engagement. Fill in all fields to maximize your reach.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-2xl border-2 border-gray-800 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Manage Your Media</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 hover:border-[#FF1493] transition-colors">
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Upload Images</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      {mediaItems.filter(item => item.media_type === 'image').length} / 10 images uploaded
                    </p>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingMedia || mediaItems.filter(item => item.media_type === 'image').length >= 10}
                    />
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      disabled={uploadingMedia || mediaItems.filter(item => item.media_type === 'image').length >= 10}
                      className="px-6 py-3 bg-[#FF1493] text-white rounded-lg hover:bg-[#FF1493]/80 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                    >
                      <Upload className="w-5 h-5" />
                      {uploadingMedia ? 'Uploading...' : 'Upload Image'}
                    </button>
                  </div>
                </div>

                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 hover:border-[#FF1493] transition-colors">
                  <div className="text-center">
                    <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Upload Video</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      {mediaItems.some(item => item.media_type === 'video') ? '1 / 1 video uploaded' : '0 / 1 video uploaded'} (max 20 seconds)
                    </p>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/mp4,video/quicktime,video/webm"
                      onChange={handleVideoUpload}
                      className="hidden"
                      disabled={uploadingMedia || mediaItems.some(item => item.media_type === 'video')}
                    />
                    <button
                      onClick={() => videoInputRef.current?.click()}
                      disabled={uploadingMedia || mediaItems.some(item => item.media_type === 'video')}
                      className="px-6 py-3 bg-[#FF1493] text-white rounded-lg hover:bg-[#FF1493]/80 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                    >
                      <Upload className="w-5 h-5" />
                      {uploadingMedia ? 'Uploading...' : 'Upload Video'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Your Media</h3>

                {mediaItems.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No media uploaded yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {mediaItems.map((item) => (
                      <div key={item.id} className="relative group">
                        <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                          {item.media_type === 'image' && item.image_url && (
                            <img
                              src={item.image_url}
                              alt="Profile media"
                              className="w-full h-full object-cover"
                            />
                          )}
                          {item.media_type === 'video' && item.video_url && (
                            <video
                              src={item.video_url}
                              className="w-full h-full object-cover"
                              controls
                            />
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteMedia(item.id, item.media_type, item.media_type === 'image' ? item.image_url : item.video_url)}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {item.media_type === 'video' && (
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {item.duration?.toFixed(1)}s
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl border-2 border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Media Guidelines</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-[#FF1493] mt-1">•</span>
                  <span>You can upload up to 10 images to showcase your profile</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF1493] mt-1">•</span>
                  <span>One video is allowed, maximum duration of 20 seconds</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF1493] mt-1">•</span>
                  <span>Supported image formats: JPEG, PNG, GIF, WebP</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF1493] mt-1">•</span>
                  <span>Supported video formats: MP4, QuickTime, WebM</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF1493] mt-1">•</span>
                  <span>Use high-quality media that clearly represents you</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'profileLink' && (
          <div className="bg-gray-900 rounded-2xl border-2 border-gray-800 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">My Profile Link</h2>

            <div className="space-y-6">
              <div>
                <p className="text-gray-400 mb-4">
                  Share this link with potential clients to direct them to your profile:
                </p>

                <div className="bg-[#0A0A0A] border-2 border-gray-800 rounded-lg p-6">
                  <div className="flex items-center gap-4">
                    <LinkIcon className="w-8 h-8 text-[#FF1493] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-400 mb-2">Your Profile URL</p>
                      <p className="text-white font-mono text-lg break-all">
                        {window.location.origin}/profile/{profile?.id}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/profile/${profile?.id}`);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="w-full mt-6 py-3 bg-[#FF1493] text-white rounded-lg hover:bg-[#FF1493]/80 transition-colors font-semibold flex items-center justify-center gap-2"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-5 h-5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        Copy Link
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-[#FF1493]/10 border-2 border-[#FF1493]/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-[#FF1493]" />
                  Tips for Sharing Your Profile
                </h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF1493] mt-1">•</span>
                    <span>Share this link on your social media profiles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF1493] mt-1">•</span>
                    <span>Add it to your bio on other platforms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF1493] mt-1">•</span>
                    <span>Include it in your business cards or promotional materials</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#FF1493] mt-1">•</span>
                    <span>Share directly with interested clients via messaging apps</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-800/50 border-2 border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Profile Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Total Favorites</p>
                    <p className="text-2xl font-bold text-[#FF1493]">{favoritesCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Messages</p>
                    <p className="text-2xl font-bold text-[#FF1493]">{totalMessages}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'viewProfile' && (
          <div className="space-y-6">
            <div className="bg-[#FF1493]/10 border-2 border-[#FF1493]/30 rounded-lg p-4">
              <p className="text-white text-sm">
                <Eye className="w-4 h-4 inline mr-2" />
                This is how your profile appears to users browsing the platform.
              </p>
            </div>

            <div className="bg-gray-900 rounded-2xl border-2 border-gray-800 overflow-hidden">
              <div className="aspect-[21/9] bg-gray-800 relative">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name || 'Profile'}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-32 h-32 text-gray-600" />
                  </div>
                )}
                {profile?.category && (
                  <div className="absolute top-6 right-6 px-4 py-2 bg-[#FF1493] text-[#0A0A0A] text-sm font-semibold rounded-full">
                    {getCategoryLabel(profile.category)}
                  </div>
                )}
              </div>

              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                      {profile?.display_name || 'Anonymous Creator'}
                    </h1>
                    <p className="text-gray-400">
                      {getCategoryLabel(profile?.category || null)}
                    </p>
                  </div>
                  <div className="px-6 py-3 bg-gray-800 border-2 border-gray-700 text-gray-400 rounded-lg font-semibold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Send Message
                  </div>
                </div>

                {(profile?.height || profile?.build || profile?.hair_colour || profile?.eye_colour || profile?.smoke !== null) && (
                  <div className="bg-[#0A0A0A] rounded-xl p-6 border-2 border-gray-800 mb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Details</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {profile?.height && (
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Height</p>
                          <p className="text-white font-medium">{profile.height}</p>
                        </div>
                      )}
                      {profile?.build && (
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Build</p>
                          <p className="text-white font-medium capitalize">{profile.build}</p>
                        </div>
                      )}
                      {profile?.hair_colour && (
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Hair Colour</p>
                          <p className="text-white font-medium">{profile.hair_colour}</p>
                        </div>
                      )}
                      {profile?.eye_colour && (
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Eye Colour</p>
                          <p className="text-white font-medium">{profile.eye_colour}</p>
                        </div>
                      )}
                      {profile?.smoke !== null && (
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Smoke</p>
                          <p className="text-white font-medium">{profile.smoke ? 'Yes' : 'No'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {profile?.bio && (
                  <div className="bg-[#0A0A0A] rounded-xl p-6 border-2 border-gray-800">
                    <h2 className="text-xl font-semibold text-white mb-3">About</h2>
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {profile.bio}
                    </p>
                  </div>
                )}

                {mediaItems.length > 0 && (
                  <div className="bg-[#0A0A0A] rounded-xl p-6 border-2 border-gray-800 mt-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Photos & Videos</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {mediaItems.map((item) => (
                        <div key={item.id} className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden">
                          {item.media_type === 'image' && item.image_url && (
                            <img
                              src={item.image_url}
                              alt="Profile media"
                              className="w-full h-full object-contain hover:opacity-80 transition-opacity cursor-pointer"
                              onClick={() => setLightboxIndex(imageItems.findIndex(img => img.id === item.id))}
                            />
                          )}
                          {item.media_type === 'video' && item.video_url && (
                            <>
                              <video
                                src={item.video_url}
                                className="w-full h-full object-contain"
                                controls
                              />
                              {item.duration && (
                                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                  {item.duration.toFixed(1)}s
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {mediaItems.length === 0 && !profile?.bio && (
                  <div className="bg-[#0A0A0A] rounded-xl p-6 border-2 border-gray-800 mt-6 text-center">
                    <p className="text-gray-400">
                      Your profile looks a bit empty. Add photos, videos, and an about section to make it more appealing!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {lightboxIndex !== null && imageItems[lightboxIndex] && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 w-12 h-12 bg-gray-900/80 hover:bg-gray-800 rounded-full flex items-center justify-center text-white transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {imageItems.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                className="absolute left-4 w-12 h-12 bg-gray-900/80 hover:bg-gray-800 rounded-full flex items-center justify-center text-white transition-colors z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="absolute right-4 w-12 h-12 bg-gray-900/80 hover:bg-gray-800 rounded-full flex items-center justify-center text-white transition-colors z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="relative w-full h-full flex items-center justify-center p-8" onClick={(e) => e.stopPropagation()}>
            <img
              src={imageItems[lightboxIndex].image_url || ''}
              alt="Full size"
              className="max-w-[95vw] max-h-[95vh] object-contain"
            />
            {imageItems.length > 1 && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900/80 text-white px-4 py-2 rounded-full text-sm">
                {lightboxIndex + 1} / {imageItems.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
