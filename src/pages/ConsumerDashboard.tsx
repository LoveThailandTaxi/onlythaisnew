import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getMessageUsage, MessageUsage } from '../lib/messageTracking';
import { Search, MessageSquare, LogOut, Crown, User, Camera, Heart, Video, Users, Sparkles, Flower2, Star } from 'lucide-react';
import { validateSquareImage } from '../utils/imageValidation';

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  category: string | null;
  is_new_creator: boolean | null;
  height: string | null;
  build: string | null;
  hair_colour: string | null;
  eye_colour: string | null;
  smoke: boolean | null;
}

export default function ConsumerDashboard() {
  const { user, profile, subscription, signOut, refreshProfile } = useAuth();
  const [creators, setCreators] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [messageUsage, setMessageUsage] = useState<MessageUsage | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !profile) {
      navigate('/auth');
      return;
    }

    if (subscription?.tier === 'none') {
      navigate('/subscribe');
      return;
    }

    fetchCreators();
    fetchMessageUsage();
    fetchFavorites();
    fetchUnreadCount();
  }, [user, profile, subscription, selectedCategory, showFavoritesOnly, favorites]);

  const fetchMessageUsage = async () => {
    if (!user) return;
    const usage = await getMessageUsage(user.id);
    setMessageUsage(usage);
  };

  const fetchFavorites = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('creator_id')
        .eq('consumer_id', user.id);

      if (error) throw error;
      const favoriteIds = new Set(data?.map(f => f.creator_id) || []);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('read_status', false);

      if (error) throw error;
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const toggleFavorite = async (creatorId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    try {
      const isFavorite = favorites.has(creatorId);

      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('consumer_id', user.id)
          .eq('creator_id', creatorId);

        if (error) throw error;

        setFavorites(prev => {
          const next = new Set(prev);
          next.delete(creatorId);
          return next;
        });
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({
            consumer_id: user.id,
            creator_id: creatorId,
          });

        if (error) throw error;

        setFavorites(prev => new Set(prev).add(creatorId));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const fetchCreators = async () => {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'creator');

      if (showFavoritesOnly) {
        if (favorites.size === 0) {
          setCreators([]);
          setLoading(false);
          return;
        }
        query = query.in('id', Array.from(favorites));
      }

      if (selectedCategory && selectedCategory !== 'favorites') {
        query = query.eq('category', selectedCategory);
      }

      if (subscription?.tier === 'vip') {
        query = query.order('is_new_creator', { ascending: false });
      }

      query = query.order('created_at', { ascending: false }).limit(20);

      const { data, error } = await query;

      if (error) throw error;
      setCreators(data || []);
    } catch (error) {
      console.error('Error fetching creators:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchCreators();
      return;
    }

    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'creator')
        .or(`display_name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`);

      if (selectedCategory && selectedCategory !== 'favorites') {
        query = query.eq('category', selectedCategory);
      }

      if (subscription?.tier === 'vip') {
        query = query.order('is_new_creator', { ascending: false });
      }

      query = query.order('created_at', { ascending: false }).limit(20);

      const { data, error } = await query;

      if (error) throw error;
      setCreators(data || []);
    } catch (error) {
      console.error('Error searching creators:', error);
    } finally {
      setLoading(false);
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

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          avatar_url: avatarUrl,
        })
        .eq('user_id', user.id);

      if (error) throw error;
      await refreshProfile();
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
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

  if (loading && creators.length === 0) {
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
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#FF1493]">Only Thais</h1>
            <div className="flex items-center gap-6">
              {subscription?.tier === 'vip' && (
                <div className="flex items-center gap-2 px-3 py-1 bg-[#FF1493]/10 border border-[#FF1493] rounded-full">
                  <Crown className="w-4 h-4 text-[#FF1493]" />
                  <span className="text-sm font-semibold text-[#FF1493]">VIP</span>
                </div>
              )}
              <button
                onClick={() => navigate('/messages')}
                className="relative p-2 text-gray-400 hover:text-[#FF1493] transition-colors"
              >
                <MessageSquare className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF1493] text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setEditMode(!editMode)}
                className="p-2 text-gray-400 hover:text-[#FF1493] transition-colors"
              >
                <User className="w-6 h-6" />
              </button>
              <button
                onClick={signOut}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {subscription?.tier === 'standard' && (
          <div className="mb-8 bg-gray-900 rounded-2xl border-2 border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Standard Membership</h2>
                <p className="text-gray-400">
                  New Creators Contacted: {messageUsage?.message_count || 0} / 30 this month
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Unlimited messages with creators you've already contacted
                </p>
                {messageUsage && messageUsage.message_count >= 25 && (
                  <p className="text-[#FF1493] text-sm mt-2">
                    Running low on new contacts! Upgrade to VIP for unlimited reach.
                  </p>
                )}
              </div>
              <button
                onClick={() => navigate('/subscribe')}
                className="px-6 py-3 bg-[#0A0A0A] border-2 border-[#FF1493] text-white rounded-lg hover:bg-[#FF1493] hover:text-[#0A0A0A] transition-all font-semibold flex items-center gap-2"
              >
                <Crown className="w-5 h-5" />
                Upgrade to VIP
              </button>
            </div>
          </div>
        )}

        {subscription?.tier === 'vip' && (
          <div className="mb-8 bg-gradient-to-r from-[#FF1493]/10 to-transparent rounded-2xl border-2 border-[#FF1493] p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Crown className="w-6 h-6 text-[#FF1493]" />
                  <h2 className="text-xl font-bold text-white">VIP Membership</h2>
                </div>
                <p className="text-gray-300">
                  Contact unlimited creators, early access to new profiles, and priority support
                </p>
              </div>
            </div>
          </div>
        )}

        {editMode && (
          <div className="mb-8 bg-gray-900 rounded-2xl border-2 border-gray-800 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Edit Your Profile</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div
                    className="w-24 h-24 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#FF1493] transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-gray-600" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-[#FF1493] rounded-full flex items-center justify-center hover:bg-[#FF1493]/80 transition-colors"
                    disabled={uploading}
                  >
                    <Camera className="w-4 h-4 text-white" />
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
                <div className="flex-1 flex flex-col justify-center">
                  <p className="text-xs text-gray-400 mb-2">
                    Click to upload a square profile photo
                  </p>
                  <p className="text-xs text-gray-500">Image must be 1:1 aspect ratio</p>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-2 bg-[#0A0A0A] border-2 border-gray-800 rounded-lg text-white focus:border-[#FF1493] focus:outline-none"
                    placeholder="Your display name"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleUpdateProfile}
                  disabled={uploading}
                  className="px-6 py-2 bg-[#0A0A0A] border-2 border-[#FF1493] text-white rounded-lg hover:bg-[#FF1493] hover:text-[#0A0A0A] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search creators by name or interests..."
                className="w-full pl-12 pr-4 py-4 bg-gray-900 border-2 border-gray-800 rounded-xl text-white focus:border-[#FF1493] focus:outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-8 py-4 bg-[#0A0A0A] border-2 border-[#FF1493] text-white rounded-xl hover:bg-[#FF1493] hover:text-[#0A0A0A] transition-all font-semibold"
            >
              Search
            </button>
          </div>
        </div>

        <div className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { id: 'dating', title: 'Dating', icon: Heart, image: '/Thailady.jpg' },
              { id: 'content_creator', title: 'Content Creators', icon: Video, image: '/northstar.jpg' },
              { id: 'escort', title: 'Escorts', icon: Users, image: '/T-Sugar-22.jpg' },
              { id: 'ladyboy', title: 'Ladyboys', icon: Sparkles, image: '/istockphoto-528616252-612x612.jpg' },
              { id: 'massage', title: 'Massage Shops', icon: Flower2, image: '/Price-of-Massages-in-Thailand-5-1024x683.jpg' },
              { id: 'favorites', title: 'My Favourites', icon: Star, image: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=800' },
            ].map((category) => {
              const Icon = category.icon;
              const isSelected = category.id === 'favorites' ? showFavoritesOnly : selectedCategory === category.id;
              return (
                <div
                  key={category.id}
                  onClick={() => {
                    if (category.id === 'favorites') {
                      setShowFavoritesOnly(!showFavoritesOnly);
                      setSelectedCategory(null);
                    } else {
                      setSelectedCategory(isSelected ? null : category.id);
                      setShowFavoritesOnly(false);
                    }
                    setSearchQuery('');
                  }}
                  className={`group cursor-pointer relative overflow-hidden rounded-xl aspect-[4/3] bg-gray-900 transition-all duration-300 ${
                    isSelected
                      ? 'border-4 border-[#FF1493] shadow-[0_0_20px_rgba(255,20,147,0.4)]'
                      : 'border-2 border-gray-800 hover:border-[#FF1493]'
                  }`}
                >
                  <img
                    src={category.image}
                    alt={category.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                    style={
                      category.id === 'content_creator' || category.id === 'escort' || category.id === 'ladyboy'
                        ? { objectPosition: 'center 20%' }
                        : undefined
                    }
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex flex-col items-center gap-1">
                      <div className="relative">
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-[#FF1493]' : 'text-white'}`} />
                        {category.id === 'favorites' && favorites.size > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF1493] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {favorites.size}
                          </span>
                        )}
                      </div>
                      <h3 className={`text-xs font-bold text-center ${isSelected ? 'text-[#FF1493]' : 'text-white'}`}>
                        {category.title}
                      </h3>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-center gap-4">
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-gray-400 hover:text-[#FF1493] transition-colors text-sm"
              >
                Clear category filter
              </button>
            )}
            <button
              onClick={() => {
                setShowFavoritesOnly(!showFavoritesOnly);
                setSelectedCategory(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                showFavoritesOnly
                  ? 'bg-[#FF1493] text-white'
                  : 'bg-gray-900 border-2 border-gray-800 text-gray-300 hover:border-[#FF1493]'
              }`}
            >
              <Heart
                className="w-4 h-4"
                fill={showFavoritesOnly ? 'currentColor' : 'none'}
              />
              {showFavoritesOnly ? 'Show All' : 'Show Favorites'}
              {favorites.size > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  showFavoritesOnly ? 'bg-white text-[#FF1493]' : 'bg-[#FF1493] text-white'
                }`}>
                  {favorites.size}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creators.map((creator) => (
            <div
              key={creator.id}
              onClick={() => navigate(`/profile/${creator.id}`)}
              className="group cursor-pointer bg-gray-900 rounded-2xl border-2 border-gray-800 hover:border-[#FF1493] transition-all overflow-hidden"
            >
              <div className="aspect-[4/3] bg-gray-800 relative overflow-hidden">
                {creator.avatar_url ? (
                  <img
                    src={creator.avatar_url}
                    alt={creator.display_name || 'Creator'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-600" />
                  </div>
                )}
                <button
                  onClick={(e) => toggleFavorite(creator.id, e)}
                  className={`absolute top-3 left-3 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    favorites.has(creator.id)
                      ? 'bg-[#FF1493] text-white'
                      : 'bg-black/50 text-white hover:bg-[#FF1493]'
                  }`}
                >
                  <Heart
                    className="w-5 h-5"
                    fill={favorites.has(creator.id) ? 'currentColor' : 'none'}
                  />
                </button>
                {subscription?.tier === 'vip' && creator.is_new_creator && (
                  <div className="absolute top-3 left-14 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full animate-pulse">
                    New!
                  </div>
                )}
                {creator.category && (
                  <div className="absolute top-3 right-3 px-3 py-1 bg-[#FF1493] text-[#0A0A0A] text-xs font-semibold rounded-full">
                    {getCategoryLabel(creator.category)}
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  {creator.display_name || 'Anonymous Creator'}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-2">
                  {creator.bio || 'No description available'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {creators.length === 0 && !loading && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No creators found. Try a different search.</p>
          </div>
        )}
      </main>
    </div>
  );
}
