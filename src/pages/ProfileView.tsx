import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { canSendMessage } from '../lib/messageTracking';
import { ArrowLeft, MessageSquare, User, X, ChevronLeft, ChevronRight, Flag, Ban } from 'lucide-react';
import ReportModal from '../components/ReportModal';

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  category: string | null;
  height: string | null;
  build: string | null;
  hair_colour: string | null;
  eye_colour: string | null;
  smoke: boolean | null;
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

export default function ProfileView() {
  const { id } = useParams();
  const { user, subscription } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || subscription?.tier === 'none') {
      navigate('/subscribe');
      return;
    }

    fetchProfile();
    checkBlockStatus();
  }, [id, user, subscription]);

  const checkBlockStatus = async () => {
    if (!user || !id) return;

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', id)
        .maybeSingle();

      if (!profileData) return;

      const { data, error } = await supabase
        .from('blocks')
        .select('id')
        .eq('blocker_id', user.id)
        .eq('blocked_id', profileData.id)
        .maybeSingle();

      if (!error && data) {
        setIsBlocked(true);
      }
    } catch (error) {
      console.error('Error checking block status:', error);
    }
  };

  const handleToggleBlock = async () => {
    if (!user || !profile) return;

    setBlockLoading(true);
    try {
      if (isBlocked) {
        const { error } = await supabase
          .from('blocks')
          .delete()
          .eq('blocker_id', user.id)
          .eq('blocked_id', profile.id);

        if (error) throw error;
        setIsBlocked(false);
        alert('User unblocked successfully');
      } else {
        const { error } = await supabase
          .from('blocks')
          .insert({
            blocker_id: user.id,
            blocked_id: profile.id,
          });

        if (error) throw error;
        setIsBlocked(true);
        alert('User blocked successfully. You will not receive messages from this user.');
      }
    } catch (error) {
      console.error('Error toggling block:', error);
      alert('Failed to update block status. Please try again.');
    } finally {
      setBlockLoading(false);
    }
  };

  const fetchProfile = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);

      if (data) {
        const { data: media, error: mediaError } = await supabase
          .from('media')
          .select('*')
          .eq('profile_id', data.id)
          .order('display_order', { ascending: true });

        if (mediaError) throw mediaError;
        setMediaItems(media || []);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
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

  const handleSendMessage = async () => {
    if (!user || !profile || !subscription) return;

    const messageCheck = await canSendMessage(user.id, profile.user_id, subscription.tier);

    if (!messageCheck.canSend) {
      alert(messageCheck.reason || 'You cannot send a message to this creator.');
      return;
    }

    if (messageCheck.remaining !== undefined && messageCheck.remaining <= 5) {
      const proceed = confirm(
        `You have ${messageCheck.remaining} initial contact messages remaining this month. Continue?`
      );
      if (!proceed) return;
    }

    navigate(`/messages?to=${profile.user_id}`);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-[#FF1493] text-xl">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-xl mb-4">Profile not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-[#FF1493] hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
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
            <span>Back to Browse</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-900 rounded-2xl border-2 border-gray-800 overflow-hidden">
          <div className="aspect-[21/9] bg-gray-800 relative">
            {profile.avatar_url ? (
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
            {profile.category && (
              <div className="absolute top-6 right-6 px-4 py-2 bg-[#FF1493] text-[#0A0A0A] text-sm font-semibold rounded-full">
                {getCategoryLabel(profile.category)}
              </div>
            )}
          </div>

          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {profile.display_name || 'Anonymous Creator'}
                </h1>
                <p className="text-gray-400">
                  {getCategoryLabel(profile.category)}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReportModal(true)}
                  className="px-4 py-3 bg-gray-800 border-2 border-gray-700 text-gray-300 rounded-lg hover:border-gray-600 transition-all flex items-center gap-2"
                  title="Report this profile"
                >
                  <Flag className="w-5 h-5" />
                </button>
                <button
                  onClick={handleToggleBlock}
                  disabled={blockLoading}
                  className={`px-4 py-3 border-2 rounded-lg transition-all flex items-center gap-2 ${
                    isBlocked
                      ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                      : 'bg-red-900/20 border-red-700 text-red-400 hover:bg-red-900/30'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={isBlocked ? 'Unblock this user' : 'Block this user'}
                >
                  <Ban className="w-5 h-5" />
                  {isBlocked ? 'Unblock' : 'Block'}
                </button>
                <button
                  onClick={handleSendMessage}
                  className="px-6 py-3 bg-[#0A0A0A] border-2 border-[#FF1493] text-white rounded-lg hover:bg-[#FF1493] hover:text-[#0A0A0A] transition-all font-semibold flex items-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  Send Message
                </button>
              </div>
            </div>

            {(profile.height || profile.build || profile.hair_colour || profile.eye_colour || profile.smoke !== null) && (
              <div className="bg-[#0A0A0A] rounded-xl p-6 border-2 border-gray-800 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">Details</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {profile.height && (
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Height</p>
                      <p className="text-white font-medium">{profile.height}</p>
                    </div>
                  )}
                  {profile.build && (
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Build</p>
                      <p className="text-white font-medium capitalize">{profile.build}</p>
                    </div>
                  )}
                  {profile.hair_colour && (
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Hair Colour</p>
                      <p className="text-white font-medium">{profile.hair_colour}</p>
                    </div>
                  )}
                  {profile.eye_colour && (
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Eye Colour</p>
                      <p className="text-white font-medium">{profile.eye_colour}</p>
                    </div>
                  )}
                  {profile.smoke !== null && (
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Smoke</p>
                      <p className="text-white font-medium">{profile.smoke ? 'Yes' : 'No'}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {profile.bio && (
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
                  {mediaItems.map((item, index) => (
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
          </div>
        </div>
      </main>

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

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportedUserId={profile.id}
        reportedContentType="profile"
        reportedContentId={profile.id}
      />
    </div>
  );
}
