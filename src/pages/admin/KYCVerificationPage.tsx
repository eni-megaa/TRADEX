import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle, XCircle, FileText, User as UserIcon, Eye, Download, Clock, ShieldCheck, ShieldAlert } from 'lucide-react';

export const KYCVerificationPage = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [docUrl, setDocUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    if (selectedDoc) {
      if (selectedDoc.document_url?.startsWith('http')) {
        setDocUrl(selectedDoc.document_url);
      } else {
        supabase.storage.from('kyc_documents').createSignedUrl(selectedDoc.document_url, 3600).then(({ data }) => {
          if (data?.signedUrl) setDocUrl(data.signedUrl);
        });
      }
    } else {
      setDocUrl(null);
    }
  }, [selectedDoc]);

  const fetchSubmissions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('kyc_documents')
      .select('*, users(email, full_name, kyc_status)')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setSubmissions(data);
    }
    setLoading(false);
  };

  const handleAction = async (docId: string, userId: string, status: 'verified' | 'rejected', notes: string = '') => {
    try {
      // 1. Update document status
      await supabase
        .from('kyc_documents')
        .update({ 
          status, 
          reviewed_at: new Date().toISOString(),
          reviewer_notes: notes
        })
        .eq('id', docId);

      // 2. Update user KYC status and level
      const userStatus = status === 'verified' ? 'approved' : 'rejected';
      const userLevel = status === 'verified' ? 2 : 0;
      
      await supabase
        .from('users')
        .update({ 
          kyc_status: userStatus,
          kyc_level: userLevel 
        })
        .eq('id', userId);

      // 3. Log the action
      await supabase.from('audit_logs').insert([{
        action: `KYC ${status === 'verified' ? 'Approval' : 'Rejection'}`,
        user_id: userId,
        details: { doc_id: docId, notes }
      }]);

      fetchSubmissions();
      setSelectedDoc(null);
    } catch (error) {
      console.error('Error reviewing KYC:', error);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase">KYC <span className="text-accent">Verification</span></h1>
          <p className="text-gray-500 font-medium">Review and validate user identity documents for platform compliance.</p>
        </div>
        <div className="bg-navy-light/40 border border-white/5 px-4 py-2 rounded-xl flex items-center space-x-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold text-white uppercase tracking-widest">
                Pending: {submissions.filter(s => s.status === 'pending').length}
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Submissions List */}
        <div className="lg:col-span-2">
          <div className="bg-navy-light/40 border border-white/5 rounded-3xl overflow-hidden shadow-xl">
             <div className="p-6 border-b border-white/5 bg-navy/50">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Identity Applications</h3>
             </div>
             
             {loading ? (
                 <div className="p-20 text-center text-gray-500">Loading applications...</div>
             ) : submissions.length === 0 ? (
                 <div className="p-20 text-center text-gray-500">
                    <ShieldCheck className="w-16 h-16 mx-auto mb-4 opacity-10" />
                    <p className="font-bold">No KYC submissions found.</p>
                 </div>
             ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-navy/30 text-gray-500">
                            <tr>
                                <th className="p-6 font-bold uppercase tracking-widest text-[10px]">User</th>
                                <th className="p-6 font-bold uppercase tracking-widest text-[10px]">Document Type</th>
                                <th className="p-6 font-bold uppercase tracking-widest text-[10px]">Submitted</th>
                                <th className="p-6 font-bold uppercase tracking-widest text-[10px]">Status</th>
                                <th className="p-6 font-bold uppercase tracking-widest text-[10px] text-right">View</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {submissions.map((doc) => (
                                <tr key={doc.id} className={`hover:bg-white/5 transition-colors group ${selectedDoc?.id === doc.id ? 'bg-white/5' : ''}`}>
                                    <td className="p-6">
                                        <div className="font-bold text-white group-hover:text-accent transition-colors">{doc.users?.full_name}</div>
                                        <div className="text-xs text-gray-500 font-mono">{doc.users?.email}</div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center space-x-2">
                                            <FileText className="w-4 h-4 text-gray-500" />
                                            <span className="font-bold text-white uppercase text-xs">{doc.document_type}</span>
                                        </div>
                                    </td>
                                    <td className="p-6 text-gray-500 text-xs font-medium">
                                        {new Date(doc.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                            doc.status === 'verified' ? 'bg-green-500/10 text-green-500' : 
                                            doc.status === 'pending' ? 'bg-orange-500/10 text-orange-500' : 'bg-red-500/10 text-red-500'
                                        }`}>
                                            {doc.status}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <button 
                                            onClick={() => setSelectedDoc(doc)}
                                            className="w-10 h-10 bg-white/5 text-gray-400 rounded-xl hover:bg-accent hover:text-white transition-all inline-flex items-center justify-center"
                                        >
                                            <Eye className="w-4 h-4" />
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

        {/* Review Panel */}
        <div className="lg:col-span-1">
          <div className="bg-navy-light/40 border border-white/5 rounded-3xl p-8 shadow-xl sticky top-8">
            {selectedDoc ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex justify-between items-start">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Review <span className="text-accent">Dossier</span></h3>
                        <button onClick={() => setSelectedDoc(null)} className="p-2 hover:bg-white/5 rounded-lg text-gray-500"><XCircle className="w-5 h-5"/></button>
                    </div>

                    <div className="aspect-[4/3] bg-navy/50 rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden group relative">
                        {docUrl ? (
                            <img src={docUrl} alt="Document" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center space-y-4">
                                <FileText className="w-12 h-12 mx-auto text-gray-600 group-hover:text-accent transition-colors" />
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Document Preview Loading...</p>
                            </div>
                        )}
                        <a href={docUrl || '#'} target="_blank" rel="noreferrer" className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl inline-flex items-center space-x-2 text-xs font-bold text-white hover:text-accent transition-colors opacity-0 group-hover:opacity-100">
                            <Download className="w-3 h-3" />
                            <span>Download High-Res</span>
                        </a>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-navy/50 rounded-2xl border border-white/5">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Applicant Name</p>
                            <p className="text-white font-bold">{selectedDoc.users?.full_name}</p>
                        </div>
                        <div className="p-4 bg-navy/50 rounded-2xl border border-white/5">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Document Number</p>
                            <p className="text-white font-mono font-bold">{selectedDoc.id.split('-')[0].toUpperCase()}</p>
                        </div>
                    </div>

                    {selectedDoc.status === 'pending' ? (
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => handleAction(selectedDoc.id, selectedDoc.user_id, 'rejected')}
                                className="py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-bold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center space-x-2"
                            >
                                <XCircle className="w-4 h-4" />
                                <span>Reject</span>
                            </button>
                            <button 
                                onClick={() => handleAction(selectedDoc.id, selectedDoc.user_id, 'verified')}
                                className="py-4 bg-green-500 text-white rounded-2xl font-bold hover:bg-green-600 shadow-lg shadow-green-500/20 transition-all flex items-center justify-center space-x-2"
                            >
                                <CheckCircle className="w-4 h-4" />
                                <span>Approve</span>
                            </button>
                        </div>
                    ) : (
                        <div className={`p-6 rounded-2xl border text-center ${selectedDoc.status === 'verified' ? 'bg-green-500/5 border-green-500/20 text-green-500' : 'bg-red-500/5 border-red-500/20 text-red-500'}`}>
                            <div className="flex items-center justify-center space-x-2 mb-2">
                                {selectedDoc.status === 'verified' ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                                <span className="font-black uppercase tracking-widest text-sm">Review Complete</span>
                            </div>
                            <p className="text-[10px] font-medium opacity-70">Reviewed on {new Date(selectedDoc.reviewed_at).toLocaleString()}</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="py-20 text-center space-y-4">
                    <UserIcon className="w-16 h-16 mx-auto text-white/5" />
                    <p className="text-gray-500 text-sm font-bold">Select a submission to inspect details and documents.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
