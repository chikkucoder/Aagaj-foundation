import React from 'react';
import SEO from '../components/SEO';

const Terms = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <SEO 
        title="Terms of Service - Aagaj Foundation Trust"
        description="Review the Terms of Service for Aagaj Foundation, covering registrations, health cards, refund policies, and user account rules."
        canonicalUrl="https://www.aagajfoundation.com/terms"
        keywords="Aagaj Foundation terms of service, NGO website terms, donation policies"
        ogTitle="Terms of Service - Aagaj Foundation Trust"
        ogDescription="Read the terms of use governing our website services and portals."
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
              "name": "Terms of Service",
              "item": "https://www.aagajfoundation.com/terms"
            }
          ]
        }}
      />
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#0B2C66] to-[#1E4E9E] p-8 sm:p-12 text-white text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Terms of Service</h1>
          <p className="mt-3 text-slate-200 text-sm max-w-xl mx-auto">
            Please read these terms and conditions carefully before using our digital services, portals, and registration systems.
          </p>
        </div>

        {/* Content */}
        <div className="p-8 sm:p-12 prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-6">
          <p className="text-slate-400 text-xs sm:text-sm font-semibold">
            Last Updated: August 7, 2026
          </p>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0B2C66] border-b pb-2 border-slate-100">1. Acceptance of Terms</h2>
            <p>
              By accessing and using the website of <strong>Aagaj Foundation</strong> (located at <a href="https://www.aagajfoundation.com" className="text-[#ED1C24] hover:underline font-semibold">https://www.aagajfoundation.com</a>), you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0B2C66] border-b pb-2 border-slate-100">2. Description of Trust Services</h2>
            <p>
              Aagaj Foundation is a registered public charitable trust dedicated to women empowerment, healthcare distribution, and livelihood training in Bihar. Our digital portal allows users to apply for coordinator roles, register for training under the Mahila Silayi Yojana, request dynamic health cards under the Swasthya Suraksha Yojana, register for memberships, and make charitable donations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0B2C66] border-b pb-2 border-slate-100">3. User Registrations & Accounts</h2>
            <p>When you register on our portal, you agree to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide accurate, current, and complete details during applications.</li>
              <li>Maintain the confidentiality of your credentials (employee/coordinator passwords).</li>
              <li>Accept responsibility for all activities that occur under your user session.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0B2C66] border-b pb-2 border-slate-100">4. Donation & Payment Refund Policy</h2>
            <p>
              All online donations made to Aagaj Foundation are voluntary. We provide 80G tax benefits to qualified Indian donors. Registration application fees processed for certificates or card issuances are utilized for operating administrative overheads. Generally, donations and application fees are non-refundable. If you suspect an unauthorized transaction, please reach out to us within 7 days.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0B2C66] border-b pb-2 border-slate-100">5. Limitation of Liability</h2>
            <p>
              In no event shall Aagaj Foundation, its trustees, or its employees be held liable for any damages arising out of your use of our site. Partner hospitals, blood banks, or labs are independent entities; services rendered by partner medical centers are subject to their respective terms and medical standards.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0B2C66] border-b pb-2 border-slate-100">6. Governing Law</h2>
            <p>
              These Terms of Service shall be governed by and construed in accordance with the laws of the State of Bihar, India, without regard to conflict of law principles. Any legal dispute shall be subject to the exclusive jurisdiction of the courts located in Patna, Bihar.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
