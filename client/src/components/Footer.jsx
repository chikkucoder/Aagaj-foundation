import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Heart, ArrowRight, ExternalLink } from 'lucide-react';

const socialLinks = [
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/share/19Q9fVQfS3/',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/aagajfoundation?igsh=OGs0Nm5uZjF4eXBn',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
  },
  {
    name: 'Twitter',
    url: 'https://x.com/AagajFoundation',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/company/aagaj-foundation/',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/@aagajfoundation6622',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
];

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 print:hidden">
      {/* Top gradient accent */}
      <div className="h-1.5 bg-gradient-to-r from-[#ED1C24] via-[#fdd831] to-[#ED1C24]"></div>

      {/* Main footer grid */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          
          {/* Column 1: Organization Info */}
          <div className="space-y-5 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.jpeg" 
                alt="Aagaj Foundation Logo" 
                className="h-14 w-auto rounded-lg bg-white p-1 shadow-md"
              />
              <div>
                <span className="font-extrabold text-lg text-white tracking-wide block leading-tight">AAGAJ</span>
                <span className="font-bold text-xs text-[#fdd831] tracking-widest uppercase">Foundation</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Registered Under Indian Trust Act 1882. Dedicated to empowering women, providing healthcare accessibility, and creating self-employment opportunities across rural communities.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-1">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={social.name}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-[#ED1C24] transition-all duration-300 hover:scale-110"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="h-0.5 w-5 bg-[#ED1C24] rounded-full"></span>
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="flex items-center gap-1.5 text-slate-400 hover:text-[#fdd831] hover:translate-x-1 transition-all duration-200">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100" /> Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="flex items-center gap-1.5 text-slate-400 hover:text-[#fdd831] hover:translate-x-1 transition-all duration-200">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100" /> About Us
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="flex items-center gap-1.5 text-slate-400 hover:text-[#fdd831] hover:translate-x-1 transition-all duration-200">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100" /> Gallery
                </Link>
              </li>
              <li>
                <Link to="/donate" className="flex items-center gap-1.5 text-slate-400 hover:text-[#fdd831] hover:translate-x-1 transition-all duration-200">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100" /> Donate Us
                </Link>
              </li>
              <li>
                <Link to="/careers/ngo-jobs" className="flex items-center gap-1.5 text-slate-400 hover:text-[#fdd831] hover:translate-x-1 transition-all duration-200">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100" /> Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Our Programmes */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="h-0.5 w-5 bg-[#fdd831] rounded-full"></span>
              Our Programmes
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/schemes/silayi" className="text-slate-400 hover:text-[#fdd831] hover:translate-x-1 transition-all duration-200 block">
                  Mahila Silayi Prasikshan
                </Link>
              </li>
              <li>
                <Link to="/schemes/swarojgaar" className="text-slate-400 hover:text-[#fdd831] hover:translate-x-1 transition-all duration-200 block">
                  Mahila Swarojgaar Yojana
                </Link>
              </li>
              <li>
                <Link to="/medical/healthcard" className="text-slate-400 hover:text-[#fdd831] hover:translate-x-1 transition-all duration-200 block">
                  Swasthya Suraksha Card
                </Link>
              </li>
              <li>
                <Link to="/medical/appointment" className="text-slate-400 hover:text-[#fdd831] hover:translate-x-1 transition-all duration-200 block">
                  Doctor Appointment
                </Link>
              </li>
              <li>
                <Link to="/careers/general-jobs" className="text-slate-400 hover:text-[#fdd831] hover:translate-x-1 transition-all duration-200 block">
                  General Jobs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Address */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="h-0.5 w-5 bg-[#ED1C24] rounded-full"></span>
              Contact Us
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 text-[#fdd831] shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-slate-400 leading-relaxed block">Bhupatipur Road, Near Krishi Anusandhan Kendra, Patna - 800020, Bihar</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 text-[#fdd831] shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <a href="tel:+919431430464" className="text-slate-400 hover:text-white transition-colors">
                  +91 9431430464
                </a>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 text-[#fdd831] shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <a href="mailto:info@aagajfoundation.in" className="text-slate-400 hover:text-white transition-colors">
                  info@aagajfoundation.in
                </a>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 text-[#fdd831] shrink-0">
                  <ExternalLink className="h-4 w-4" />
                </div>
                <a href="https://aagajfoundation.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                  aagajfoundation.com
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* NGO Registration Info Bar */}
      <div className="border-t border-slate-800 bg-slate-900/80">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs text-slate-500">
            <span>📋 NGO Darpan: <strong className="text-slate-400">BR/2020/026096</strong></span>
            <span>📝 Reg. No: <strong className="text-slate-400">759445</strong></span>
            <span>🏛️ Income Tax 12A & 80G Certified</span>
          </div>
        </div>
      </div>

      {/* Bottom copyright bar */}
      <div className="bg-slate-950 py-5 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Aagaj Foundation Trust. All Rights Reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-500 fill-red-500 animate-pulse" /> for community empowerment
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
