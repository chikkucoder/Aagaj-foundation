import React from 'react';
import SEO from '../components/SEO';

const Privacy = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <SEO 
        title="Privacy Policy - Aagaj Foundation Trust"
        description="Read the Privacy Policy of Aagaj Foundation to understand how we collect, use, protect, and process user credentials and donation transactions."
        canonicalUrl="https://aagajfoundation.com/privacy"
        keywords="Aagaj Foundation privacy policy, NGO data security, privacy terms"
        ogTitle="Privacy Policy - Aagaj Foundation Trust"
        ogDescription="Commitment to protecting the personal data of our beneficiaries and donors."
        ogImage="https://aagajfoundation.com/logo.jpg"
        schema={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://aagajfoundation.com/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Privacy Policy",
              "item": "https://aagajfoundation.com/privacy"
            }
          ]
        }}
      />
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#0B2C66] to-[#1E4E9E] p-8 sm:p-12 text-white text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="mt-3 text-slate-200 text-sm max-w-xl mx-auto">
            Aagaj Foundation is committed to protecting your personal data. Learn how we collect, process, and protect your information.
          </p>
        </div>

        {/* Content */}
        <div className="p-8 sm:p-12 prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-6">
          <p className="text-slate-400 text-xs sm:text-sm font-semibold">
            Last Updated: August 7, 2026
          </p>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0B2C66] border-b pb-2 border-slate-100">1. Introduction</h2>
            <p>
              Welcome to <strong>Aagaj Foundation</strong> ("we", "our", or "us"). We operate under the registered trust title Aagaj Foundation (NGO Darpan ID: <strong>BR/2020/0260968</strong>). We respect your privacy and are committed to protecting the personally identifiable information you may provide us through our website and dynamic portals.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0B2C66] border-b pb-2 border-slate-100">2. Information We Collect</h2>
            <p>We collect information to provide better services to our beneficiaries, donors, and employees. This includes:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Personal details</strong>: Name, Date of Birth, Aadhaar Number, and Gender provided during membership, health card creation, or scheme registration.</li>
              <li><strong>Contact info</strong>: Email Address, Mobile Number, WhatsApp Number, and Mailing Address.</li>
              <li><strong>Payment details</strong>: Transaction IDs and amounts processed securely via our payments gateway (Razorpay) for donations and program applications.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0B2C66] border-b pb-2 border-slate-100">3. How We Use Your Information</h2>
            <p>The information we collect is used in the following ways:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>To issue digital Health Cards, Partnership Certificates, and coordinator IDs.</li>
              <li>To process donations, issue 80G tax exemption receipts, and verify transactions.</li>
              <li>To update beneficiaries about ongoing training events under Mahila Silayi Prasikshan Yojana and Mahila Swarojgaar Yojana.</li>
              <li>To maintain audit and security logs to verify admin actions and prevent fraud.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0B2C66] border-b pb-2 border-slate-100">4. Security of Data</h2>
            <p>
              The security of your personal data is critical to us. We implement robust JWT token authentication, secure SSL encryption, and encrypt database connections to protect user records. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0B2C66] border-b pb-2 border-slate-100">5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact our support desk:
            </p>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mt-2 text-xs sm:text-sm">
              <p><strong>Aagaj Foundation Office</strong></p>
              <p>Address: Paliganj, Patna, Bihar, India - 801110</p>
              <p>Email: <a href="mailto:aagajfoundationpaliganj@gmail.com" className="text-[#ED1C24] hover:underline font-semibold">aagajfoundationpaliganj@gmail.com</a></p>
              <p>Mobile/WhatsApp: <span className="font-semibold text-slate-800">+91-9431430464</span></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
