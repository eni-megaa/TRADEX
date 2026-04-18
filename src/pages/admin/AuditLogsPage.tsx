import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Shield } from 'lucide-react';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, [filterAction]);

  const fetchLogs = async () => {
    setLoading(true);
    let query = supabase
      .from('audit_logs')
      .select('*, users(email, full_name)')
      .order('created_at', { ascending: false });
    
    if (filterAction !== 'all') {
      query = query.ilike('action', `%${filterAction}%`);
    }

    const { data, error } = await query;
      
    if (!error && data) {
      setLogs(data);
    }
    setLoading(false);
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(search.toLowerCase()) || 
    log.users?.email?.toLowerCase().includes(search.toLowerCase()) ||
    JSON.stringify(log.details).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
            <h1 className="text-4xl font-black text-white tracking-tight uppercase">Audit <span className="text-accent">Logs</span></h1>
            <p className="text-gray-500 font-medium">Immutable record of all administrative actions and system changes.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="text"
                placeholder="Search logs..."
                className="pl-10 pr-4 py-3 bg-navy-light/40 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-accent w-full md:w-64 transition-all font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select 
                className="bg-navy-light/40 border border-white/5 px-4 py-3 rounded-2xl text-white focus:outline-none focus:border-accent appearance-none min-w-[150px]"
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
            >
                <option value="all">All Events</option>
                <option value="Balance">Balance Updates</option>
                <option value="Trade">Trade Actions</option>
                <option value="KYC">KYC Reviews</option>
                <option value="Transaction">Transaction Approval</option>
            </select>
        </div>
      </div>

      <div className="bg-navy-light/40 border border-white/5 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
             <div className="p-20 text-center text-gray-500">Retrieving system ledger...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-navy/50 border-b border-white/5 text-gray-500">
                <tr>
                  <th className="p-6 font-bold uppercase tracking-widest text-[10px]">Timestamp</th>
                  <th className="p-6 font-bold uppercase tracking-widest text-[10px]">Administrator</th>
                  <th className="p-6 font-bold uppercase tracking-widest text-[10px]">Action</th>
                  <th className="p-6 font-bold uppercase tracking-widest text-[10px]">Impact & Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-6">
                        <div className="text-white font-bold">{new Date(log.created_at).toLocaleDateString()}</div>
                        <div className="text-[10px] text-gray-500">{new Date(log.created_at).toLocaleTimeString()}</div>
                    </td>
                    <td className="p-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center text-gray-500 border border-white/5">
                                <Shield className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-white font-bold">{log.users?.full_name || 'System'}</div>
                                <div className="text-[10px] text-gray-500">{log.users?.email}</div>
                            </div>
                        </div>
                    </td>
                    <td className="p-6">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                            log.action.includes('Approval') || log.action.includes('verified') ? 'bg-green-500/10 text-green-500' : 
                            log.action.includes('Rejection') || log.action.includes('Force') ? 'bg-red-500/10 text-red-500' : 'bg-accent/10 text-accent'
                        }`}>
                            {log.action}
                        </span>
                    </td>
                    <td className="p-6 max-w-md overflow-hidden text-ellipsis">
                         <div className="text-gray-400 text-[11px] leading-relaxed">
                            {Object.entries(log.details || {}).map(([key, val]) => (
                                <div key={key}>
                                    <span className="text-accent/50 uppercase text-[9px] font-bold mr-2">{key}:</span>
                                    {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                </div>
                            ))}
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
  );
};
