import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { BookOpen, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export const AdminLedgerPage = () => {
  const [ledgerLines, setLedgerLines] = useState<any[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    setLoading(true);
    // Fetch aggregated balances from the view
    const { data: balanceData } = await supabase.from('account_balances').select('*');
    if (balanceData) setBalances(balanceData);

    // Fetch recent immutable ledger lines
    const { data: linesData } = await supabase
      .from('ledger_lines')
      .select('*, journal_entries(description, posted_at), financial_accounts(name, type, currency)')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (linesData) setLedgerLines(linesData);
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tight uppercase">General <span className="text-accent">Ledger</span></h1>
        <p className="text-gray-500 font-medium">Immutable double-entry accounting records for platform auditing.</p>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-10">Loading ledger data...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {balances.map(account => (
              <div key={account.account_id} className="bg-navy border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
                 <div className="mb-4">
                   <h3 className="text-lg font-bold text-white">{account.name}</h3>
                   <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500">{account.type}</span>
                 </div>
                 <h2 className="text-3xl font-mono font-bold text-accent">${Number(account.current_balance).toLocaleString()}</h2>
                 <div className="flex justify-between mt-4 text-[10px] uppercase font-bold text-gray-500 border-t border-white/5 pt-4">
                   <span>Debits: ${Number(account.total_debits).toLocaleString()}</span>
                   <span>Credits: ${Number(account.total_credits).toLocaleString()}</span>
                 </div>
              </div>
            ))}
          </div>

          <div className="bg-navy border border-white/5 rounded-3xl shadow-xl overflow-hidden mt-8">
            <div className="p-6 border-b border-white/5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-accent" /> Recent Postings
                </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-navy-light/50 text-gray-500">
                  <tr>
                    <th className="p-4 font-bold uppercase tracking-widest text-[10px]">Posted By</th>
                    <th className="p-4 font-bold uppercase tracking-widest text-[10px]">Account</th>
                    <th className="p-4 font-bold uppercase tracking-widest text-[10px]">Description</th>
                    <th className="p-4 font-bold uppercase tracking-widest text-[10px] text-right">Debit</th>
                    <th className="p-4 font-bold uppercase tracking-widest text-[10px] text-right">Credit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ledgerLines.map(line => (
                    <tr key={line.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-xs text-gray-500 font-mono">
                         {new Date(line.journal_entries.posted_at).toLocaleString()}
                      </td>
                      <td className="p-4">
                         <span className="font-bold text-white/80">{line.financial_accounts.name}</span>
                         <span className="ml-2 px-2 py-0.5 rounded text-[8px] uppercase tracking-widest bg-white/5 border border-white/10 text-gray-400">{line.financial_accounts.type}</span>
                      </td>
                      <td className="p-4 text-xs text-gray-400">
                         {line.journal_entries.description}
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-green-500">
                         {line.direction === 'DEBIT' && `$${Number(line.amount).toLocaleString()}`}
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-orange-500">
                         {line.direction === 'CREDIT' && `$${Number(line.amount).toLocaleString()}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
