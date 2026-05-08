import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Clock, ArrowDownLeft, ArrowUpRight, CheckCircle, XCircle } from 'lucide-react';

export const TransactionsPage = () => {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setTransactions(data || []);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  if (loading) return <div className="text-gray-400">Loading transactions...</div>;

  return (
    <div className="p-6 md:p-8 space-y-8 h-full flex flex-col">
      <div className="shrink-0">
        <h1 className="text-3xl font-black tracking-wide text-white mb-2">Transaction History</h1>
        <p className="text-gray-400">Review your past deposits and withdrawals.</p>
      </div>

      <div className="bg-navy-light/40 border border-white/5 rounded-3xl p-6 shadow-xl flex-1 flex flex-col min-h-0 overflow-hidden">
        {transactions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 py-20">
            <Clock className="w-20 h-20 mx-auto mb-6 opacity-20" />
            <p className="text-xl font-medium">No transactions found.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto hide-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-navy/80 backdrop-blur-md z-10">
                <tr className="text-gray-500 text-[10px] uppercase font-bold tracking-widest border-b border-white/5">
                  <th className="p-4 rounded-tl-xl">Date & Time</th>
                  <th className="p-4">Transaction Type</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right rounded-tr-xl">Reference ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4 text-sm text-gray-400 font-medium">
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 shadow-lg ${tx.type === 'deposit' ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-500' : 'bg-gradient-to-br from-orange-500/20 to-red-500/20 text-orange-500'}`}>
                          {tx.type === 'deposit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <span className="font-bold capitalize text-white group-hover:text-accent transition-colors">{tx.type}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`font-mono text-lg font-bold ${tx.type === 'deposit' ? 'text-green-500' : 'text-orange-500'}`}>
                        {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="inline-flex items-center space-x-1.5 bg-navy/50 px-3 py-1.5 rounded-lg border border-white/5">
                        {tx.status === 'approved' && <><CheckCircle className="w-3.5 h-3.5 text-green-500"/><span className="text-[10px] text-green-500 uppercase font-bold tracking-wider">Approved</span></>}
                        {tx.status === 'pending' && <><Clock className="w-3.5 h-3.5 text-accent"/><span className="text-[10px] text-accent uppercase font-bold tracking-wider">Pending</span></>}
                        {tx.status === 'rejected' && <><XCircle className="w-3.5 h-3.5 text-red-500"/><span className="text-[10px] text-red-500 uppercase font-bold tracking-wider">Rejected</span></>}
                      </div>
                    </td>
                    <td className="p-4 text-right text-xs text-gray-600 font-mono font-bold tracking-wider">
                      {tx.id.split('-')[0]}...
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
