import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Wallet, Activity, AlertCircle, TrendingUp, ArrowUpRight, Globe, Database, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Sparklines, SparklinesLine } from 'react-sparklines';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeTraders: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    openTrades: 0,
    totalVolume: 1250000,
    revenue: 45200,
    userGrowth: 12.5,
    volumeGrowth: 8.2
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
      
      const { count: depositCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .eq('type', 'deposit');

      const { count: withdrawalCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .eq('type', 'withdrawal');

      const { count: tradesCount } = await supabase
        .from('trades')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      setStats(prev => ({
        ...prev,
        totalUsers: userCount || 0,
        pendingDeposits: depositCount || 0,
        pendingWithdrawals: withdrawalCount || 0,
        openTrades: tradesCount || 0,
      }));

      // Fetch recent activity
      const { data: activities } = await supabase
        .from('audit_logs')
        .select('*, admin:admin_id(full_name)')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (activities) setRecentActivity(activities);
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, change: '+12%', icon: Users, color: 'text-blue-500', path: '/admin/users' },
    { label: 'Active Traders', value: Math.floor(stats.totalUsers * 0.4), change: '+5%', icon: TrendingUp, color: 'text-green-500', path: '/admin/trades' },
    { label: 'Pending Deposits', value: stats.pendingDeposits, change: stats.pendingDeposits > 5 ? 'High' : 'Normal', icon: Wallet, color: 'text-accent', path: '/admin/deposits' },
    { label: 'Withdrawal Req.', value: stats.pendingWithdrawals, change: 'Urgent', icon: AlertCircle, color: 'text-red-500', path: '/admin/withdrawals' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase">Dashboard <span className="text-accent">Overview</span></h1>
          <p className="text-gray-500 font-medium">Real-time platform performance and management metrics.</p>
        </div>
        <div className="flex space-x-3">
            <div className="bg-navy-light/40 border border-white/5 px-4 py-2 rounded-xl flex items-center space-x-2">
                <Globe className="w-4 h-4 text-green-500" />
                <span className="text-xs font-bold text-white uppercase tracking-widest">Server: Online</span>
            </div>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className="bg-navy-light/40 border border-white/5 rounded-3xl p-6 hover:bg-white/5 transition-all group relative overflow-hidden">
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[50px] opacity-10 group-hover:opacity-20 transition-opacity bg-current ${card.color}`}></div>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-white/5 ${card.color} group-hover:scale-110 transition-transform`}>
                <card.icon className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${card.change.includes('+') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {card.change}
              </span>
            </div>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">{card.label}</p>
            <h2 className="text-3xl font-mono font-bold text-white mb-4">{card.value}</h2>
            <Link to={card.path} className="text-xs font-bold text-gray-400 group-hover:text-white flex items-center">
              View Analytics <ArrowUpRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Market Performance Visualizer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-navy-light/40 border border-white/5 rounded-3xl p-8 shadow-xl">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Platform <span className="text-accent">Volume</span></h3>
                <div className="flex space-x-2">
                    <button className="px-3 py-1.5 rounded-lg bg-accent text-white text-[10px] font-bold uppercase">24H</button>
                    <button className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-500 text-[10px] font-bold uppercase hover:text-white transition-colors">7D</button>
                </div>
             </div>
             
             <div className="h-64 relative">
                <Sparklines data={[12, 18, 15, 25, 22, 30, 28, 35, 32, 45]} height={100}>
                    <SparklinesLine color="#B06BFF" style={{ fill: "rgba(176,107,255,0.05)", strokeWidth: 2 }} />
                </Sparklines>
                <div className="absolute inset-0 grid grid-cols-5 pointer-events-none opacity-5">
                    {[...Array(5)].map((_, i) => <div key={i} className="border-r border-white"></div>)}
                </div>
             </div>

             <div className="grid grid-cols-3 gap-8 mt-8 pt-8 border-t border-white/5">
                <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Total Revenue</p>
                    <p className="text-2xl font-mono font-bold text-green-500">${stats.revenue.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Active Positions</p>
                    <p className="text-2xl font-mono font-bold text-white">{stats.openTrades}</p>
                </div>
                <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Avg. Volume</p>
                    <p className="text-2xl font-mono font-bold text-accent">${(stats.totalVolume/1000).toFixed(1)}k</p>
                </div>
             </div>
          </div>
        </div>

        {/* Audit Feed */}
        <div className="lg:col-span-1">
          <div className="bg-navy-light/40 border border-white/5 rounded-3xl p-8 shadow-xl h-full flex flex-col">
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8">System <span className="text-accent">Logs</span></h3>
            
            <div className="flex-1 space-y-6">
              {recentActivity.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="font-bold">No recent activities.</p>
                </div>
              ) : (
                recentActivity.map((log, i) => (
                  <div key={i} className="flex space-x-4 items-start group">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-accent/10 transition-colors">
                      <Activity className="w-4 h-4 text-gray-500 group-hover:text-accent" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white mb-0.5">{log.action}</p>
                      <p className="text-[10px] text-gray-500 font-medium">{log.admin?.full_name || 'System'}</p>
                      <p className="text-[9px] text-gray-600 mt-1 uppercase font-bold">{new Date(log.created_at).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link to="/admin/logs" className="mt-8 pt-6 border-t border-white/5 text-center text-xs font-bold text-accent hover:text-accent-hover transition-colors">
                View Full Audit Trail
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-navy-light/40 border border-white/5 rounded-3xl p-8">
        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8">Quick <span className="text-accent">Actions</span></h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Link to="/admin/assets" className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-accent/30 hover:bg-accent/5 transition-all text-center group">
            <Database className="w-6 h-6 mx-auto mb-3 text-gray-500 group-hover:text-accent" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">New Asset</span>
          </Link>
          <button className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-red-500/30 hover:bg-red-500/5 transition-all text-center group">
            <AlertCircle className="w-6 h-6 mx-auto mb-3 text-gray-500 group-hover:text-red-500" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Flag User</span>
          </button>
          <Link to="/admin/settings" className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-center group">
            <Settings className="w-6 h-6 mx-auto mb-3 text-gray-500 group-hover:text-blue-500" />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Maintenance</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
