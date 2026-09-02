import React from 'react';
import { ShieldCheck, HeartPulse, GraduationCap, Users } from 'lucide-react';
import SEO from '../components/SEO';

const About = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <SEO 
        title="About Us - Aagaj Foundation Trust Bihar"
        description="Aagaj Foundation is a registered public charitable trust under the Indian Trust Act 1882. Discover our mission, values, and how we empower women and build local healthcare networks."
        canonicalUrl="https://www.aagajfoundation.com/about"
        keywords="About Aagaj Foundation, Trust Act 1882, Bihar NGO founders, NGO mission Patna"
        ogTitle="About Us - Aagaj Foundation Trust"
        ogDescription="Discover our genesis, vision, and how we create sustainable livelihoods for rural communities."
        ogImage="https://www.aagajfoundation.com/logo.jpg"
        schema={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://www.aagajfoundation.com/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "About Us",
              "item": "https://www.aagajfoundation.com/about"
            }
          ]
        }}
      />
      
      {/* Page Header */}
      <section className="relative py-16 bg-slate-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-rose-950 opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase">About Aagaj Foundation</h1>
          <p className="max-w-2xl mx-auto text-slate-300 font-semibold text-base">
            Registered Under Indian Trust Act 1882. Committed to social equity, women independence, and comprehensive welfare.
          </p>
        </div>
      </section>

      {/* Main Info */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <h2 className="text-3xl font-black text-slate-800 leading-tight">
                Our Genesis & <span className="text-[#ED1C24]">Driving Vision</span>
              </h2>
              <p className="text-slate-600 leading-relaxed font-semibold">
                Aagaj Foundation was founded with a singular, powerful ambition: to bridge the socio-economic gaps in rural and semi-urban communities of Bihar. By focusing on essential needs—hygiene, employment opportunities, and specialized vocational skills—we aim to enable sustainable self-reliance.
              </p>
              <p className="text-slate-600 leading-relaxed font-medium">
                We believe that when women are educated and skilled, entire families are lifted out of poverty. Our multi-faceted approach combines vocational training (Mahila Silayi Prasikshan), medical security (Swasthya Suraksha Yojana), and job opportunities (Panchayat Coordinators) to create a thriving, secure, and empowered rural ecosystem.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-rose-100 hover:shadow-md transition-all text-center space-y-2">
                <HeartPulse className="h-10 w-10 text-[#ED1C24] mx-auto" />
                <h4 className="font-bold text-slate-800 text-lg">Health Access</h4>
                <p className="text-xs text-slate-500 font-bold">Comprehensive health cards and simple local appointments.</p>
              </div>
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-rose-100 hover:shadow-md transition-all text-center space-y-2">
                <GraduationCap className="h-10 w-10 text-[#ED1C24] mx-auto" />
                <h4 className="font-bold text-slate-800 text-lg">Skill Development</h4>
                <p className="text-xs text-slate-500 font-bold">Empowering sewing schools with professional sewing certification.</p>
              </div>
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-rose-100 hover:shadow-md transition-all text-center space-y-2">
                <ShieldCheck className="h-10 w-10 text-[#ED1C24] mx-auto" />
                <h4 className="font-bold text-slate-800 text-lg">Trust & Security</h4>
                <p className="text-xs text-slate-500 font-bold">Audited systems, fully transparent Razorpay gateway logs.</p>
              </div>
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-rose-100 hover:shadow-md transition-all text-center space-y-2">
                <Users className="h-10 w-10 text-[#ED1C24] mx-auto" />
                <h4 className="font-bold text-slate-800 text-lg">Community</h4>
                <p className="text-xs text-slate-500 font-bold">Uplifting backward segments and promoting rural development.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-20 bg-slate-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Our Leadership</h2>
            <div className="h-1.5 w-16 bg-[#fdd831] mx-auto rounded-full"></div>
            <p className="text-slate-500 font-semibold">The dedicated team behind our social developmental initiatives.</p>
          </div>

          <div className="flex justify-center">
            <div className="max-w-sm bg-white rounded-2xl overflow-hidden shadow-md border-b-4 border-[#fdd831] hover:border-[#ED1C24] transition-all p-6 space-y-4">
              <img 
                src="/chairman.jpg" 
                alt="Vivek Kumar" 
                className="w-48 h-48 rounded-full mx-auto object-cover border-4 border-rose-100 shadow-inner"
              />
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Vivek Kumar</h3>
                <p className="text-sm font-extrabold text-[#ED1C24] uppercase tracking-wider">Founder & Chairman</p>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed font-semibold">
                Vivek Kumar leads Aagaj Foundation with a persistent focus on grassroot implementations, program expansions, and transparent governance to serve rural communities.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
