import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Heart, MapPin, ChevronLeft } from 'lucide-react';

interface Profile {
  id: string;
  display_name: string;
  bio: string;
  category: string;
  media: Array<{
    image_url: string;
    is_primary: boolean;
  }> | null;
}

export default function BrowseProfiles() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  async function fetchProfiles() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          display_name,
          bio,
          category,
          media (
            image_url,
            is_primary
          )
        `)
        .eq('user_type', 'creator')
        .eq('category', 'dating')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Raw data from Supabase:', JSON.stringify(data, null, 2));
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  }

  function getPrimaryImage(profile: Profile): string {
    console.log('Getting primary image for profile:', profile.display_name);
    console.log('Profile media:', profile.media);

    if (!profile.media || profile.media.length === 0) {
      console.warn('No media found for profile:', profile.display_name);
      return 'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=800';
    }

    const primaryMedia = profile.media.find(m => m.is_primary);
    const imageUrl = primaryMedia?.image_url || profile.media[0]?.image_url;
    console.log('Selected image URL for', profile.display_name, ':', imageUrl);

    return imageUrl || 'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=800';
  }

  function getAge(bio: string): string | null {
    const ageMatch = bio.match(/(\d+)\s*years?\s*old/i);
    return ageMatch ? ageMatch[1] : null;
  }

  function getLocation(bio: string): string {
    const locationMatch = bio.match(/from\s+([A-Za-z\s]+?)[\.,]/i);
    return locationMatch ? locationMatch[1].trim() : 'Thailand';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading profiles...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <header className="bg-black/30 backdrop-blur-md border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold">
                <span className="text-white">Only</span>
                <span className="text-[#FF1493]">Thais</span>
              </h1>
            </div>
            <button
              onClick={() => navigate('/auth')}
              className="px-6 py-2 bg-[#FF1493] text-white rounded-lg hover:bg-[#FF1493]/80 transition-colors font-semibold"
            >
              Log In / Sign Up
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-3">Browse Profiles</h2>
          <p className="text-xl text-gray-400">
            Meet beautiful Thai women looking for genuine connections
          </p>
        </div>

        {profiles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No profiles found. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {profiles.map((profile) => {
              const age = getAge(profile.bio);
              const location = getLocation(profile.bio);
              const primaryImage = getPrimaryImage(profile);

              return (
                <div
                  key={profile.id}
                  onClick={() => navigate(`/profile/${profile.id}`)}
                  className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700 hover:border-[#FF1493] transition-all cursor-pointer group"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-700">
                    <img
                      src={primaryImage}
                      alt={profile.display_name}
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        console.error('Image failed to load for', profile.display_name, ':', primaryImage);
                        console.error('Error event:', e);
                        if (!img.src.includes('1024311')) {
                          img.src = 'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=800';
                        }
                      }}
                      onLoad={() => console.log('✓ Image loaded successfully for', profile.display_name, ':', primaryImage)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white text-2xl font-bold mb-1">
                        {profile.display_name}
                        {age && <span className="text-xl ml-2">{age}</span>}
                      </h3>
                      <div className="flex items-center gap-1 text-gray-300">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-400 text-sm line-clamp-3">
                      {profile.bio}
                    </p>
                    <button className="mt-4 w-full py-2 bg-[#FF1493]/10 text-[#FF1493] rounded-lg hover:bg-[#FF1493]/20 transition-colors font-semibold flex items-center justify-center gap-2">
                      <Heart className="w-4 h-4" />
                      View Profile
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-[#FF1493]/10 to-transparent rounded-2xl border-2 border-[#FF1493] p-8 inline-block">
            <h3 className="text-2xl font-bold text-white mb-3">
              Want to see more and connect?
            </h3>
            <p className="text-gray-300 mb-6">
              Subscribe now to unlock unlimited profiles and messaging
            </p>
            <button
              onClick={() => navigate('/subscribe')}
              className="px-8 py-3 bg-[#FF1493] text-white rounded-xl hover:bg-[#FF1493]/80 transition-all transform hover:scale-105 font-semibold"
            >
              View Subscription Plans
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
