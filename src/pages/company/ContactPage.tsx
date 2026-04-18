import { Mail, Phone, MapPin, MessageSquare, Clock, Globe } from 'lucide-react';

export const ContactPage = () => {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight uppercase">
          Get in <span className="text-accent underline decoration-accent/30 underline-offset-8">Touch</span>
        </h1>
        <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
          Our global support team is available 24/7 to assist you.
          Choose your preferred channel and we'll be in touch.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Cards */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-navy-light/20 border border-white/5 p-6 rounded-3xl hover:border-accent/20 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                <Mail className="text-accent w-5 h-5" />
              </div>
              <h3 className="text-white font-bold">Email Support</h3>
            </div>
            <p className="text-[13px] text-gray-500 mb-2">General Inquiries: support@tradex.com</p>
            <p className="text-[13px] text-gray-500">Partnerships: partners@tradex.com</p>
          </div>

          <div className="bg-navy-light/20 border border-white/5 p-6 rounded-3xl hover:border-accent-cyan/20 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-accent-cyan/10 rounded-xl flex items-center justify-center shrink-0">
                <Phone className="text-accent-cyan w-5 h-5" />
              </div>
              <h3 className="text-white font-bold">Phone Lines</h3>
            </div>
            <p className="text-[13px] text-gray-500 mb-2">Global: +44 20 7946 0123</p>
            <p className="text-[13px] text-gray-500">Asia Pacific: +65 6123 4567</p>
          </div>

          <div className="bg-navy-light/20 border border-white/5 p-6 rounded-3xl hover:border-emerald-500/20 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="text-emerald-500 w-5 h-5" />
              </div>
              <h3 className="text-white font-bold">Main Headquarters</h3>
            </div>
            <p className="text-[13px] text-gray-500 leading-relaxed italic text-balance">
              Level 42, One Canada Square, Canary Wharf, London E14 5AB, United Kingdom
            </p>
          </div>

          <div className="bg-navy-light/20 border border-white/5 p-6 rounded-3xl hover:border-orange-500/20 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center shrink-0">
                <Clock className="text-orange-500 w-5 h-5" />
              </div>
              <h3 className="text-white font-bold">Operation Hours</h3>
            </div>
            <p className="text-[13px] text-gray-500 mb-2">Trading: 24/5 (Mon - Fri)</p>
            <p className="text-[13px] text-gray-500">Support: 24/7 (Global)</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-navy-light/30 border border-white/5 p-8 md:p-12 rounded-[3rem] relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none -z-10 transition-all duration-1000 group-hover:bg-accent/10"></div>

          <div className="flex items-center gap-3 mb-8">
            <MessageSquare className="text-accent w-6 h-6" />
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Send a Message</h2>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pl-1">Full Name</label>
              <input type="text" className="w-full bg-navy border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-accent/40 shadow-inner" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pl-1">Email Address</label>
              <input type="email" className="w-full bg-navy border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-accent/40 shadow-inner" placeholder="john@example.com" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pl-1">Subject</label>
              <select className="w-full bg-navy border border-white/10 rounded-2xl px-6 py-4 text-gray-400 focus:outline-none">
                <option>General Support</option>
                <option>Technical Issue</option>
                <option>Account Verification</option>
                <option>Withdrawal/Deposit</option>
                <option>Partnership Inquiry</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pl-1">Message</label>
              <textarea rows={5} className="w-full bg-navy border border-white/10 rounded-3xl px-6 py-4 text-white focus:outline-none focus:border-accent/40 shadow-inner resize-none" placeholder="Tell us how we can help..."></textarea>
            </div>
            <div className="md:col-span-2 pt-4">
              <button className="w-full bg-gradient-to-r from-accent to-accent-cyan text-white font-black py-5 rounded-[2.5rem] shadow-xl shadow-accent/20 hover:scale-[1.01] active:scale-[0.99] transition-all uppercase tracking-widest text-sm">
                Send Inquiry
              </button>
              <p className="text-center text-[10px] text-gray-600 mt-6 uppercase tracking-widest italic font-bold">We typically respond within 1 to 3 business hours.</p>
            </div>
          </form>
        </div>
      </div>

      <section className="bg-navy-light/10 border border-white/5 p-10 rounded-[2.5rem] mt-16 text-center">
        <h2 className="text-2xl font-black text-white mb-8 flex items-center justify-center gap-3">
          <Globe className="text-accent w-6 h-6 animate-pulse" />
          Global Reach
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-white font-bold text-lg mb-1">London</h4>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Main Hub</p>
          </div>
          <div>
            <h4 className="text-white font-bold text-lg mb-1">Singapore</h4>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">APAC Center</p>
          </div>
          <div>
            <h4 className="text-white font-bold text-lg mb-1">New York</h4>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Markets Desk</p>
          </div>
          <div>
            <h4 className="text-white font-bold text-lg mb-1">Dubai</h4>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Regional Office</p>
          </div>
        </div>
      </section>
    </div>
  );
};
