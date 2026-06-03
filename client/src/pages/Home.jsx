import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Heart, Play } from 'lucide-react';

const heroImages = [
  { src: '/pic1.jpeg', alt: 'Aagaj Foundation Rally' },
  { src: '/pic4.jpg', alt: 'Women Health Distribution' },
  { src: '/pic2.jpg', alt: 'Sewing Training Center' },
  { src: '/pic5.jpg', alt: 'Awareness Campaign' },
  { src: '/pic3.jpg', alt: 'Community Meeting' },
];

const Home = () => {
  const [slides, setSlides] = useState(heroImages);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch dynamic carousel images from backend
  useEffect(() => {
    const fetchCarousel = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${baseUrl}/api/carousel`);
        const result = await response.json();
        if (result.success && result.data && result.data.length > 0) {
          const mappedSlides = result.data.map(item => ({
            src: item.imageUrl,
            alt: item.title || 'Aagaj Foundation'
          }));
          setSlides(mappedSlides);
        }
      } catch (err) {
        console.error("Failed to load carousel images from API, using defaults:", err);
      }
    };
    fetchCarousel();
  }, []);

  // Auto-slide effect for the Hero Carousel
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. HERO CAROUSEL */}
      <header className="relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[85vh] overflow-hidden bg-black">
        {slides.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-full object-cover object-center select-none"
              style={{ objectPosition: '50% 25%' }}
            />
            {/* Red overlay at the bottom matching brand aesthetic */}
            <div className="absolute inset-0 bg-gradient-to-t from-red-600/70 via-black/30 to-transparent z-10"></div>
          </div>
        ))}

        {/* Carousel Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-8 bg-[#fdd831]' : 'w-3 bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Hero Text Content */}
        <div className="absolute bottom-16 left-0 right-0 z-20 text-white py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
            <h1 className="text-2xl md:text-5xl font-black mb-3 border-l-8 border-[#fdd831] pl-4 drop-shadow-lg leading-tight uppercase">
              Empowering Women, <br className="hidden sm:inline" />Uplifting Communities
            </h1>
            <p className="text-sm md:text-lg max-w-2xl opacity-90 drop-shadow pl-6 font-semibold">
              Aagaj Foundation works to empower women, improve health awareness, and strengthen community development through sustainable programmes.
            </p>
          </div>
        </div>
      </header>

      {/* 2. ABOUT BRIEF */}
      <section className="py-20 bg-amber-50/20 border-b border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">
                About <span className="text-[#ED1C24]">Aagaj Foundation</span>
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed font-medium">
                Aagaj Foundation is a community-driven organization dedicated to empowering women, improving health awareness, and strengthening rural development. Through our skill-training programmes, self-employment initiatives, and healthcare support services, we aim to create opportunities that uplift families and transform communities.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-[#ED1C24]">
                    <Check className="h-6 w-6 stroke-[3]" />
                  </div>
                  <span className="text-lg font-bold text-slate-700">Empowering Rural Bihar</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-[#ED1C24]">
                    <Check className="h-6 w-6 stroke-[3]" />
                  </div>
                  <span className="text-lg font-bold text-slate-700">Driving Inclusive Growth</span>
                </div>
              </div>

              <Link
                to="/about"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#fdd831] hover:bg-amber-400 font-extrabold text-slate-800 px-6 py-3 shadow-md hover:shadow-lg transition-all"
              >
                Know More <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-[#fdd831]/10 rounded-2xl rotate-2 scale-105 group-hover:rotate-1 transition-transform"></div>
              <img
                src="/pic3.jpg"
                alt="Aagaj Foundation Team"
                className="relative rounded-2xl shadow-xl w-full h-[380px] object-cover group-hover:scale-[1.01] transition-transform"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROGRAMMES */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl md:text-5xl font-black text-[#ED1C24] tracking-tight uppercase">
              Our Programmes
            </h2>
            <div className="h-1.5 w-24 bg-[#fdd831] mx-auto rounded-full"></div>
            <p className="text-slate-600 text-lg font-bold">
              Empowering Rural Bihar, Driving Inclusive Growth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Silayi Training */}
            <div className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-md border-b-4 border-[#fdd831] hover:border-[#ED1C24] hover:-translate-y-2 transition-all duration-300">
              <img src="/silai.jpeg" alt="Silayi Training" className="h-56 w-full object-cover" />
              <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-800">Silayi Training</h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-semibold">
                    Providing vocational sewing training (Mahila Silayi Prasikshan Yojana) to help women achieve financial independence and master valuable tailoring skills.
                  </p>
                </div>
                <Link to="/login" className="inline-flex items-center gap-1 text-sm font-bold text-[#ED1C24] uppercase tracking-wide hover:underline">
                  Register <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Women Health */}
            <div className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-md border-b-4 border-[#fdd831] hover:border-[#ED1C24] hover:-translate-y-2 transition-all duration-300">
              <img src="/women.jpg" alt="Women Health" className="h-56 w-full object-cover" />
              <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-800">Women Health Support</h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-semibold">
                    Improving health awareness, sanitary hygiene, and hospital service access across rural blocks through the Mahila Swasthya Suraksha Yojana.
                  </p>
                </div>
                <Link to="/medical/healthcard" className="inline-flex items-center gap-1 text-sm font-bold text-[#ED1C24] uppercase tracking-wide hover:underline">
                  Get Card <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Community Welfare */}
            <div className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-md border-b-4 border-[#fdd831] hover:border-[#ED1C24] hover:-translate-y-2 transition-all duration-300">
              <img src="/community.jpg" alt="Community Welfare" className="h-56 w-full object-cover" />
              <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-800">Community Welfare</h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-semibold">
                    Food distributions, education assistance, and social empowerment initiatives designed for marginalized sections of society.
                  </p>
                </div>
                <Link to="/donate" className="inline-flex items-center gap-1 text-sm font-bold text-[#ED1C24] uppercase tracking-wide hover:underline">
                  Support Us <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. IMPACT SHOWCASE */}
      <section className="py-20 bg-rose-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 flex justify-center">
              <img 
                src="/meter.png" 
                alt="Impact Meter" 
                className="max-h-[420px] w-auto animate-pulse" 
              />
            </div>

            <div className="lg:col-span-7 space-y-6">
              <p className="text-sm font-extrabold uppercase tracking-widest text-[#ED1C24]">
                People Impacted by Aagaj Foundation
              </p>
              <h2 className="text-2xl md:text-4xl font-black text-slate-800 leading-tight">
                We support <span className="text-[#ED1C24]">women and rural communities</span> with vocational training and health card accessibility.
              </h2>
              <p className="text-slate-600 text-base leading-relaxed font-medium">
                Aagaj Foundation works across villages and districts to uplift underprivileged women through various welfare schemes such as Mahila Silayi Prasikshan Yojana, Mahila Swarojgaar Yojana, Mahila Swasthya Suraksha Yojana, and Har Graam Ward Pathshala Yojana. Our efforts focus on providing skill training, self-employment support, healthcare benefits, and educational assistance to improve the quality of life in rural areas.
              </p>
              
              <div className="flex flex-wrap items-center gap-8 pt-4">
                <div className="text-left">
                  <span className="block text-4xl md:text-5xl font-black text-[#ED1C24]">200K+</span>
                  <span className="text-sm font-bold text-slate-500 italic">People Benefited</span>
                </div>
                <Link
                  to="/donate"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#ED1C24] hover:bg-[#b0151b] font-extrabold text-white px-6 py-3 shadow-md transition-all active:scale-95"
                >
                  <Heart className="h-5 w-5 fill-white" /> Donate Now
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. PRIORITIES SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight uppercase">
              Our Priorities
            </h2>
            <p className="text-slate-500 font-bold">
              Our key focus areas for community development and support.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            
            <div className="space-y-3 group cursor-pointer">
              <div className="overflow-hidden rounded-2xl shadow-md border-2 border-transparent group-hover:border-[#fdd831] transition-all">
                <img src="/s.jpg" alt="Women Skill Development" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <h4 className="font-bold text-slate-800 text-lg">Women Skill Development</h4>
              <p className="text-sm font-extrabold text-[#ED1C24]">Silayi Prasikshan Yojana</p>
            </div>

            <div className="space-y-3 group cursor-pointer">
              <div className="overflow-hidden rounded-2xl shadow-md border-2 border-transparent group-hover:border-[#fdd831] transition-all">
                <img src="/h.jpg" alt="Healthcare Support" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <h4 className="font-bold text-slate-800 text-lg">Healthcare Support</h4>
              <p className="text-sm font-extrabold text-[#ED1C24]">Healthy People. Better World.</p>
            </div>

            <div className="space-y-3 group cursor-pointer">
              <div className="overflow-hidden rounded-2xl shadow-md border-2 border-transparent group-hover:border-[#fdd831] transition-all">
                <img src="/community.jpg" alt="Community Support" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <h4 className="font-bold text-slate-800 text-lg">Community Support</h4>
              <p className="text-sm font-extrabold text-[#ED1C24]">Welfare Schemes</p>
            </div>

            <div className="space-y-3 group cursor-pointer">
              <div className="overflow-hidden rounded-2xl shadow-md border-2 border-transparent group-hover:border-[#fdd831] transition-all">
                <img src="/l.jpg" alt="Sustainable Livelihood" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <h4 className="font-bold text-slate-800 text-lg">Sustainable Livelihood</h4>
              <p className="text-sm font-extrabold text-[#ED1C24]">Self-Employment Support</p>
            </div>

          </div>
        </div>
      </section>

      {/* 6. SPLIT BANNER SHOWCASE */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-stretch rounded-3xl overflow-hidden shadow-2xl bg-white">
            
            {/* Left Box (Branded Yellow Background) */}
            <div className="flex-1 bg-[#fdd831] p-8 md:p-16 flex flex-col justify-center space-y-6">
              <p className="text-sm font-extrabold uppercase tracking-wider text-[#ED1C24]">
                Empowering Women. Uplifting Communities
              </p>
              <h3 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
                <span className="text-[#ED1C24]">Aagaj Foundation</span> has transformed thousands of lives across rural Bihar.
              </h3>
              <p className="text-slate-800 font-semibold leading-relaxed">
                For years, Aagaj Foundation has been working at the grassroots level to support women, families, and underprivileged communities through skill development, healthcare initiatives, education support, and sustainable livelihood programmes.
              </p>

              {/* Counter details */}
              <div className="grid grid-cols-3 gap-4 border-t border-slate-900/10 pt-6">
                <div>
                  <span className="block text-2xl md:text-3xl font-black text-[#ED1C24]">18,000+</span>
                  <span className="text-xs font-bold text-slate-800">Trained via Silayi</span>
                </div>
                <div>
                  <span className="block text-2xl md:text-3xl font-black text-[#ED1C24]">25,000+</span>
                  <span className="text-xs font-bold text-slate-800">Health Cards Issued</span>
                </div>
                <div>
                  <span className="block text-2xl md:text-3xl font-black text-[#ED1C24]">12,000+</span>
                  <span className="text-xs font-bold text-slate-800">Welfare Beneficiaries</span>
                </div>
              </div>
            </div>

            {/* Right Box (Visual Storytelling Image Layout) */}
            <div className="hidden lg:flex flex-1 relative bg-slate-950 items-end min-h-[500px]">
              <img 
                src="/transform.jpeg" 
                alt="Empowering Story" 
                className="absolute inset-0 w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-black/20 to-transparent"></div>
              
              {/* Overlay Content */}
              <div className="relative p-12 text-white space-y-3 z-10">
                <p className="text-xs font-bold tracking-widest text-[#fdd831] uppercase">When women rise, families rise</p>
                <h4 className="text-2xl md:text-3xl font-black leading-tight">
                  Aagaj Foundation is bringing hope and opportunity to rural communities—one family at a time
                </h4>
              </div>

              {/* Center Floating Play Button */}
              <a 
                href="https://www.youtube.com/@aagajfoundation6622/featured" 
                target="_blank" 
                rel="noreferrer" 
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#ED1C24] shadow-xl text-white hover:scale-110 active:scale-95 transition-all z-20"
              >
                <Play className="h-8 w-8 fill-white stroke-none" />
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* 7. CAREER SHIELD */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight uppercase">
              Careers
            </h2>
            <div className="h-1.5 w-20 bg-[#fdd831] mx-auto rounded-full"></div>
            <p className="text-slate-500 font-bold">
              Join our mission and make a tangible difference in rural communities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            
            {/* Panchayat Coordinator */}
            <div className="bg-slate-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all text-center p-6 space-y-4">
              <img 
                src="/panch.jpeg" 
                alt="Panchayat Coordinator Job" 
                className="w-full h-56 object-cover rounded-xl shadow-inner"
              />
              <h3 className="text-2xl font-bold text-slate-800 mt-2">Panchayat Coordinator</h3>
              <p className="text-slate-500 text-sm font-semibold">
                Manage block and panchayat level training operations, beneficiary coordination, and data collection.
              </p>
              <Link 
                to="/careers/ngo-jobs" 
                className="inline-flex items-center gap-1.5 font-extrabold text-[#ED1C24] tracking-wide hover:text-[#b0151b] uppercase"
              >
                Apply Now <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Block Coordinator */}
            <div className="bg-slate-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all text-center p-6 space-y-4">
              <img 
                src="/block.jpeg" 
                alt="Block Coordinator Job" 
                className="w-full h-56 object-cover rounded-xl shadow-inner"
              />
              <h3 className="text-2xl font-bold text-slate-800 mt-2">Block Coordinator</h3>
              <p className="text-slate-500 text-sm font-semibold">
                Supervise multiple panchayats, coordinate resource flows, and liaison with district healthcare institutions.
              </p>
              <Link 
                to="/careers/ngo-jobs" 
                className="inline-flex items-center gap-1.5 font-extrabold text-[#ED1C24] tracking-wide hover:text-[#b0151b] uppercase"
              >
                Apply Now <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
