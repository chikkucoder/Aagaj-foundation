import React, { useState } from 'react';
import SEO from '../components/SEO';
import { Award, BookOpen, Heart, Eye, Link as LinkIcon, CheckCircle2, MessageSquare, Quote } from 'lucide-react';

const Founder = () => {
  const [activePhoto, setActivePhoto] = useState(0);

  const photos = [
    { src: '/vivek-kumar-founder-aagaj-foundation-1.webp', alt: 'Vivek Kumar - Founder, AAGAJ Foundation' },
    { src: '/vivek-kumar-founder-aagaj-foundation-2.webp', alt: 'Vivek Kumar - Formal Portrait' },
    { src: '/vivek-kumar-founder-aagaj-foundation-3.webp', alt: 'Vivek Kumar - Business Profile' },
    { src: '/vivek-kumar-founder-aagaj-foundation-4.webp', alt: 'Vivek Kumar - Active Social Work Portrait' }
  ];

  const socialLinks = [
    { 
      name: 'LinkedIn', 
      url: 'https://www.linkedin.com/company/aagaj-foundation/', 
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/>
        </svg>
      )
    },
    { 
      name: 'Facebook', 
      url: 'https://www.facebook.com/share/19Q9fVQfS3/', 
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    { 
      name: 'Instagram', 
      url: 'https://www.instagram.com/aagajfoundation?igsh=OGs0Nm5uZjF4eXBn', 
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      )
    },
    { 
      name: 'X', 
      url: 'https://x.com/AagajFoundation', 
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    { 
      name: 'YouTube', 
      url: 'https://www.youtube.com/@aagajfoundation6622', 
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.507 9.388.507 9.388.507s7.518 0 9.388-.507a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    }
  ];

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Vivek Kumar",
    "jobTitle": "Founder, AAGAJ Foundation",
    "founderOf": {
      "@type": "NGO",
      "name": "Aagaj Foundation",
      "url": "https://aagajfoundation.com",
      "logo": "https://aagajfoundation.com/logo.jpg",
      "taxID": "NGO Darpan ID: BR/2020/0260968"
    },
    "image": [
      "https://aagajfoundation.com/vivek-kumar-founder-aagaj-foundation-1.webp",
      "https://aagajfoundation.com/vivek-kumar-founder-aagaj-foundation-2.webp",
      "https://aagajfoundation.com/vivek-kumar-founder-aagaj-foundation-3.webp",
      "https://aagajfoundation.com/vivek-kumar-founder-aagaj-foundation-4.webp"
    ],
    "description": "Vivek Kumar is the Founder of AAGAJ Foundation, a nonprofit organization dedicated to creating sustainable social impact through healthcare, employment generation, skill development, and women empowerment in Bihar.",
    "sameAs": [
      "https://www.linkedin.com/company/aagaj-foundation/",
      "https://www.facebook.com/share/19Q9fVQfS3/",
      "https://www.instagram.com/aagajfoundation?igsh=OGs0Nm5uZjF4eXBn",
      "https://x.com/AagajFoundation",
      "https://www.youtube.com/@aagajfoundation6622"
    ]
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "NGO",
    "name": "Aagaj Foundation",
    "url": "https://aagajfoundation.com",
    "logo": "https://aagajfoundation.com/logo.jpg",
    "founder": {
      "@type": "Person",
      "name": "Vivek Kumar",
      "jobTitle": "Founder, AAGAJ Foundation"
    }
  };

  const imageSchemas = photos.map(photo => ({
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "contentUrl": `https://aagajfoundation.com${photo.src}`,
    "license": "https://aagajfoundation.com/terms",
    "acquireLicensePage": "https://aagajfoundation.com/terms",
    "creator": {
      "@type": "Person",
      "name": "Vivek Kumar"
    },
    "creditText": "Aagaj Foundation Trust",
    "copyrightNotice": "Aagaj Foundation Trust"
  }));

  return (
    <div className="bg-slate-50 min-h-screen pb-16 font-sans">
      <SEO 
        title="Vivek Kumar - Founder, Aagaj Foundation"
        description="Vivek Kumar is the Founder of AAGAJ Foundation, a nonprofit organization dedicated to women empowerment, healthcare access, and vocational skill training in Bihar."
        canonicalUrl="https://aagajfoundation.com/about/founder"
        keywords="Vivek Kumar, Founder Aagaj Foundation, NGO Founder Bihar, Social Entrepreneur Patna"
        ogTitle="Vivek Kumar - Founder, AAGAJ Foundation"
        ogDescription="Uplifting rural families and building sustainable social welfare infrastructures across Bihar."
        ogImage="https://aagajfoundation.com/vivek-kumar-founder-aagaj-foundation-1.webp"
        schema={[personSchema, orgSchema, ...imageSchemas]}
      />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#0B2C66] via-[#103D88] to-[#1E4E9E] py-16 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(237,28,36,0.15),transparent)]"></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center gap-8">
          
          {/* Photos Grid & Gallery */}
          <div className="w-full md:w-1/3 space-y-4">
            <div className="aspect-square rounded-3xl overflow-hidden bg-white shadow-2xl border-4 border-white/10 group relative">
              <img 
                src={photos[activePhoto].src} 
                alt={photos[activePhoto].alt}
                className="w-full h-full object-cover select-none"
              />
            </div>
            
            {/* Gallery Thumbnails */}
            <div className="grid grid-cols-4 gap-2.5">
              {photos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => setActivePhoto(index)}
                  className={`aspect-square rounded-xl overflow-hidden bg-white border-2 cursor-pointer transition-all duration-300 ${activePhoto === index ? 'border-[#ED1C24] scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <img src={photo.src} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Heading Info */}
          <div className="w-full md:w-2/3 space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ED1C24]/10 border border-[#ED1C24]/20 text-[#ED1C24] text-xs font-bold uppercase tracking-wider">
              Founder & Social Entrepreneur
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">Vivek Kumar</h1>
            <p className="text-slate-300 text-sm sm:text-base font-semibold max-w-xl">
              Founder of AAGAJ Foundation. Working to empower rural families, women, and youth through healthcare and skill development.
            </p>
            
            {/* Social Links */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2.5 pt-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 text-white hover:text-[#0B2C66] hover:bg-white transition-all duration-300"
                  title={`${social.name} - Vivek Kumar`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Biography & Quote */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-md space-y-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800">Biography</h2>
              <div className="h-1.5 w-16 bg-[#ED1C24] rounded-full"></div>
              
              <div className="text-slate-600 text-sm sm:text-base leading-relaxed space-y-4 font-medium">
                <p>
                  Vivek Kumar is the Founder of AAGAJ Foundation, a nonprofit organization dedicated to creating sustainable social impact through healthcare, employment generation, skill development, and women empowerment.
                </p>
                <p>
                  Driven by the belief that every individual deserves equal opportunities, he established AAGAJ Foundation to empower communities with access to quality healthcare, livelihood opportunities, education, and practical skills. His vision is to build a healthier, more skilled, and self-reliant India by creating long-term solutions that improve lives.
                </p>
                <p>
                  Under his leadership, the foundation works with communities, institutions, healthcare providers, corporate partners, and volunteers to deliver impactful programs that promote social development and inclusive growth. He strongly believes that empowering youth and women is the key to building stronger families, resilient communities, and a prosperous nation.
                </p>
                <p>
                  As a social entrepreneur, Vivek focuses on innovation, collaboration, and sustainable development rather than short-term solutions. His mission is to create opportunities that inspire people to achieve financial independence, better health, and a brighter future.
                </p>
              </div>
            </div>

            {/* Quote Card */}
            <div className="bg-gradient-to-r from-[#ED1C24] to-[#c71219] text-white rounded-3xl p-8 shadow-md relative overflow-hidden">
              <Quote className="absolute right-6 top-6 h-24 w-24 text-white/5 pointer-events-none" />
              <div className="space-y-4 relative z-10">
                <p className="text-base sm:text-lg font-bold italic leading-relaxed">
                  "True leadership is not about being ahead of others; it is about lifting others so they can move forward with confidence."
                </p>
                <div className="text-right">
                  <span className="font-extrabold text-xs tracking-wider uppercase">— Vivek Kumar</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Achievements, Vision, Education, Awards, Work, Interviews */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Vision Box */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-md space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <Eye className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Our Vision</h3>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm font-semibold leading-relaxed">
                Building a healthier, highly skilled, and financially self-reliant India by executing long-term structural programs rather than temporary short-term solutions.
              </p>
            </div>

            {/* Achievements Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-md space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Key Achievements</h3>
              </div>
              
              <ul className="space-y-3 text-xs sm:text-sm font-semibold text-slate-600">
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 bg-[#ED1C24] rounded-full mt-2 shrink-0"></span>
                  Established rural vocational training centers for tailoring under Mahila Silayi Prasikshan (over 500 graduates).
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 bg-[#ED1C24] rounded-full mt-2 shrink-0"></span>
                  Pioneered Swasthya Suraksha Card program connecting hundreds of families with flat 10-50% healthcare discounts.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 bg-[#ED1C24] rounded-full mt-2 shrink-0"></span>
                  Formed active village Self-Help Groups (SHGs) under Mahila Swarojgaar enterprise financing.
                </li>
              </ul>
            </div>

            {/* Awards & Education Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-md space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                  <Award className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Awards & Education</h3>
              </div>
              
              <div className="space-y-4 text-xs sm:text-sm font-semibold text-slate-600">
                <div className="border-l-2 border-slate-100 pl-4 space-y-1">
                  <span className="text-xs text-[#ED1C24] font-extrabold uppercase">Education</span>
                  <p className="text-slate-800">Social Entrepreneurship & Rural Development Training</p>
                </div>
                <div className="border-l-2 border-slate-100 pl-4 space-y-1">
                  <span className="text-xs text-[#ED1C24] font-extrabold uppercase">Awards</span>
                  <p className="text-slate-800">Local Panchayat & Block Administration Recognition for Outstanding Welfare Contribution</p>
                </div>
              </div>
            </div>

            {/* Social Work & Interviews */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-md space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-50 text-[#ED1C24]">
                  <Heart className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Social Work & Media</h3>
              </div>
              
              <div className="space-y-3 text-xs sm:text-sm font-semibold text-slate-600">
                <div className="flex items-start gap-3">
                  <BookOpen className="h-4 w-4 text-[#ED1C24] shrink-0 mt-0.5" />
                  <p>Over 5 years of active campaigns in health hygiene, digital card distribution, and women's self-employment.</p>
                </div>
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-4 w-4 text-[#ED1C24] shrink-0 mt-0.5" />
                  <p>Interviews with local print and regional web media channels discussing rural employment generation frameworks.</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};

export default Founder;
