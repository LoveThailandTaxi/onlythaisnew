import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Heart, Video, Users, Sparkles, Flower2, User, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Footer from '../components/Footer';

interface FeaturedProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  category: string | null;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [featuredProfiles, setFeaturedProfiles] = useState<FeaturedProfile[]>([]);

  useEffect(() => {
    fetchFeaturedProfiles();
  }, []);

  const fetchFeaturedProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, category')
        .eq('user_type', 'creator')
        .not('avatar_url', 'is', null)
        .limit(21);

      if (error) throw error;

      if (data) {
        setFeaturedProfiles(data);
      }
    } catch (error) {
      console.error('Error fetching featured profiles:', error);
      setFeaturedProfiles([]);
    }
  };

  const getCategoryLabel = (category: string | null) => {
    const labels: Record<string, string> = {
      dating: 'Dating',
      content_creator: 'Content Creator',
      escort: 'Escort',
      ladyboy: 'Ladyboy',
      massage: 'Massage',
    };
    return category ? labels[category] || category : 'Featured';
  };

  const categories = [
    {
      id: 'dating',
      title: 'Dating',
      icon: Heart,
      image: '/Thailady.jpg',
    },
    {
      id: 'content_creator',
      title: 'Content Creators',
      icon: Video,
      image: '/northstar.jpg',
    },
    {
      id: 'escort',
      title: 'Escorts',
      icon: Users,
      image: '/T-Sugar-22.jpg',
    },
    {
      id: 'ladyboy',
      title: 'Ladyboys',
      icon: Sparkles,
      image: '/istockphoto-528616252-612x612.jpg',
    },
    {
      id: 'massage',
      title: 'Massage Shops',
      icon: Flower2,
      image: '/Price-of-Massages-in-Thailand-5-1024x683.jpg',
    },
    {
      id: 'vip',
      title: 'VIP Experience',
      icon: User,
      image: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-[#FF1493]">Only Thais</h1>
            <div className="flex gap-4 items-center">
              <button
                onClick={() => navigate('/creator-signup')}
                className="px-6 py-2 bg-[#FF1493] text-white hover:bg-white hover:text-[#FF1493] transition-colors font-semibold border border-[#FF1493] rounded-lg"
              >
                Thai woman or ladyboy?
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="px-6 py-2 bg-[#0A0A0A] border-2 border-[#FF1493] text-white rounded-lg hover:bg-[#FF1493] hover:text-[#0A0A0A] transition-all"
              >
                Log In / Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4">
            Meet Thai Women and Content Creators
          </h2>
          <p className="text-xl text-gray-400">
            The premium network for genuine connections
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.id}
                onClick={() => navigate('/auth?mode=signup')}
                className="group cursor-pointer relative overflow-hidden rounded-2xl aspect-[4/3] bg-gray-900 border-2 border-gray-800 hover:border-[#FF1493] transition-all duration-300 hover:shadow-[0_0_30px_rgba(137,207,240,0.3)]"
              >
                <img
                  src={category.image}
                  alt={category.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-50 transition-opacity"
                  style={
                    category.id === 'content_creator' || category.id === 'escort' || category.id === 'ladyboy'
                      ? { objectPosition: 'center 20%' }
                      : undefined
                  }
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-3">
                    <Icon className="w-8 h-8 text-[#FF1493]" />
                    <h3 className="text-2xl font-bold text-white">
                      {category.title}
                    </h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {featuredProfiles.length > 0 && (
          <section className="mt-24">
            <div className="flex items-center justify-center gap-3 mb-12">
              <Star className="w-8 h-8 text-[#FF1493]" />
              <h2 className="text-4xl font-bold text-white">This Month's Top Picks</h2>
              <Star className="w-8 h-8 text-[#FF1493]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProfiles.map((profile) => (
                <div
                  key={profile.id}
                  onClick={() => navigate('/auth?mode=signup')}
                  className="group cursor-pointer bg-gray-900 rounded-2xl border-2 border-gray-800 hover:border-[#FF1493] transition-all overflow-hidden hover:shadow-[0_0_30px_rgba(137,207,240,0.3)]"
                >
                  <div className="aspect-[4/3] bg-gray-800 relative overflow-hidden">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.display_name || 'Featured Creator'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-16 h-16 text-gray-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {profile.category && (
                      <div className="absolute top-3 right-3 px-3 py-1 bg-[#FF1493] text-[#0A0A0A] text-xs font-semibold rounded-full">
                        {getCategoryLabel(profile.category)}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white truncate">
                      {profile.display_name || 'Featured Creator'}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      Sign up to view profile
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <section className="mt-24 mb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#FF1493]/20 via-[#FF1493]/10 to-transparent rounded-3xl border-2 border-[#FF1493] p-12">
            <div className="max-w-3xl">
              <h2 className="text-4xl font-bold text-white mb-4">
                Are You a Thai Woman or Ladyboy?
              </h2>
              <p className="text-xl text-gray-300 mb-6">
                Join for free and connect with verified male members. Create your profile, showcase yourself, and meet quality men looking for genuine connections.
              </p>
              <button
                onClick={() => navigate('/creator-signup')}
                className="px-10 py-4 bg-[#FF1493] text-white text-lg font-bold rounded-xl hover:bg-[#FF1493]/80 transition-all transform hover:scale-105 shadow-lg shadow-[#FF1493]/20"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
