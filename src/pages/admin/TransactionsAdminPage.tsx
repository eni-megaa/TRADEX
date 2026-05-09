import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle, XCircle } from 'lucide-react';
import { notifyDepositApproved, notifyDepositRejected, notifyWithdrawalApproved, notifyWithdrawalRejected } from '../../lib/userNotifications';

export const TransactionsAdminPage = ({ type }: { type?: 'deposit' | 'withdrawal' }) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    let query = supabase
      .from('transactions')
      .select('*, users(email, full_name)')
      .eq('status', 'pending');
    
    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
      
    if (!error && data) {
      setTransactions(data);
    }
    setLoading(false);
  };

  const handleAction = async (txId: string, action: 'approved' | 'rejected', userId: string, amount: number, type: string) => {
    try {
      // 1. Update status
      await supabase
        .from('transactions')
        .update({ status: action })
        .eq('id', txId);

      // 2. If approved, update wallet balance
      if (action === 'approved') {
        const { data: walletData } = await supabase.from('wallets').select('balance').eq('user_id', userId).single();
        if (walletData) {
          const change = type === 'deposit' ? amount : -amount;
          await supabase
            .from('wallets')
            .update({ balance: Number(walletData.balance) + change })
            .eq('user_id', userId);
        }
      }



      // 3. Send notification to user
      if (type === 'deposit') {
        if (action === 'approved') notifyDepositApproved(userId, amount);
        else notifyDepositRejected(userId, amount);
      } else if (type === 'withdrawal') {
        if (action === 'approved') notifyWithdrawalApproved(userId, amount);
        else notifyWithdrawalRejected(userId, amount);
      }

      fetchTransactions();
    } catch (error) {
      console.error('Error processing transaction:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase">
            Pending <span className={type === 'withdrawal' ? 'text-red-500' : 'text-accent'}>{type ? `${type}s` : 'Transactions'}</span>
          </h1>
          <p className="text-gray-500 font-medium">Review and authorize financial requests from users.</p>
        </div>
      </div>

      <div className="bg-navy-light/40 border border-white/5 rounded-3xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading requests...</div>
        ) : transactions.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500/20" />
            <p className="text-lg">All caught up! No pending requests.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-navy/50 border-b border-white/5 text-gray-500">
                <tr>
                  <th className="p-6 font-bold uppercase tracking-widest text-[10px]">User</th>
                  {!type && <th className="p-6 font-bold uppercase tracking-widest text-[10px]">Type</th>}
                  <th className="p-6 font-bold uppercase tracking-widest text-[10px]">Amount</th>
                  <th className="p-6 font-bold uppercase tracking-widest text-[10px]">Date</th>
                  <th className="p-6 font-bold uppercase tracking-widest text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-6">
                      <div className="font-bold text-white group-hover:text-accent transition-colors">{tx.users?.full_name}</div>
                      <div className="text-xs text-gray-500 font-mono">{tx.users?.email}</div>
                    </td>
                    {!type && (
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${tx.type === 'deposit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {tx.type}
                        </span>
                      </td>
                    )}
                    <td className="p-6 font-mono font-bold text-white text-lg">
                      ${tx.amount.toLocaleString()}
                    </td>
                    <td className="p-6 text-gray-500 text-xs font-medium">
                      {new Date(tx.created_at).toLocaleDateString()}
                      <div className="opacity-50">{new Date(tx.created_at).toLocaleTimeString()}</div>
                    </td>
                    <td className="p-6 text-right space-x-3">
                       <button 
                        onClick={() => handleAction(tx.id, 'approved', tx.user_id, tx.amount, tx.type)}
                        className="w-10 h-10 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all inline-flex items-center justify-center shadow-lg hover:shadow-green-500/20"
                        title="Approve Request"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button 
                         onClick={() => handleAction(tx.id, 'rejected', tx.user_id, tx.amount, tx.type)}
                        className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all inline-flex items-center justify-center shadow-lg hover:shadow-red-500/20"
                        title="Reject Request"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
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
