import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { createAdminNotification } from '../../lib/adminNotifications';
import { useAuthStore } from '../../store/authStore';
import { CheckCircle, Upload, ShieldCheck, FileText, Loader2, User as UserIcon, AlertCircle } from 'lucide-react';

const MAX_KYC_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_KYC_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export const KYCPage = () => {
  const { user, profile, fetchProfile } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  // Form State
  const [personalInfo, setPersonalInfo] = useState({
    dob: '',
    address: '',
    city: '',
    country: ''
  });

  const [files, setFiles] = useState<{
    id_front: File | null;
    id_back: File | null;
    selfie: File | null;
    poa: File | null; 
  }>({
    id_front: null,
    id_back: null,
    selfie: null,
    poa: null
  });

  const handleFileChange = (field: keyof typeof files, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_KYC_FILE_TYPES.includes(file.type)) {
      setMsg({ type: 'error', text: 'Please upload JPG, PNG, WebP, or PDF files only.' });
      e.target.value = '';
      return;
    }

    if (field === 'selfie' && !file.type.startsWith('image/')) {
      setMsg({ type: 'error', text: 'Selfie verification must be an image file.' });
      e.target.value = '';
      return;
    }

    if (file.size > MAX_KYC_FILE_SIZE) {
      setMsg({ type: 'error', text: 'Each KYC file must be 10MB or smaller.' });
      e.target.value = '';
      return;
    }

    setMsg(null);
    setFiles({ ...files, [field]: file });
  };

  const submitKYC = async () => {
    if (!user) return;

    if (!files.id_front || !files.id_back || !files.selfie || !files.poa) {
      setMsg({ type: 'error', text: 'Please upload all required documents.' });
      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      // 1. Upload files to Storage
      const uploadPromises = Object.entries(files).map(async ([docType, file]) => {
        if (!file) return null;
        const extension = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() : undefined;
        const filePath = `${user.id}/${docType}-${Date.now()}${extension ? `.${extension}` : ''}`;
        
        const { error: uploadError } = await supabase.storage
          .from('kyc_documents')
          .upload(filePath, file, {
            contentType: file.type,
            upsert: false
          });

        if (uploadError) throw uploadError;

        // 2. Insert record in kyc_documents
        const { error: dbError } = await supabase
          .from('kyc_documents')
          .insert({
            user_id: user.id,
            document_type: docType,
            document_url: filePath,
            personal_info: personalInfo,
            file_name: file.name,
            file_mime_type: file.type,
            file_size: file.size,
            status: 'pending'
          });

        if (dbError) throw dbError;
      });

      await Promise.all(uploadPromises);

      // 3. Update user profile status
      await supabase
        .from('users')
        .update({ kyc_status: 'under_review' })
        .eq('id', user.id);

      // Refresh auth store profile
      await fetchProfile(user.id);

      // Notify admins about new KYC submission
      await createAdminNotification({
        title: 'New KYC Submission',
        message: `${profile?.full_name || user.email} has submitted KYC documents for review.`,
        type: 'kyc_submission'
      });

      setStep(3); // Success step
    } catch (error: any) {
      console.error('KYC Submission Error:', error);
      setMsg({ type: 'error', text: error.message || 'Failed to submit KYC documents.' });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  if (profile.kyc_status === 'approved') {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border border-green-500/20">
          <ShieldCheck className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-3xl font-black text-white uppercase tracking-widest mb-4">Verification Complete</h1>
        <p className="text-gray-400 font-medium max-w-md text-center">Your identity has been fully verified. You have unrestricted access to all platform features, including trading and monetary transfers.</p>
        <div className="mt-8 px-6 py-3 bg-navy/50 border border-white/5 rounded-2xl">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">KYC Level</p>
          <p className="text-xl font-black text-accent">{profile.kyc_level}</p>
        </div>
      </div>
    );
  }

  if (profile.kyc_status === 'under_review') {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mb-6 border border-accent/20">
          <Loader2 className="w-12 h-12 text-accent animate-spin" />
        </div>
        <h1 className="text-3xl font-black text-white uppercase tracking-widest mb-4">Under Review</h1>
        <p className="text-gray-400 font-medium max-w-md text-center">Your documents have been submitted and are currently being reviewed by our compliance team. This usually takes 24-48 hours.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white uppercase tracking-widest mb-2">Identity <span className="text-accent">Verification</span></h1>
        <p className="text-gray-400 font-medium">Complete your KYC application to comply with global AML regulations and unlock trading features.</p>
      </div>

      {profile.kyc_status === 'rejected' && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start space-x-4 mb-8">
          <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
          <div>
            <h3 className="text-red-500 font-bold uppercase tracking-widest text-sm mb-1">Application Rejected</h3>
            <p className="text-gray-300 text-sm">Your previous submission was rejected. Please ensure all details are correct and document images are clear, then re-submit below.</p>
          </div>
        </div>
      )}

      {msg && (
        <div className={`p-4 rounded-2xl mb-8 font-medium ${msg.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
          {msg.text}
        </div>
      )}

      <div className="flex space-x-4 mb-8">
        <div className={`flex-1 pb-4 border-b-2 font-bold uppercase tracking-widest text-xs transition-colors ${step >= 1 ? 'border-accent text-accent' : 'border-white/5 text-gray-500'}`}>1. Personal Info</div>
        <div className={`flex-1 pb-4 border-b-2 font-bold uppercase tracking-widest text-xs transition-colors ${step >= 2 ? 'border-accent text-accent' : 'border-white/5 text-gray-500'}`}>2. Documents</div>
        <div className={`flex-1 pb-4 border-b-2 font-bold uppercase tracking-widest text-xs transition-colors ${step >= 3 ? 'border-accent text-accent' : 'border-white/5 text-gray-500'}`}>3. Submit</div>
      </div>

      <div className="bg-navy-light/40 border border-white/5 rounded-3xl p-8 shadow-xl">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center space-x-2">
              <UserIcon className="w-5 h-5 text-accent" />
              <span>Personal Details</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Full Legal Name</label>
                <input type="text" disabled value={profile.full_name} className="w-full bg-navy/50 border border-white/5 p-4 rounded-2xl text-gray-400 font-medium cursor-not-allowed" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Date of Birth</label>
                <input type="date" value={personalInfo.dob} onChange={e => setPersonalInfo({...personalInfo, dob: e.target.value})} className="w-full bg-navy border border-white/10 p-4 rounded-2xl text-white font-medium focus:outline-none focus:border-accent" />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Residential Address</label>
                <input type="text" value={personalInfo.address} onChange={e => setPersonalInfo({...personalInfo, address: e.target.value})} placeholder="Street Address" className="w-full bg-navy border border-white/10 p-4 rounded-2xl text-white font-medium focus:outline-none focus:border-accent mb-4" />
                <div className="grid grid-cols-2 gap-4">
                   <input type="text" value={personalInfo.city} onChange={e => setPersonalInfo({...personalInfo, city: e.target.value})} placeholder="City" className="w-full bg-navy border border-white/10 p-4 rounded-2xl text-white font-medium focus:outline-none focus:border-accent" />
                   <input type="text" value={personalInfo.country} onChange={e => setPersonalInfo({...personalInfo, country: e.target.value})} placeholder="Country" className="w-full bg-navy border border-white/10 p-4 rounded-2xl text-white font-medium focus:outline-none focus:border-accent" />
                </div>
              </div>
            </div>

            <div className="pt-6 text-right">
              <button 
                onClick={() => setStep(2)}
                disabled={!personalInfo.dob || !personalInfo.address || !personalInfo.city || !personalInfo.country}
                className="bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all disabled:opacity-50"
              >
                Continue to Documents
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
             <h3 className="text-lg font-bold text-white mb-6 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-accent" />
              <span>Identity Documents</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { id: 'id_front', label: 'ID Document (Front)', desc: 'Passport, Driver License, or National ID.' },
                { id: 'id_back', label: 'ID Document (Back)', desc: 'Back of your ID card.' },
                { id: 'selfie', label: 'Selfie Photo', desc: 'A clear photo of your face.' },
                { id: 'poa', label: 'Proof of Address', desc: 'Utility bill or bank statement (Recent 3 months).' }
              ].map(doc => (
                <div key={doc.id} className={`border border-dashed rounded-3xl p-6 transition-colors ${files[doc.id as keyof typeof files] ? 'bg-accent/5 border-accent text-accent' : 'border-white/10 bg-navy/50 text-gray-400 hover:border-white/30'}`}>
                  <label className="flex flex-col items-center justify-center cursor-pointer h-full">
                    {files[doc.id as keyof typeof files] ? (
                      <CheckCircle className="w-8 h-8 mb-3 text-accent" />
                    ) : (
                      <Upload className="w-8 h-8 mb-3 opacity-50" />
                    )}
                    <span className="font-bold uppercase tracking-widest text-xs text-white mb-1">{doc.label}</span>
                    <span className="text-[10px] text-center opacity-70 mb-4">{doc.desc}</span>
                    <span className="px-4 py-2 bg-white/5 rounded-lg text-xs font-bold font-mono">
                      {files[doc.id as keyof typeof files] ? files[doc.id as keyof typeof files]?.name : 'Browse File'}
                    </span>
                    <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e) => handleFileChange(doc.id as keyof typeof files, e)} />
                  </label>
                </div>
              ))}
            </div>

            <div className="pt-6 flex justify-between">
              <button onClick={() => setStep(1)} className="px-8 py-4 text-gray-500 hover:text-white font-bold uppercase tracking-widest text-xs transition-all">Back</button>
              <button 
                onClick={submitKYC}
                disabled={loading || !files.id_front || !files.id_back || !files.selfie || !files.poa}
                className="bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Submit Application</span>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
