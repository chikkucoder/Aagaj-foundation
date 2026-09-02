import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, CheckCircle2, Target, Calendar, UserCheck, ShieldCheck, PhoneCall } from 'lucide-react';
import SEO from '../components/SEO';

const SilayiYojnaDescription = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <SEO 
        title="Mahila Silayi Prasikshan Yojana - Aagaj Foundation"
        description="Learn about our flagship sewing and apparel tailoring training scheme for women in Bihar. Apply for registration online to learn and get certificates."
        canonicalUrl="https://www.aagajfoundation.com/schemes/silayi"
        keywords="Mahila Silayi Yojana, sewing training NGO Bihar, women tailoring classes Patna"
        ogTitle="Mahila Silayi Prasikshan Yojana - Aagaj Foundation"
        ogDescription="Free and subsidized tailoring classes and start-up toolkit distribution."
        ogImage="https://www.aagajfoundation.com/logo.jpg"
        schema={[
          {
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
                "name": "Mahila Silayi Yojana",
                "item": "https://www.aagajfoundation.com/schemes/silayi"
              }
            ]
          },
          {
            "@context": "https://schema.org",
            "@type": "Event",
            "name": "Mahila Silayi Prasikshan Training Camp",
            "startDate": "2026-08-01T09:00:00+05:30",
            "endDate": "2026-12-31T18:00:00+05:30",
            "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
            "eventStatus": "https://schema.org/EventScheduled",
            "location": {
              "@type": "Place",
              "name": "Aagaj Training Center",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Bhupatipur Road, Near Krishi Anusandhan Kendra",
                "addressLocality": "Patna",
                "addressRegion": "Bihar",
                "postalCode": "800020",
                "addressCountry": "IN"
              }
            },
            "image": [
              "https://www.aagajfoundation.com/silai.jpeg"
            ],
            "description": "Subsidized vocational tailoring training program for rural women to enable financial self-reliance.",
            "organizer": {
              "@type": "Organization",
              "name": "Aagaj Foundation",
              "url": "https://www.aagajfoundation.com"
            }
          }
        ]}
      />
      {/* 1. HERO HEADER */}
      <header className="relative py-20 bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(237,28,36,0.15),transparent)]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-[#ED1C24] font-bold text-xs uppercase tracking-wider">
            <Sparkles className="h-4 w-4 animate-pulse" /> आगाज फाउंडेशन द्वारा संचालित
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight Hindi-font">
            महिला सिलाई <span className="text-[#fdd831]">प्रशिक्षण योजना</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-medium">
            ग्रामीण एवं अर्ध-शहरी महिलाओं को सशक्त, स्वावलंबी एवं आर्थिक रूप से आत्मनिर्भर बनाने का एक अभिनव प्रयास।
          </p>
          <div className="pt-4">
            <Link
              to="/silayi/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ED1C24] hover:bg-[#b0151b] font-black text-white px-8 py-4 shadow-lg hover:shadow-red-600/20 transition-all duration-300 transform active:scale-95 text-lg"
            >
              अभी पंजीकरण करें (Register Now)
            </Link>
          </div>
        </div>
      </header>

      {/* 2. IMAGE PREVIEW BANNER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-200 aspect-[21/9] max-h-[420px]">
          <img
            src="/silai.jpeg"
            alt="महिला सिलाई प्रशिक्षण क्लास"
            className="w-full h-full object-cover select-none"
            onError={(e) => {
              e.target.src = '/pic2.jpg';
            }}
          />
        </div>
      </div>

      {/* 3. CORE BENEFITS & DETAILS GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Card 1: परिचय (Introduction) */}
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border-l-8 border-[#ED1C24] space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-50 text-[#ED1C24] rounded-xl">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 Hindi-font">परिचय</h3>
            </div>
            <p className="text-slate-600 font-semibold leading-relaxed">
              यह योजना विशेष रूप से सिलाई सीखने की इच्छुक युवा लड़कियों और महिलाओं के लिए डिज़ाइन की गई है। इसके अंतर्गत आगाज़ फाउंडेशन आधुनिक तकनीकों के साथ व्यावसायिक सिलाई प्रशिक्षण प्रदान करता है।
            </p>
            <ul className="space-y-3.5 pt-2">
              {[
                'यह योजना सिलाई सीखने की इच्छुक लड़कियों और महिलाओं के लिए है।',
                'प्रशिक्षण आगाज फाउंडेशन के अनुभवी ट्रेनर्स द्वारा दिया जाएगा।',
                'प्रशिक्षण के उपरांत स्वरोजगार एवं सामूहिक रोजगार के सुनहरे अवसर।',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#ED1C24] shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 2: योजना का उद्देश्य (Objectives) */}
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border-l-8 border-[#fdd831] space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 Hindi-font">योजना का उद्देश्य</h3>
            </div>
            <p className="text-slate-600 font-semibold leading-relaxed">
              महिलाओं में कौशल विकास कर उन्हें आत्मनिर्भर समाज की मुख्यधारा से जोड़ना और उनके लिए नियमित आय के साधन सृजित करना इस योजना का मुख्य ध्येय है।
            </p>
            <ul className="space-y-3.5 pt-2">
              {[
                'महिलाओं और लड़कियों को व्यावहारिक सिलाई का प्रशिक्षण देना।',
                'प्रशिक्षण के बाद ब्लॉक एवं पंचायत स्तर पर रोजगार के अवसर उपलब्ध कराना।',
                'महिलाओं को स्वावलंबी और आर्थिक रूप से सशक्त बनाना।',
                'समूह आधारित काम के माध्यम से नियमित मासिक आय सुनिश्चित करना।',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 3: प्रशिक्षण का क्रियान्वयन (Execution) */}
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border-l-8 border-slate-700 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 Hindi-font">प्रशिक्षण का क्रियान्वयन</h3>
            </div>
            <p className="text-slate-600 font-semibold leading-relaxed">
              प्रशिक्षण कार्यक्रम को एक व्यवस्थित एवं परिणाम-उन्मुख समय-सीमा के भीतर संचालित किया जाता है ताकि प्रत्येक प्रतिभागी पूर्ण दक्षता प्राप्त कर सके।
            </p>
            <ul className="space-y-3.5 pt-2">
              {[
                'प्रत्येक वार्ड/पंचायत स्तर पर ३० महिलाओं का सक्रिय समूह बनाया जाएगा।',
                'सभी नामांकित प्रतिभागियों को मात्र ₹799 का पंजीकरण शुल्क देय होगा।',
                'सघन व्यावहारिक प्रशिक्षण अवधि: कुल 45 दिन।',
                'दैनिक व्यावहारिक अभ्यास के साथ-साथ थ्योरी एवं डिजाइनिंग की जानकारी।',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#ED1C24] shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 4: प्रशिक्षण के लाभ (Benefits) */}
          <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border-l-8 border-[#ED1C24] space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-50 text-[#ED1C24] rounded-xl">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 Hindi-font">प्रशिक्षण के लाभ</h3>
            </div>
            <p className="text-slate-600 font-semibold leading-relaxed">
              इस प्रशिक्षण के माध्यम से महिलाओं को न केवल सिलाई का ज्ञान प्राप्त होता है बल्कि उनके करियर को आगे बढ़ाने के लिए संस्था की ओर से निरंतर सहयोग मिलता है।
            </p>
            <ul className="space-y-3.5 pt-2">
              {[
                '45 दिनों का व्यापक व्यावहारिक सिलाई एवं डिजाइनिंग प्रशिक्षण।',
                'सफलतापूर्वक प्रशिक्षण पूर्ण होने पर प्रमाण पत्र (Certificate)।',
                'प्रशिक्षण प्राप्त कुशल महिलाओं को आगाज़ सिलाई समूहों में तत्काल रोजगार।',
                'भविष्य में स्वयं के बुटीक अथवा सिलाई केंद्र हेतु वित्तीय एवं तकनीकी मार्गदर्शन।',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#fdd831] shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* 4. HIGHLIGHT SUMMARY BANNER */}
        <div className="mt-16 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-10 md:p-14 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(253,216,49,0.1),transparent)]"></div>
          <div className="space-y-6 max-w-2xl relative z-10">
            <div className="inline-block px-4 py-1 rounded-md bg-[#fdd831]/10 text-[#fdd831] font-bold text-sm tracking-wide">
              नियम एवं पात्रता
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[#fdd831]">
                  <UserCheck className="h-5 w-5" />
                  <span className="font-extrabold uppercase text-sm tracking-wide text-amber-400">आयु सीमा (Age Limit)</span>
                </div>
                <p className="text-2xl font-black tracking-tight">15 वर्ष - 40 वर्ष</p>
                <p className="text-xs text-slate-400">न्यूनतम 15 वर्ष एवं अधिकतम 40 वर्ष तक की महिलाएं पात्र हैं।</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-rose-400">
                  <PhoneCall className="h-5 w-5" />
                  <span className="font-extrabold uppercase text-sm tracking-wide text-[#ED1C24]">महिला उत्थान केंद्र</span>
                </div>
                <p className="text-2xl font-black tracking-tight">आगाज फाउंडेशन</p>
                <p className="text-xs text-slate-400">विशेष जानकारी के लिए अपने नजदीकी ब्लॉक को-ऑर्डिनेटर से संपर्क करें।</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 w-full md:w-auto text-center shrink-0">
            <Link
              to="/apply"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-[#fdd831] hover:bg-amber-400 font-black text-slate-900 px-8 py-5 shadow-lg active:scale-95 transition-all text-xl"
            >
              रजिस्ट्रेशन करें (Register)
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SilayiYojnaDescription;
