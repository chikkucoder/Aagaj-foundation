import React from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Phone, MapPin, Send, HelpCircle } from 'lucide-react';
import SEO from '../components/SEO';

const Contact = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = (data) => {
    console.log('Contact form data:', data);
    alert('Thank you for contacting Aagaj Foundation! Our trust support team will get back to you shortly.');
    reset();
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <SEO 
        title="Contact Us - Aagaj Foundation Trust Offices"
        description="Get in touch with Aagaj Foundation. Find office phone numbers, email addresses, office locations, and submit support forms for NGO schemes in Bihar."
        canonicalUrl="https://www.aagajfoundation.com/contact"
        keywords="Aagaj Foundation office phone, Patna NGO contact email, Paliganj trust helpline"
        ogTitle="Contact Us - Aagaj Foundation Helpdesk"
        ogDescription="Connect with us for partnerships, donations, or registrations under women schemes."
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
              "name": "Contact Us",
              "item": "https://www.aagajfoundation.com/contact"
            }
          ]
        }}
      />
      
      {/* Header */}
      <section className="relative py-16 bg-slate-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-rose-950 opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase">Contact Us</h1>
          <p className="max-w-xl mx-auto text-slate-300 font-semibold text-base">
            Reach out to our trust office for scheme registrations, health partner partnerships, or general queries.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            
            {/* Left side details */}
            <div className="lg:col-span-5 bg-slate-900 text-white rounded-3xl p-8 md:p-12 flex flex-col justify-between space-y-8 shadow-md border-b-8 border-[#fdd831]">
              <div className="space-y-6">
                <h2 className="text-2xl font-black uppercase tracking-wide">Trust Office Info</h2>
                <p className="text-slate-400 font-semibold leading-relaxed">
                  Feel free to contact us via email, phone, or by visiting our trust headquarters. Our office is open Monday to Saturday from 9:30 AM to 6:00 PM.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-[#fdd831]">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-200">Address</h4>
                    <p className="text-slate-400 text-sm font-semibold">Bhupatipur Road, Near Krishi Anusandhan Kendra, Patna - 800020, Bihar</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-[#fdd831]">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-200">Phone</h4>
                    <p className="text-slate-400 text-sm font-semibold">+91 9431430464</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-[#fdd831]">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-200">Email Address</h4>
                    <a href="mailto:info@aagajfoundation.in" className="text-slate-400 hover:text-[#fdd831] text-sm font-semibold underline">
                      info@aagajfoundation.in
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800 text-xs text-slate-500 font-bold">
                Aagaj Foundation is registered under Indian Trust Act 1882.
              </div>
            </div>

            {/* Right side form */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-8 md:p-12 shadow-md border border-rose-100 flex flex-col justify-center">
              <div className="space-y-2 mb-8">
                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                  <HelpCircle className="h-6 w-6 text-[#ED1C24]" /> Ask a Question
                </h3>
                <p className="text-slate-500 font-bold">Fill out this quick form and our support executive will respond to you.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Full Name</label>
                    <input
                      type="text"
                      className={`w-full rounded-xl border px-4 py-3 text-slate-800 text-sm font-semibold focus:outline-none ${errors.fullName ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:border-[#ED1C24]'}`}
                      placeholder="Enter Full Name"
                      {...register('fullName', { required: 'Name is required' })}
                    />
                    {errors.fullName && <p className="text-red-500 text-xs font-bold">{errors.fullName.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Mobile Number</label>
                    <input
                      type="tel"
                      className={`w-full rounded-xl border px-4 py-3 text-slate-800 text-sm font-semibold focus:outline-none ${errors.mobile ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:border-[#ED1C24]'}`}
                      placeholder="10-digit Mobile"
                      {...register('mobile', {
                        required: 'Mobile is required',
                        pattern: { value: /^\d{10}$/, message: 'Must be exactly 10 digits' }
                      })}
                    />
                    {errors.mobile && <p className="text-red-500 text-xs font-bold">{errors.mobile.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Email Address</label>
                  <input
                    type="email"
                    className={`w-full rounded-xl border px-4 py-3 text-slate-800 text-sm font-semibold focus:outline-none ${errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:border-[#ED1C24]'}`}
                    placeholder="name@example.com"
                    {...register('email', { required: 'Email is required' })}
                  />
                  {errors.email && <p className="text-red-500 text-xs font-bold">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-500 tracking-wider">Message Description</label>
                  <textarea
                    rows={4}
                    className={`w-full rounded-xl border px-4 py-3 text-slate-800 text-sm font-semibold focus:outline-none ${errors.message ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:border-[#ED1C24]'}`}
                    placeholder="Tell us what you want to inquire about..."
                    {...register('message', { required: 'Message cannot be empty' })}
                  />
                  {errors.message && <p className="text-red-500 text-xs font-bold">{errors.message.message}</p>}
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ED1C24] hover:bg-[#b0151b] py-3 text-sm font-extrabold text-white transition-all shadow-md active:scale-98"
                >
                  <Send className="h-4 w-4" /> Send Message
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Contact;
