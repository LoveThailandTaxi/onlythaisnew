import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Flag,
  MessageSquare,
  Ban,
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Shield,
  AlertTriangle,
  Calendar,
} from 'lucide-react';

interface Report {
  id: string;
  reporter_id: string | null;
  reported_user_id: string | null;
  reported_content_type: string;
  reported_content_id: string;
  reason: string;
  description: string | null;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  resolution_notes: string | null;
  created_at: string;
  reporter_email?: string;
  reported_user_name?: string;
  reported_user_email?: string;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  sender_email?: string;
  receiver_email?: string;
}

interface BannedUser {
  id: string;
  user_id: string | null;
  email: string | null;
  ip_address: string | null;
  reason: string;
  banned_by: string;
  banned_at: string;
  expires_at: string | null;
  is_active: boolean;
  banned_by_email?: string;
}

interface AuditLog {
  id: string;
  admin_id: string;
  action_type: string;
  target_user_id: string | null;
  target_type: string | null;
  target_id: string | null;
  details: any;
  reason: string | null;
  created_at: string;
  admin_email?: string;
}

type SubTab = 'reports' | 'messages' | 'bans' | 'audit';

export default function ModerationPanel() {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('reports');
  const [reports, setReports] = useState<Report[]>([]);
  const [conversations, setConversations] = useState<{ user1: string; user2: string; count: number }[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<{ user1: string; user2: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [bans, setBans] = useState<BannedUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    if (activeSubTab === 'reports') {
      fetchReports();
    } else if (activeSubTab === 'messages') {
      fetchConversations();
    } else if (activeSubTab === 'bans') {
      fetchBans();
    } else if (activeSubTab === 'audit') {
      fetchAuditLogs();
    }
  }, [activeSubTab]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data: reportsData, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const { data: authData } = await supabase.auth.admin.listUsers();
      const { data: profilesData } = await supabase.from('profiles').select('id, user_id, display_name');

      const enrichedReports = (reportsData || []).map(report => {
        const reporter = authData?.users?.find(u => u.id === report.reporter_id);
        const reportedProfile = profilesData?.find(p => p.id === report.reported_user_id);
        const reportedUser = authData?.users?.find(u => u.id === reportedProfile?.user_id);

        return {
          ...report,
          reporter_email: reporter?.email || 'Unknown',
          reported_user_name: reportedProfile?.display_name || 'Unknown',
          reported_user_email: reportedUser?.email || 'Unknown',
        };
      });

      setReports(enrichedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('sender_id, receiver_id');

      if (error) throw error;

      const conversationMap = new Map<string, number>();

      (data || []).forEach(msg => {
        const key = [msg.sender_id, msg.receiver_id].sort().join('-');
        conversationMap.set(key, (conversationMap.get(key) || 0) + 1);
      });

      const convArray = Array.from(conversationMap.entries()).map(([key, count]) => {
        const [user1, user2] = key.split('-');
        return { user1, user2, count };
      });

      setConversations(convArray.sort((a, b) => b.count - a.count));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (user1: string, user2: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user1},receiver_id.eq.${user2}),and(sender_id.eq.${user2},receiver_id.eq.${user1})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const { data: authData } = await supabase.auth.admin.listUsers();

      const enrichedMessages = (data || []).map(msg => {
        const sender = authData?.users?.find(u => u.id === msg.sender_id);
        const receiver = authData?.users?.find(u => u.id === msg.receiver_id);
        return {
          ...msg,
          sender_email: sender?.email || 'Unknown',
          receiver_email: receiver?.email || 'Unknown',
        };
      });

      setMessages(enrichedMessages);

      if (user) {
        await logAuditAction('view_messages', null, 'conversation', null, {
          user1,
          user2,
          message_count: data?.length || 0
        }, 'Admin reviewed conversation');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('banned_users')
        .select('*')
        .order('banned_at', { ascending: false });

      if (error) throw error;

      const { data: authData } = await supabase.auth.admin.listUsers();

      const enrichedBans = (data || []).map(ban => {
        const bannedBy = authData?.users?.find(u => u.id === ban.banned_by);
        return {
          ...ban,
          banned_by_email: bannedBy?.email || 'Unknown',
        };
      });

      setBans(enrichedBans);
    } catch (error) {
      console.error('Error fetching bans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const { data: authData } = await supabase.auth.admin.listUsers();

      const enrichedLogs = (data || []).map(log => {
        const admin = authData?.users?.find(u => u.id === log.admin_id);
        return {
          ...log,
          admin_email: admin?.email || 'Unknown',
        };
      });

      setAuditLogs(enrichedLogs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const logAuditAction = async (
    actionType: string,
    targetUserId: string | null,
    targetType: string | null,
    targetId: string | null,
    details: any,
    reason: string | null
  ) => {
    if (!user) return;

    try {
      await supabase.from('audit_logs').insert({
        admin_id: user.id,
        action_type: actionType,
        target_user_id: targetUserId,
        target_type: targetType,
        target_id: targetId,
        details: details,
        reason: reason,
      });
    } catch (error) {
      console.error('Error logging audit action:', error);
    }
  };

  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('reports')
        .update({
          status,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          resolution_notes: resolutionNotes || null,
        })
        .eq('id', reportId);

      if (error) throw error;

      await logAuditAction(
        status === 'resolved' ? 'resolve_report' : 'dismiss_report',
        selectedReport?.reported_user_id || null,
        'report',
        reportId,
        { resolution_notes: resolutionNotes },
        resolutionNotes || null
      );

      setSelectedReport(null);
      setResolutionNotes('');
      fetchReports();
    } catch (error) {
      console.error('Error resolving report:', error);
      alert('Failed to update report');
    }
  };

  const handleBanEmail = async () => {
    if (!user) return;

    const email = prompt('Enter email address to ban:');
    if (!email) return;

    const reason = prompt('Enter reason for ban:');
    if (!reason) return;

    try {
      const { error } = await supabase.from('banned_users').insert({
        email,
        reason,
        banned_by: user.id,
        is_active: true,
      });

      if (error) throw error;

      await logAuditAction('ban_email', null, 'user', null, { email }, reason);

      fetchBans();
      alert('Email banned successfully');
    } catch (error) {
      console.error('Error banning email:', error);
      alert('Failed to ban email');
    }
  };

  const handleBanIP = async () => {
    if (!user) return;

    const ip = prompt('Enter IP address to ban:');
    if (!ip) return;

    const reason = prompt('Enter reason for ban:');
    if (!reason) return;

    try {
      const { error } = await supabase.from('banned_users').insert({
        ip_address: ip,
        reason,
        banned_by: user.id,
        is_active: true,
      });

      if (error) throw error;

      await logAuditAction('ban_ip', null, 'user', null, { ip_address: ip }, reason);

      fetchBans();
      alert('IP banned successfully');
    } catch (error) {
      console.error('Error banning IP:', error);
      alert('Failed to ban IP');
    }
  };

  const handleUnban = async (banId: string) => {
    if (!user) return;
    if (!confirm('Unban this user/email/IP?')) return;

    try {
      const { error } = await supabase
        .from('banned_users')
        .update({ is_active: false })
        .eq('id', banId);

      if (error) throw error;

      await logAuditAction('unban_user', null, 'user', banId, {}, 'Unbanned by admin');

      fetchBans();
    } catch (error) {
      console.error('Error unbanning:', error);
      alert('Failed to unban');
    }
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      harassment: 'Harassment',
      inappropriate_content: 'Inappropriate Content',
      spam: 'Spam',
      fake_profile: 'Fake Profile',
      underage: 'Underage',
      violence: 'Violence',
      hate_speech: 'Hate Speech',
      scam: 'Scam',
      other: 'Other',
    };
    return labels[reason] || reason;
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-gray-800">
        <button
          onClick={() => setActiveSubTab('reports')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors ${
            activeSubTab === 'reports'
              ? 'text-[#FF1493] border-b-2 border-[#FF1493]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Flag className="w-5 h-5" />
          Reports
        </button>
        <button
          onClick={() => setActiveSubTab('messages')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors ${
            activeSubTab === 'messages'
              ? 'text-[#FF1493] border-b-2 border-[#FF1493]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          Messages
        </button>
        <button
          onClick={() => setActiveSubTab('bans')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors ${
            activeSubTab === 'bans'
              ? 'text-[#FF1493] border-b-2 border-[#FF1493]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Ban className="w-5 h-5" />
          Bans
        </button>
        <button
          onClick={() => setActiveSubTab('audit')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors ${
            activeSubTab === 'audit'
              ? 'text-[#FF1493] border-b-2 border-[#FF1493]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <FileText className="w-5 h-5" />
          Audit Logs
        </button>
      </div>

      {activeSubTab === 'reports' && (
        <div className="bg-gray-900 rounded-2xl border-2 border-gray-800 p-6">
          <h2 className="text-2xl font-bold text-white mb-6">User Reports</h2>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No reports found</div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className={`bg-[#0A0A0A] border-2 rounded-lg p-4 ${
                    report.status === 'pending' ? 'border-yellow-500/30' :
                    report.status === 'resolved' ? 'border-green-500/30' :
                    'border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          report.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {report.status}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400">
                          {getReasonLabel(report.reason)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(report.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-300">
                          <strong>Reporter:</strong> {report.reporter_email}
                        </p>
                        <p className="text-gray-300">
                          <strong>Reported User:</strong> {report.reported_user_name} ({report.reported_user_email})
                        </p>
                        <p className="text-gray-300">
                          <strong>Content Type:</strong> {report.reported_content_type}
                        </p>
                        {report.description && (
                          <p className="text-gray-300 mt-2">
                            <strong>Description:</strong> {report.description}
                          </p>
                        )}
                        {report.resolution_notes && (
                          <p className="text-green-300 mt-2">
                            <strong>Resolution Notes:</strong> {report.resolution_notes}
                          </p>
                        )}
                      </div>
                    </div>
                    {report.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="px-4 py-2 bg-[#FF1493] text-white rounded-lg hover:bg-[#FF1493]/80 transition-colors text-sm font-semibold"
                        >
                          Review
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'messages' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gray-900 rounded-2xl border-2 border-gray-800 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Conversations</h2>
            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No conversations</div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedConversation({ user1: conv.user1, user2: conv.user2 });
                      fetchMessages(conv.user1, conv.user2);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedConversation?.user1 === conv.user1 && selectedConversation?.user2 === conv.user2
                        ? 'bg-[#FF1493]/20 border-2 border-[#FF1493]'
                        : 'bg-[#0A0A0A] border-2 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm">Conversation {index + 1}</span>
                      <span className="text-xs text-gray-400">{conv.count} msgs</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 bg-gray-900 rounded-2xl border-2 border-gray-800 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
            {!selectedConversation ? (
              <div className="text-center py-12 text-gray-400">Select a conversation to view messages</div>
            ) : loading ? (
              <div className="text-center py-12 text-gray-400">Loading messages...</div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {messages.map((msg) => (
                  <div key={msg.id} className="bg-[#0A0A0A] border border-gray-800 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-sm">
                        <span className="text-[#FF1493] font-semibold">{msg.sender_email}</span>
                        <span className="text-gray-400 mx-2">→</span>
                        <span className="text-blue-400 font-semibold">{msg.receiver_email}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">{msg.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'bans' && (
        <div className="bg-gray-900 rounded-2xl border-2 border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Banned Users</h2>
            <div className="flex gap-2">
              <button
                onClick={handleBanEmail}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Ban Email
              </button>
              <button
                onClick={handleBanIP}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Ban IP
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading bans...</div>
          ) : bans.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No bans found</div>
          ) : (
            <div className="space-y-3">
              {bans.map((ban) => (
                <div
                  key={ban.id}
                  className={`bg-[#0A0A0A] border-2 rounded-lg p-4 ${
                    ban.is_active ? 'border-red-500/30' : 'border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          ban.is_active ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {ban.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {ban.expires_at && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Expires: {new Date(ban.expires_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-sm">
                        {ban.email && (
                          <p className="text-gray-300"><strong>Email:</strong> {ban.email}</p>
                        )}
                        {ban.ip_address && (
                          <p className="text-gray-300"><strong>IP:</strong> {ban.ip_address}</p>
                        )}
                        <p className="text-gray-300"><strong>Reason:</strong> {ban.reason}</p>
                        <p className="text-gray-400 text-xs">
                          Banned by {ban.banned_by_email} on {new Date(ban.banned_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {ban.is_active && (
                      <button
                        onClick={() => handleUnban(ban.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                      >
                        Unban
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'audit' && (
        <div className="bg-gray-900 rounded-2xl border-2 border-gray-800 p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Audit Logs</h2>
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading logs...</div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No audit logs found</div>
          ) : (
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="bg-[#0A0A0A] border border-gray-800 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">
                          {log.action_type}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">
                        <strong>Admin:</strong> {log.admin_email}
                      </p>
                      {log.reason && (
                        <p className="text-sm text-gray-400 mt-1">{log.reason}</p>
                      )}
                      {log.details && Object.keys(log.details).length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {JSON.stringify(log.details)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedReport && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-2xl w-full p-6 border-2 border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">Review Report</h3>

            <div className="space-y-3 mb-6 text-sm">
              <p className="text-gray-300">
                <strong>Reason:</strong> {getReasonLabel(selectedReport.reason)}
              </p>
              <p className="text-gray-300">
                <strong>Reported User:</strong> {selectedReport.reported_user_name} ({selectedReport.reported_user_email})
              </p>
              {selectedReport.description && (
                <p className="text-gray-300">
                  <strong>Description:</strong> {selectedReport.description}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Resolution Notes
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={4}
                placeholder="Enter your resolution notes..."
                className="w-full px-4 py-2 bg-[#0A0A0A] border-2 border-gray-800 rounded-lg text-white focus:border-[#FF1493] focus:outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedReport(null)}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResolveReport(selectedReport.id, 'dismissed')}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Dismiss
              </button>
              <button
                onClick={() => handleResolveReport(selectedReport.id, 'resolved')}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
