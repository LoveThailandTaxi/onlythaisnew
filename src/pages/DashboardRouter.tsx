import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ConsumerDashboard from './ConsumerDashboard';
import CreatorDashboard from './CreatorDashboard';

export default function DashboardRouter() {
  const { user, profile, subscription, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.role === 'admin') {
        navigate('/admin');
      } else if (!profile.display_name) {
        navigate('/profile-setup');
      } else if (profile.user_type === 'creator' && !profile.category) {
        navigate('/profile-setup');
      } else if (profile.user_type === 'consumer' && (!subscription || subscription.tier === 'none')) {
        navigate('/subscribe');
      }
    } else if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, profile, subscription, loading, navigate]);

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
        <div className="text-[#FF1493] text-xl">Loading profile...</div>
      </div>
    );
  }

  return profile.user_type === 'creator' ? <CreatorDashboard /> : <ConsumerDashboard />;
}
