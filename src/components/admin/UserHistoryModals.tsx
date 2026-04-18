import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Clock, ArrowDownLeft, ArrowUpRight, CheckCircle, XCircle } from 'lucide-react';

interface HistoryModalProps {
  userId: string;
  userName: string;
  onClose: () => void;
  type: 'trades' | 'transactions';
}

export const UserHistoryModal = ({ userId, userName, onClose, type }: HistoryModalProps) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: result, error } = await supabase
        .from(type)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && result) {
        setData(result);
      }
      setLoading(false);
    };

    fetchData();
  }, [userId, type]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-xl">
      <div className="bg-navy-light border border-white/5 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden relative">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl"></div>
        
        <div className="p-8 border-b border-white/5 flex justify-between items-center relative z-10 shrink-0">
          <div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">
              {type === 'trades' ? 'Trade' : 'Transaction'} <span className="text-accent">History</span>
            </h3>
            <p className="text-gray-500 text-sm font-medium">Viewing history for <span className="text-white font-bold">{userName}</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-500 hover:text-white">
            <X className="w-6 h-6"/>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 relative z-10">
          {loading ? (
            <div className="py-20 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">Loading history...</div>
          ) : data.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
                <Clock className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="font-bold">No {type} found for this user.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {type === 'trades' ? (
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="text-gray-500 border-b border-white/5">
                    <tr>
                      <th className="pb-4 font-bold uppercase tracking-widest text-[10px]">Asset</th>
                      <th className="pb-4 font-bold uppercase tracking-widest text-[10px]">Side</th>
                      <th className="pb-4 font-bold uppercase tracking-widest text-[10px]">Size</th>
                      <th className="pb-4 font-bold uppercase tracking-widest text-[10px]">Entry Price</th>
                      <th className="pb-4 font-bold uppercase tracking-widest text-[10px]">Status</th>
                      <th className="pb-4 font-bold uppercase tracking-widest text-[10px] text-right">PnL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {data.map((trade) => (
                      <tr key={trade.id} className="hover:bg-white/5 transition-colors group">
                        <td className="py-4 font-bold text-white">{trade.asset}</td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${trade.side === 'buy' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {trade.side}
                          </span>
                        </td>
                        <td className="py-4 font-mono text-gray-400">{trade.lot_size} Lots</td>
                        <td className="py-4 font-mono text-gray-400">${trade.entry_price.toLocaleString()}</td>
                        <td className="py-4">
                            <span className={`text-[10px] font-black uppercase ${trade.status === 'open' ? 'text-accent' : 'text-gray-500'}`}>
                                {trade.status}
                            </span>
                        </td>
                        <td className={`py-4 text-right font-mono font-bold ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="text-gray-500 border-b border-white/5">
                    <tr>
                      <th className="pb-4 font-bold uppercase tracking-widest text-[10px]">Type</th>
                      <th className="pb-4 font-bold uppercase tracking-widest text-[10px]">Amount</th>
                      <th className="pb-4 font-bold uppercase tracking-widest text-[10px]">Status</th>
                      <th className="pb-4 font-bold uppercase tracking-widest text-[10px]">Date</th>
                      <th className="pb-4 font-bold uppercase tracking-widest text-[10px] text-right">Ref ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {data.map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            {tx.type === 'deposit' ? <ArrowDownLeft className="w-3 h-3 text-green-500" /> : <ArrowUpRight className="w-3 h-3 text-orange-500" />}
                            <span className="font-bold capitalize text-white">{tx.type}</span>
                          </div>
                        </td>
                        <td className={`py-4 font-mono font-bold ${tx.type === 'deposit' ? 'text-green-500' : 'text-orange-500'}`}>
                          {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toLocaleString()}
                        </td>
                        <td className="py-4">
                            <div className="flex items-center space-x-1">
                                {tx.status === 'approved' && <CheckCircle className="w-3 h-3 text-green-500"/>}
                                {tx.status === 'pending' && <Clock className="w-3 h-3 text-accent"/>}
                                {tx.status === 'rejected' && <XCircle className="w-3 h-3 text-red-500"/>}
                                <span className="text-[10px] font-black uppercase text-gray-400">{tx.status}</span>
                            </div>
                        </td>
                        <td className="py-4 text-[10px] text-gray-500 font-medium">
                            {new Date(tx.created_at).toLocaleString()}
                        </td>
                        <td className="py-4 text-right font-mono text-[9px] text-gray-600">
                          {tx.id.split('-')[0]}...
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/5 bg-navy/20 flex justify-end shrink-0 relative z-10">
          <button onClick={onClose} className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all">
            Close View
          </button>
        </div>
      </div>
    </div>
  );
};
