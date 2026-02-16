import { useNavigate } from 'react-router-dom';
import { Heart, Users, Zap, Image, Shield, Star, Clock, CheckCircle } from 'lucide-react';

export default function CreatorSignUp() {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: CheckCircle,
      title: 'Free to Join, Always',
      description: 'Create your profile and start connecting with quality members at no cost.',
      color: 'text-green-400',
    },
    {
      icon: Users,
      title: 'Verified Male Members Only',
      description: 'Every man on the platform is a verified paying subscriber ($19–$29/month). Serious connections only.',
      color: 'text-blue-400',
    },
    {
      icon: Zap,
      title: 'Instant Spotlight',
      description: 'New profiles are featured at the top of feeds and VIP members are alerted the moment you join.',
      color: 'text-yellow-400',
    },
    {
      icon: Image,
      title: 'Full Profile Control',
      description: 'Unlimited photos, bio, and gallery. Showcase yourself your way and attract the right connections.',
      color: 'text-pink-400',
    },
    {
      icon: Shield,
      title: 'Safe & Private',
      description: 'No personal contact details shared. You control who messages you. Block and report freely.',
      color: 'text-red-400',
    },
    {
      icon: Heart,
      title: 'Quality Connections',
      description: 'Meet genuine men looking for authentic connections with Thai women and ladyboys.',
      color: 'text-[#FF1493]',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1
              onClick={() => navigate('/')}
              className="text-2xl font-bold text-[#FF1493] cursor-pointer hover:opacity-80 transition-opacity"
            >
              Only Thais
            </h1>
            <button
              onClick={() => navigate('/auth')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Already have an account?
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Connect with Quality Men Today
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join the platform built for Thai women and ladyboys. Meet verified, serious men looking for genuine connections.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/auth?type=creator')}
              className="px-10 py-4 bg-[#FF1493] text-white text-lg font-bold rounded-xl hover:bg-[#FF1493]/80 transition-all transform hover:scale-105 shadow-lg shadow-[#FF1493]/20"
            >
              Create Your Free Profile
            </button>
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="w-5 h-5" />
              <span>Takes less than 60 seconds</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500/10 to-transparent rounded-2xl border-2 border-green-500 p-8 mb-16 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <h2 className="text-3xl font-bold text-white">100% Free Forever</h2>
          </div>
          <p className="text-xl text-gray-300 mb-2">
            No credit card required. No hidden fees. No subscriptions.
          </p>
          <p className="text-lg text-green-400 font-semibold">
            Create your profile and start connecting for free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-gray-900 rounded-2xl border-2 border-gray-800 p-8 hover:border-[#FF1493] transition-all group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 bg-gray-800 rounded-xl group-hover:scale-110 transition-transform ${benefit.color}`}>
                  <benefit.icon className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {benefit.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 rounded-2xl border-2 border-gray-800 p-12 mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FF1493] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Sign Up Free</h3>
              <p className="text-gray-400">
                Create your account in under a minute. No credit card needed.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FF1493] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Build Your Profile</h3>
              <p className="text-gray-400">
                Add photos, write your bio, share your interests. Show who you are.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FF1493] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Start Connecting</h3>
              <p className="text-gray-400">
                Meet verified members, chat, and build meaningful connections.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#FF1493]/10 to-transparent rounded-2xl border-2 border-[#FF1493] p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Meet Quality Men?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join Thai women and ladyboys connecting with verified, serious men. Safe, private, and completely free.
          </p>
          <button
            onClick={() => navigate('/auth?type=creator')}
            className="px-12 py-5 bg-[#FF1493] text-white text-xl font-bold rounded-xl hover:bg-[#FF1493]/80 transition-all transform hover:scale-105 shadow-lg shadow-[#FF1493]/20"
          >
            Start Connecting Now
          </button>
          <p className="text-gray-400 mt-6">
            No credit card • No fees • No commitment
          </p>
        </div>
      </main>

      <footer className="border-t border-gray-800 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          <p>© 2026 Only Thais. Connecting Thai women and ladyboys with quality men.</p>
        </div>
      </footer>
    </div>
  );
}
