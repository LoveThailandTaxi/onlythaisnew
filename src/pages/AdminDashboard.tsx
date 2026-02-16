import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Users,
  MessageSquare,
  Heart,
  CreditCard,
  Shield,
  Search,
  Ban,
  CheckCircle,
  Trash2,
  AlertTriangle,
  LogOut,
  TrendingUp,
  UserCheck,
  UserX,
  Download,
  Flag
} from 'lucide-react';
import ModerationPanel from './ModerationPanel';

interface Analytics {
  totalUsers: number;
  totalConsumers: number;
  totalCreators: number;
  totalAdmins: number;
  totalMessages: number;
  totalSubscriptions: number;
  totalFavorites: number;
  suspendedUsers: number;
  activeUsers: number;
}

interface User {
  id: string;
  user_id: string;
  email: string;
  display_name: string;
  role: string;
  suspended: boolean;
  suspended_at: string | null;
  suspended_reason: string | null;
  created_at: string;
  avatar_url: string | null;
}

type Tab = 'analytics' | 'users' | 'moderation';

export default function AdminDashboard() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('analytics');
  const [analytics, setAnalytics] = useState<Analytics>({
    totalUsers: 0,
    totalConsumers: 0,
    totalCreators: 0,
    totalAdmins: 0,
    totalMessages: 0,
    totalSubscriptions: 0,
    totalFavorites: 0,
    suspendedUsers: 0,
    activeUsers: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user || !profile) {
      navigate('/auth');
      return;
    }

    if (profile.role !== 'admin') {
      navigate('/');
      return;
    }

    if (activeTab === 'analytics') {
      fetchAnalytics();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [user, profile, activeTab, authLoading, navigate]);

  const fetchAnalytics = async () => {
    try {
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: totalConsumers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'consumer');

      const { count: totalCreators } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'creator');

      const { count: totalAdmins } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

      const { count: totalMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });

      const { count: totalSubscriptions } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true });

      const { count: totalFavorites } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true });

      const { count: suspendedUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('suspended', true);

      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('suspended', false);

      setAnalytics({
        totalUsers: totalUsers || 0,
        totalConsumers: totalConsumers || 0,
        totalCreators: totalCreators || 0,
        totalAdmins: totalAdmins || 0,
        totalMessages: totalMessages || 0,
        totalSubscriptions: totalSubscriptions || 0,
        totalFavorites: totalFavorites || 0,
        suspendedUsers: suspendedUsers || 0,
        activeUsers: activeUsers || 0,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const userIds = profilesData?.map(p => p.user_id) || [];

      const { data: authData } = await supabase.auth.admin.listUsers();

      const usersWithAuth = (profilesData || []).map(profile => {
        const authUser = authData?.users?.find(u => u.id === profile.user_id);
        return {
          id: profile.id,
          user_id: profile.user_id,
          email: authUser?.email || 'Unknown',
          display_name: profile.display_name || 'No Name',
          role: profile.role || 'consumer',
          suspended: profile.suspended || false,
          suspended_at: profile.suspended_at || null,
          suspended_reason: profile.suspended_reason || null,
          created_at: profile.created_at,
          avatar_url: profile.avatar_url || null,
        };
      });

      setUsers(usersWithAuth);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (userId: string, suspend: boolean) => {
    if (!confirm(`${suspend ? 'Suspend' : 'Unsuspend'} this user?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          suspended: suspend,
          suspended_at: suspend ? new Date().toISOString() : null,
          suspended_reason: suspend ? 'Suspended by admin' : null,
        })
        .eq('user_id', userId);

      if (error) throw error;

      fetchUsers();
      fetchAnalytics();
    } catch (error: any) {
      console.error('Error updating user:', error);
      alert(`Failed to update user: ${error.message}`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Delete this user permanently?')) {
      return;
    }

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (profileError) throw profileError;

      const { error: authError } = await supabase.auth.admin.deleteUser(userId);

      if (authError) {
        console.error('Auth deletion error (may already be deleted):', authError);
      }

      fetchUsers();
      fetchAnalytics();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert(`Failed to delete user: ${error.message}`);
    }
  };

  const handleDeleteAllNonAdminUsers = async () => {
    if (!confirm('Delete all non-admin users and creators permanently?')) {
      return;
    }

    try {
      setLoading(true);

      const { data: nonAdminProfiles, error: fetchError } = await supabase
        .from('profiles')
        .select('user_id')
        .neq('role', 'admin');

      if (fetchError) throw fetchError;

      if (!nonAdminProfiles || nonAdminProfiles.length === 0) {
        alert('No non-admin users to delete.');
        setLoading(false);
        return;
      }

      const userIds = nonAdminProfiles.map(p => p.user_id);

      const { error: deleteProfilesError } = await supabase
        .from('profiles')
        .delete()
        .neq('role', 'admin');

      if (deleteProfilesError) throw deleteProfilesError;

      for (const userId of userIds) {
        try {
          await supabase.auth.admin.deleteUser(userId);
        } catch (authError) {
          console.error(`Failed to delete auth user ${userId}:`, authError);
        }
      }

      fetchAnalytics();
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting all users:', error);
      alert(`Failed to delete all users: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && !u.suspended) ||
      (filterStatus === 'suspended' && u.suspended);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const exportToCSV = (data: User[], filename: string) => {
    const headers = ['Name', 'Email', 'Role', 'Status', 'Joined', 'Suspended At', 'Suspended Reason'];
    const rows = data.map(u => [
      u.display_name,
      u.email,
      u.role,
      u.suspended ? 'Suspended' : 'Active',
      new Date(u.created_at).toLocaleDateString(),
      u.suspended_at ? new Date(u.suspended_at).toLocaleDateString() : '',
      u.suspended_reason || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAll = () => {
    exportToCSV(users, 'all_users');
  };

  const handleExportFiltered = () => {
    exportToCSV(filteredUsers, 'filtered_users');
  };

  const handleExportCreators = () => {
    const creators = users.filter(u => u.role === 'creator');
    exportToCSV(creators, 'creators');
  };

  const handleExportConsumers = () => {
    const consumers = users.filter(u => u.role === 'consumer');
    exportToCSV(consumers, 'consumers');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-[#FF1493] text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || !profile || profile.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-[#FF1493]" />
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            </div>
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
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${
              activeTab === 'analytics'
                ? 'text-[#FF1493] border-b-2 border-[#FF1493]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${
              activeTab === 'users'
                ? 'text-[#FF1493] border-b-2 border-[#FF1493]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5" />
            User Management
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors ${
              activeTab === 'moderation'
                ? 'text-[#FF1493] border-b-2 border-[#FF1493]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Flag className="w-5 h-5" />
            Moderation
          </button>
        </div>

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="bg-red-500/10 border-2 border-red-500/30 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-red-400 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6" />
                    Danger Zone
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Delete all users and creators except admins. This action is permanent and cannot be undone.
                  </p>
                </div>
                <button
                  onClick={handleDeleteAllNonAdminUsers}
                  disabled={loading}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete All Non-Admin Users
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Platform Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-900 rounded-2xl border-2 border-gray-800 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Users</p>
                      <p className="text-3xl font-bold text-white">{analytics.totalUsers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-2xl border-2 border-gray-800 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                      <UserCheck className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Active Users</p>
                      <p className="text-3xl font-bold text-white">{analytics.activeUsers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-2xl border-2 border-gray-800 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                      <UserX className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Suspended</p>
                      <p className="text-3xl font-bold text-white">{analytics.suspendedUsers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-2xl border-2 border-gray-800 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-[#FF1493]/20 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-[#FF1493]" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Messages</p>
                      <p className="text-3xl font-bold text-white">{analytics.totalMessages}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-6">User Demographics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-900 rounded-2xl border-2 border-gray-800 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Consumers</p>
                      <p className="text-3xl font-bold text-white">{analytics.totalConsumers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-2xl border-2 border-gray-800 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-[#FF1493]/20 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-[#FF1493]" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Creators</p>
                      <p className="text-3xl font-bold text-white">{analytics.totalCreators}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-2xl border-2 border-gray-800 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Admins</p>
                      <p className="text-3xl font-bold text-white">{analytics.totalAdmins}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Engagement Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900 rounded-2xl border-2 border-gray-800 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-[#FF1493]/20 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-[#FF1493]" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Favorites</p>
                      <p className="text-3xl font-bold text-white">{analytics.totalFavorites}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-2xl border-2 border-gray-800 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Subscriptions</p>
                      <p className="text-3xl font-bold text-white">{analytics.totalSubscriptions}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-2xl border-2 border-gray-800 p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-[#FF1493]" />
                Export User Data
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  onClick={handleExportAll}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#FF1493] text-white rounded-lg hover:bg-[#FF1493]/80 transition-colors font-semibold"
                >
                  <Download className="w-4 h-4" />
                  Export All Users
                </button>
                <button
                  onClick={handleExportFiltered}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                >
                  <Download className="w-4 h-4" />
                  Export Filtered
                </button>
                <button
                  onClick={handleExportCreators}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold"
                >
                  <Download className="w-4 h-4" />
                  Export Creators
                </button>
                <button
                  onClick={handleExportConsumers}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                >
                  <Download className="w-4 h-4" />
                  Export Consumers
                </button>
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl border-2 border-gray-800 p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#0A0A0A] border-2 border-gray-800 rounded-lg text-white focus:border-[#FF1493] focus:outline-none transition-colors"
                  />
                </div>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-4 py-3 bg-[#0A0A0A] border-2 border-gray-800 rounded-lg text-white focus:border-[#FF1493] focus:outline-none transition-colors"
                >
                  <option value="all">All Roles</option>
                  <option value="consumer">Consumer</option>
                  <option value="creator">Creator</option>
                  <option value="admin">Admin</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 bg-[#0A0A0A] border-2 border-gray-800 rounded-lg text-white focus:border-[#FF1493] focus:outline-none transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {loading ? (
                <div className="text-center py-12 text-gray-400">Loading users...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-gray-400">No users found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left py-3 px-4 text-gray-400 font-semibold">User</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-semibold">Email</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-semibold">Role</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-semibold">Joined</th>
                        <th className="text-right py-3 px-4 text-gray-400 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
                                {u.avatar_url ? (
                                  <img src={u.avatar_url} alt={u.display_name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <Users className="w-6 h-6" />
                                  </div>
                                )}
                              </div>
                              <span className="text-white font-medium">{u.display_name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-300">{u.email}</td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              u.role === 'admin' ? 'bg-yellow-500/20 text-yellow-400' :
                              u.role === 'creator' ? 'bg-[#FF1493]/20 text-[#FF1493]' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            {u.suspended ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400">
                                <Ban className="w-3 h-3" />
                                Suspended
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">
                                <CheckCircle className="w-3 h-3" />
                                Active
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-gray-300">
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end gap-2">
                              {u.role !== 'admin' && (
                                <>
                                  <button
                                    onClick={() => handleSuspendUser(u.user_id, !u.suspended)}
                                    className={`p-2 rounded-lg transition-colors ${
                                      u.suspended
                                        ? 'text-green-400 hover:bg-green-500/20'
                                        : 'text-yellow-400 hover:bg-yellow-500/20'
                                    }`}
                                    title={u.suspended ? 'Unsuspend user' : 'Suspend user'}
                                  >
                                    {u.suspended ? <CheckCircle className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(u.user_id)}
                                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                    title="Delete user"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'moderation' && <ModerationPanel />}
      </div>
    </div>
  );
}
