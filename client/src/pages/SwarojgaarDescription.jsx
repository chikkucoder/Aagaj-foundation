import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, CheckCircle2, Users, Coins, HelpCircle, UserCheck, PhoneCall, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';

const SwarojgaarDescription = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <SEO 
        title="Mahila Swarojgaar Yojana - Aagaj Foundation"
        description="Learn about Aagaj Foundation's Self-Help Groups (SHGs) under the Mahila Swarojgaar Yojana. We support micro-enterprise finance and local marketing for women in Bihar."
        canonicalUrl="https://www.aagajfoundation.com/schemes/swarojgaar"
        keywords="Mahila Swarojgaar Yojana, Self-Help Groups Bihar, women micro finance Patna, rural enterprises"
        ogTitle="Mahila Swarojgaar Yojana - Aagaj Foundation SHGs"
        ogDescription="Providing business training and group funding opportunities for village cooperatives."
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
                "name": "Mahila Swarojgaar Yojana",
                "item": "https://www.aagajfoundation.com/schemes/swarojgaar"
              }
            ]
          },
          {
            "@context": "https://schema.org",
            "@type": "Event",
            "name": "Mahila Swarojgaar SHG Workshop",
            "startDate": "2026-08-01T10:00:00+05:30",
            "endDate": "2026-12-31T17:00:00+05:30",
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
              "https://www.aagajfoundation.com/swarojgaar.png"
            ],
            "description": "Livelihood enterprise financial literacy workshop and Self-Help Group microfinance coordination camps.",
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
            महिला स्वरोजगार <span className="text-[#fdd831]">योजना</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-medium">
            कुशल एवं अनुभवी महिलाओं को संगठित कर समूह आधारित व्यावसायिक उपक्रम स्थापित करने की एक कल्याणकारी पहल।
          </p>
          <div className="pt-4">
            <Link
              to="/swarojgaar/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ED1C24] hover:bg-[#b0151b] font-black text-white px-8 py-4 shadow-lg hover:shadow-red-600/20 transition-all duration-300 transform active:scale-95 text-lg"
            >
              अनुबंध / रजिस्ट्रेशन (Register Group)
            </Link>
          </div>
        </div>
      </header>

      {/* 2. IMAGE PREVIEW BANNER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-200 aspect-[21/9] max-h-[420px]">
          <img
            src="/swarojgaar.png"
            alt="महिला स्वरोजगार योजना केंद्र"
            className="w-full h-full object-cover select-none"
            onError={(e) => {
              e.target.src = '/pic5.jpg';
            }}
          />
        </div>
      </div>

      {/* 3. CORE DETAILS GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Card 1: परिचय (Introduction) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border-b-4 border-[#ED1C24] space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-50 text-[#ED1C24] rounded-xl">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-black text-slate-800 Hindi-font">परिचय</h3>
            </div>
            <p className="text-slate-600 text-sm font-semibold leading-relaxed">
              यह योजना उन महिलाओं के लिए है जो पहले से सिलाई-कढ़ाई का कार्य जानती हैं और उद्यमी बनने की इच्छा रखती हैं।
            </p>
            <ul className="space-y-2 pt-2">
              {[
                'कुशल महिलाओं को मिलाकर व्यावसायिक आत्मनिर्भर समूह का गठन।',
                'कच्चा माल एवं सिलाई टूल्स संस्था द्वारा पूर्ण सहयोग से दिया जाएगा।',
                'नियमित रोजगार एवं सुनिश्चित आय प्राप्त करने का सुनहरा माध्यम।',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4.5 w-4.5 text-[#ED1C24] shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 2: समूह निर्माण (Group Formation) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border-b-4 border-[#fdd831] space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 text-amber-500 rounded-xl">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-black text-slate-800 Hindi-font">समूह निर्माण (Group)</h3>
            </div>
            <p className="text-slate-600 text-sm font-semibold leading-relaxed">
              समूह आधारित कार्य प्रणाली के माध्यम से महिलाएं अधिक उत्पादकता एवं सामूहिक सुरक्षा सुनिश्चित कर सकती हैं।
            </p>
            <ul className="space-y-2 pt-2">
              {[
                'प्रत्येक महिला स्वरोजगार समूह में अनिवार्य रूप से 10 सदस्य होंगे।',
                'समूह में एक अध्यक्ष, एक सचिव और एक कोषाध्यक्ष मनोनीत होंगे।',
                'सिलाई-कढ़ाई की न्यूनतम बुनियादी जानकारी सभी सदस्यों के लिए आवश्यक है।',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 3: योगदान एवं सामग्री (Support & Materials) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border-b-4 border-slate-700 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
                <Coins className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-black text-slate-800 Hindi-font">योगदान एवं सामग्री</h3>
            </div>
            <p className="text-slate-600 text-sm font-semibold leading-relaxed">
              व्यापार की निरंतरता और बेहतर गुणवत्ता बनाए रखने के लिए कच्चा माल और सिलाई टूल्स संस्था द्वारा प्रबंधित किया जाएगा।
            </p>
            <ul className="space-y-2 pt-2">
              {[
                'स्वरोजगार स्थापना हेतु सदस्य कुल ₹50,000 की शुरुआती पूंजी का प्रबंध स्वयं करेंगे।',
                'कपड़ा, गुणवत्तापूर्ण धागा एवं आवश्यक सामग्री पूर्ण रूप से संस्था प्रदान करेगी।',
                'बैंक लोन सुविधा (Financial Aid): आगाज़ फाउंडेशन के माध्यम से लोन प्राप्त करने में पूर्ण सहयोग।',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4.5 w-4.5 text-slate-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 4: मजदूरी एवं आय (Income Details) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border-b-4 border-[#ED1C24] space-y-4">
            <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-2 Hindi-font text-[#ED1C24]">मजदूरी एवं आय</h3>
            <p className="text-slate-600 text-sm font-medium">
              आय सीधे काम की मात्रा पर निर्भर करती है, जिससे कुशल कारीगरों को बेहतर प्रोत्साहन मिलता है।
            </p>
            <ul className="space-y-2">
              {[
                'सभी महिलाओं को "प्रति पीस" (piece rate) उत्पादन के आधार पर पारिश्रमिक।',
                'समूह द्वारा तैयार माल का त्वरित मूल्यांकन और तत्काल बैंक ट्रांसफर भुगतान।',
                'नियमित औद्योगिक ऑर्डर्स के माध्यम से वर्ष भर सुनिश्चित रोजगार।',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4.5 w-4.5 text-[#ED1C24] shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 5: बैंक लोन सुविधा (Bank Loans) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border-b-4 border-[#fdd831] space-y-4">
            <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-2 Hindi-font text-amber-500">बैंक लोन सुविधा</h3>
            <p className="text-slate-600 text-sm font-medium">
              पूंजी विस्तार और व्यवसाय में वृद्धि के लिए आगाज़ फाउंडेशन बैंकों और वित्तीय संस्थाओं से सहायता प्रदान करता है।
            </p>
            <ul className="space-y-2">
              {[
                'समूह के गठन के पश्चात वित्तीय संस्थानों के साथ त्वरित मैपिंग।',
                'बिना किसी जटिल कागजी कार्रवाई के ऋण की सुगम उपलब्धता।',
                'उद्यमी महिलाओं को आत्मनिर्भर बनाने हेतु संस्था का पूर्ण प्रशासनिक समर्थन।',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 6: आवश्यक दस्तावेज (Required Docs) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border-b-4 border-slate-700 space-y-4">
            <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-2 Hindi-font text-slate-700">आवश्यक दस्तावेज</h3>
            <p className="text-slate-600 text-sm font-medium">
              पंजीकरण एवं लोन संबंधी प्रक्रियाओं को पारदर्शी बनाने के लिए आवश्यक दस्तावेजों की सूची।
            </p>
            <ul className="space-y-2">
              {[
                'आवेदक: आधार कार्ड, पैन कार्ड, बैंक पासबुक।',
                'अतिरिक्त: जाति प्रमाण पत्र, आवासीय प्रमाण पत्र, पासपोर्ट साइज फोटो।',
                'गारंटर: कम से कम एक गारंटर का आधार कार्ड एवं पैन कार्ड कॉपी।',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4.5 w-4.5 text-slate-600 shrink-0 mt-0.5" />
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
                <p className="text-2xl font-black tracking-tight">18 वर्ष - 40 वर्ष</p>
                <p className="text-xs text-slate-400">न्यूनतम 18 वर्ष एवं अधिकतम 40 वर्ष तक की दक्ष सिलाई कारीगर पात्र हैं।</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-rose-400">
                  <PhoneCall className="h-5 w-5" />
                  <span className="font-extrabold uppercase text-sm tracking-wide text-[#ED1C24]">ऋण विभाग (Loan Dept.)</span>
                </div>
                <p className="text-2xl font-black tracking-tight">आगाज फाउंडेशन</p>
                <p className="text-xs text-slate-400">वित्तीय सहायता और लोन संबंधी अधिक जानकारी हेतु संपर्क सूत्र।</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 w-full md:w-auto text-center shrink-0">
            <Link
              to="/swarojgaar/register"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-[#fdd831] hover:bg-amber-400 font-black text-slate-900 px-8 py-5 shadow-lg active:scale-95 transition-all text-xl"
            >
              अनुबंध साइन करें <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SwarojgaarDescription;
