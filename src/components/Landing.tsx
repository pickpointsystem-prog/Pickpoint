
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Users, BarChart3, ChevronRight, CheckCircle2 } from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Navbar */}
      <nav className="border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>
            <span className="text-xl font-bold tracking-tight">Pickpoint</span>
          </div>
          <div className="flex gap-4">
             <Link to="/tracking" className="text-sm font-medium text-slate-600 hover:text-blue-600 px-4 py-2">Track Package</Link>
             <Link to="/form" className="text-sm font-medium bg-slate-900 text-white px-5 py-2 rounded-lg hover:bg-black transition-colors">Register Unit</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="py-20 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6">
          <Zap className="w-4 h-4" /> Smart Apartment Management
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight mb-6 leading-tight">
          Modern Package Management for <span className="text-blue-600">Premium Residences</span>
        </h1>
        <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Stop lost packages and front-desk chaos. Pickpoint provides an automated system for receiving, tracking, and distributing resident packages with WhatsApp integration.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="https://wa.me/628123456789" className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
            Book a Demo <ChevronRight className="w-5 h-5" />
          </a>
          <a href="/admin" className="px-8 py-4 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center">
            Login to Dashboard
          </a>
        </div>
      </header>

      {/* Features Grid */}
      <section className="py-20 bg-slate-50 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: ShieldCheck,
              title: "Secure & Accountable",
              desc: "Every package is scanned, photographed, and logged. Digital proof of pickup ensures zero disputes."
            },
            {
              icon: Users,
              title: "Resident Membership",
              desc: "Monetize your storage. Offer free storage for members and charge fees for non-members automatically."
            },
            {
              icon: Zap,
              title: "Instant WA Notifications",
              desc: "Residents get a WhatsApp message the second a package arrives with a secure pickup code."
            }
          ].map((f, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{f.title}</h3>
              <p className="text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing / Value Prop */}
      <section className="py-20 px-6 border-t border-slate-200">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
           <div className="flex-1 space-y-6">
             <h2 className="text-3xl font-bold text-slate-900">Why Building Managers Choose Pickpoint</h2>
             <ul className="space-y-4">
               {[
                 "Reduce front-desk workload by 70%",
                 "Generate new revenue stream via Storage Fees",
                 "Full audit trail & analytics dashboard",
                 "Compatible with any courier service"
               ].map((item, i) => (
                 <li key={i} className="flex items-center gap-3 text-slate-600 font-medium">
                   <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" /> {item}
                 </li>
               ))}
             </ul>
           </div>
           <div className="flex-1 bg-slate-900 text-white p-10 rounded-3xl shadow-2xl relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="text-2xl font-bold mb-2">Ready to upgrade?</h3>
               <p className="text-slate-400 mb-6">Join 50+ apartments using Pickpoint.</p>
               <div className="bg-white/10 p-4 rounded-xl backdrop-blur mb-4">
                 <div className="text-sm text-slate-300 uppercase tracking-wide font-bold mb-1">Total Packages Processed</div>
                 <div className="text-4xl font-bold">125,000+</div>
               </div>
             </div>
             <BarChart3 className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5" />
           </div>
        </div>
      </section>

      <footer className="bg-white border-t border-slate-100 py-12 px-6 text-center text-slate-400 text-sm">
        <p>&copy; 2024 Pickpoint Systems. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
