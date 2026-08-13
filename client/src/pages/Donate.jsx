import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createDonationOrder, verifyDonationPayment } from '../api/paymentApi';
import { Heart, Landmark, ShieldCheck, HeartHandshake, Loader2, ArrowLeft } from 'lucide-react';
import SEO from '../components/SEO';

const presetAmounts = [500, 1000, 2000, 5000, 10000];

const Donate = () => {
  const navigate = useNavigate();
  const [donationType, setDonationType] = useState('One Time');
  const [selectedAmount, setSelectedAmount] = useState(500);
  const [isPincodeFetching, setIsPincodeFetching] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      amount: 500,
      fullName: '',
      email: '',
      mobile: '',
      dob: '',
      address: '',
      pincode: '',
      city: '',
      state: '',
      pan: '',
      citizenCheck: false,
    }
  });

  const watchAmount = watch('amount');
  const watchPincode = watch('pincode');

  // Sync custom input changes with selected presets
  useEffect(() => {
    const numAmt = Number(watchAmount);
    if (presetAmounts.includes(numAmt)) {
      setSelectedAmount(numAmt);
    } else {
      setSelectedAmount('custom');
    }
  }, [watchAmount]);

  // Pincode auto-fill API integration
  useEffect(() => {
    const fetchPincodeDetails = async () => {
      if (watchPincode && watchPincode.length === 6) {
        setIsPincodeFetching(true);
        setValue('city', '');
        setValue('state', '');
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${watchPincode}`);
          const data = await res.json();
          if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice?.length > 0) {
            setValue('city', data[0].PostOffice[0].District);
            setValue('state', data[0].PostOffice[0].State);
          } else {
            alert('Invalid Pincode or no data found.');
          }
        } catch (error) {
          console.error('Pincode fetch error:', error);
        } finally {
          setIsPincodeFetching(false);
        }
      }
    };
    fetchPincodeDetails();
  }, [watchPincode, setValue]);

  const handleSelectAmount = (amt) => {
    if (amt === 'custom') {
      setSelectedAmount('custom');
      setValue('amount', '');
    } else {
      setSelectedAmount(amt);
      setValue('amount', amt);
    }
  };

  const onSubmitDonation = async (data) => {
    const amountVal = Number(data.amount);
    if (!amountVal || amountVal < 1) {
      alert('Please enter a valid donation amount.');
      return;
    }

    const payBtn = document.getElementById('donationPayBtn');
    const originalText = payBtn.innerHTML;
    payBtn.disabled = true;
    payBtn.innerHTML = '<span class="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span> Initiating Payment...';

    const donorData = {
      name: data.fullName,
      email: data.email,
      phone: data.mobile,
      address: data.address,
      pan: data.pan,
      state: data.state,
      city: data.city,
      pincode: data.pincode
    };

    try {
      const order = await createDonationOrder({
        amount: amountVal,
        donorData
      });

      if (order && order.success) {
        const options = {
          key: order.key,
          amount: order.amount,
          currency: order.currency,
          order_id: order.orderId,
          name: 'Aagaj Foundation',
          description: 'Donation Contribution',
          prefill: {
            name: donorData.name,
            email: donorData.email,
            contact: donorData.phone
          },
          theme: {
            color: '#ED1C24'
          },
          handler: async function (response) {
            try {
              const verifyResult = await verifyDonationPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: order.amount,
                donorData
              });

              if (verifyResult.success) {
                navigate(`/donate/success?paymentId=${response.razorpay_payment_id}`);
              } else {
                navigate('/donate/failed');
              }
            } catch (err) {
              navigate('/donate/failed');
            }
          },
          modal: {
            ondismiss: function () {
              payBtn.innerHTML = originalText;
              payBtn.disabled = false;
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        throw new Error(order.message || 'Order generation failed.');
      }
    } catch (error) {
      alert('Error creating payment order: ' + error.message);
      payBtn.innerHTML = originalText;
      payBtn.disabled = false;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <SEO 
        title="Donate Online - Support Aagaj Foundation Trust"
        description="Support women tailoring centers, health card distribution, and child education by donating online. We accept Razorpay and provide 80G tax exemption receipts."
        canonicalUrl="https://aagajfoundation.com/donate"
        keywords="Donate NGO Patna, online trust donation, tax exemption 80G trust Bihar, women support funds"
        ogTitle="Donate to Aagaj Foundation - Change a Life Today"
        ogDescription="Help rural families in Bihar by supporting tailoring machines and medicine camps."
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
              "name": "Donate Us",
              "item": "https://aagajfoundation.com/donate"
            }
          ]
        }}
      />
      
      {/* Visual Header Banner */}
      <section className="relative py-20 bg-slate-900 text-white text-center">
        <div 
          className="absolute inset-0 bg-[url('/pic1.jpeg')] bg-cover bg-center opacity-30 select-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-slate-900"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full text-xs font-bold transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase leading-none">
            Make a Difference Today
          </h1>
          <p className="max-w-xl mx-auto text-slate-300 font-bold text-base md:text-lg">
            Your generous contribution can change a family's life forever.
          </p>
        </div>
      </section>

      {/* Main content grid */}
      <section className="py-16 flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left box: Why Donate benefits */}
            <div className="lg:col-span-4 bg-[#fdd831] rounded-3xl p-8 space-y-6 shadow-md border-b-8 border-[#ED1C24] lg:sticky lg:top-28">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Why Donate?</h3>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Landmark className="h-6 w-6 text-[#ED1C24] shrink-0 mt-0.5" />
                  <p className="text-slate-800 text-sm font-semibold">
                    <strong>Tax Benefits:</strong> Get 50% tax exemption u/s 80G under Income Tax Act.
                  </p>
                </div>
                <div className="flex gap-3">
                  <ShieldCheck className="h-6 w-6 text-[#ED1C24] shrink-0 mt-0.5" />
                  <p className="text-slate-800 text-sm font-semibold">
                    <strong>Transparency:</strong> Audit logs and payment tracking are strictly recorded.
                  </p>
                </div>
                <div className="flex gap-3">
                  <HeartHandshake className="h-6 w-6 text-[#ED1C24] shrink-0 mt-0.5" />
                  <p className="text-slate-800 text-sm font-semibold">
                    <strong>Real Impact:</strong> Funds directly facilitate sewing machines and health checks.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white/60 rounded-xl border border-dashed border-[#ED1C24] space-y-1">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block">Tax Exemption (80G) No:</span>
                <span className="block font-bold font-mono text-base text-slate-900 tracking-wide">AAGAJ/80G/2026/XXXX</span>
              </div>
            </div>

            {/* Right box: Form */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-rose-100 space-y-8">
              
              {/* Part 1: Amounts */}
              <div className="space-y-4 text-left">
                <h4 className="text-xs font-black uppercase text-[#ED1C24] tracking-widest border-b border-rose-100 pb-2">
                  1. Choose Donation Amount
                </h4>

                {/* Donation Type Toggles */}
                <div className="grid grid-cols-2 gap-4 max-w-sm">
                  <button
                    type="button"
                    onClick={() => setDonationType('One Time')}
                    className={`py-2.5 rounded-full font-bold text-sm border-2 transition-all ${donationType === 'One Time' ? 'bg-[#ED1C24] border-[#ED1C24] text-white shadow-md' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                  >
                    One Time
                  </button>
                  <button
                    type="button"
                    onClick={() => setDonationType('Monthly')}
                    className={`py-2.5 rounded-full font-bold text-sm border-2 transition-all ${donationType === 'Monthly' ? 'bg-[#ED1C24] border-[#ED1C24] text-white shadow-md' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                  >
                    Monthly
                  </button>
                </div>

                {/* Preset Box Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {presetAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleSelectAmount(amt)}
                      className={`py-3 rounded-xl font-black text-sm border-2 text-center transition-all ${selectedAmount === amt ? 'bg-red-50 border-[#ED1C24] text-[#ED1C24]' : 'bg-white border-slate-200 text-slate-700 hover:border-[#fdd831]'}`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleSelectAmount('custom')}
                    className={`py-3 rounded-xl font-black text-sm border-2 text-center transition-all ${selectedAmount === 'custom' ? 'bg-red-50 border-[#ED1C24] text-[#ED1C24]' : 'bg-white border-slate-200 text-slate-700 hover:border-[#fdd831]'}`}
                  >
                    Custom
                  </button>
                </div>

                {/* Custom Amount Input */}
                <div className="relative rounded-xl border border-slate-300 overflow-hidden max-w-sm flex items-center bg-slate-50 font-bold">
                  <span className="px-4 text-slate-500 text-lg">₹</span>
                  <input
                    type="number"
                    className="w-full bg-white py-3.5 px-2 text-slate-800 text-base focus:outline-none"
                    placeholder="Enter Donation Amount"
                    min="1"
                    {...register('amount', { required: 'Donation amount is required', min: 1 })}
                  />
                </div>
                {errors.amount && <p className="text-red-500 text-xs font-bold">{errors.amount.message}</p>}
              </div>

              {/* Part 2: Donor details */}
              <div className="space-y-4 text-left pt-6 border-t border-rose-100">
                <h4 className="text-xs font-black uppercase text-[#ED1C24] tracking-widest border-b border-rose-100 pb-2">
                  2. Enter Your Details
                </h4>

                <form onSubmit={handleSubmit(onSubmitDonation)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Full Name *</label>
                      <input
                        type="text"
                        className={`w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none ${errors.fullName ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-[#ED1C24]'}`}
                        placeholder="Ex: Rahul Kumar"
                        {...register('fullName', { required: 'Name is required' })}
                      />
                      {errors.fullName && <p className="text-red-500 text-xs font-bold">{errors.fullName.message}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Email Address *</label>
                      <input
                        type="email"
                        className={`w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none ${errors.email ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-[#ED1C24]'}`}
                        placeholder="Ex: rahul@email.com"
                        {...register('email', { required: 'Email ID is required' })}
                      />
                      {errors.email && <p className="text-red-500 text-xs font-bold">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Phone Number *</label>
                      <input
                        type="tel"
                        maxLength={10}
                        className={`w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none ${errors.mobile ? 'border-red-400 focus:border-red-400' : 'border-slate-200 focus:border-[#ED1C24]'}`}
                        placeholder="10 digit mobile number"
                        {...register('mobile', {
                          required: 'Phone is required',
                          pattern: { value: /^[6-9]\d{9}$/, message: 'Must be a 10 digit number starting with 6-9' }
                        })}
                      />
                      {errors.mobile && <p className="text-red-500 text-xs font-bold">{errors.mobile.message}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Date of Birth</label>
                      <input
                        type="date"
                        className="w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none border-slate-200 focus:border-[#ED1C24]"
                        {...register('dob')}
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Address *</label>
                      <input
                        type="text"
                        className={`w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none ${errors.address ? 'border-red-400' : 'border-slate-200 focus:border-[#ED1C24]'}`}
                        placeholder="Residential Address"
                        {...register('address', { required: 'Address is required' })}
                      />
                      {errors.address && <p className="text-red-500 text-xs font-bold">{errors.address.message}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                        Pincode {isPincodeFetching && <Loader2 className="h-4 w-4 animate-spin text-[#ED1C24]" />}
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        className={`w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none ${errors.pincode ? 'border-red-400' : 'border-slate-200 focus:border-[#ED1C24]'}`}
                        placeholder="Pin Code"
                        {...register('pincode', { required: 'Pincode is required', pattern: /^\d{6}$/ })}
                      />
                      {errors.pincode && <p className="text-red-500 text-xs font-bold">{errors.pincode.message}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">City</label>
                      <input type="text" readOnly className="w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none border-slate-100 bg-slate-50/50" {...register('city')} />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">State</label>
                      <input type="text" readOnly className="w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none border-slate-100 bg-slate-50/50" {...register('state')} />
                    </div>

                    <div className="space-y-1 md:col-span-3">
                      <label className="text-xs font-bold text-slate-500 uppercase">PAN Number</label>
                      <input
                        type="text"
                        maxLength={10}
                        className={`w-full border-b-2 py-2 text-slate-800 text-sm font-bold focus:outline-none uppercase ${errors.pan ? 'border-red-400' : 'border-slate-200 focus:border-[#ED1C24]'}`}
                        placeholder="ABCDE1234F"
                        {...register('pan', {
                          pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Invalid PAN card format' }
                        })}
                      />
                      {errors.pan && <p className="text-red-500 text-xs font-bold">{errors.pan.message}</p>}
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 pt-2">
                    <input
                      type="checkbox"
                      id="citizenCheck"
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-[#ED1C24] focus:ring-[#ED1C24] cursor-pointer"
                      {...register('citizenCheck', { required: 'You must declare your citizenship' })}
                    />
                    <label htmlFor="citizenCheck" className="text-xs font-bold text-slate-500 cursor-pointer">
                      I hereby declare that I am a citizen of India and all details entered above are true.
                    </label>
                  </div>
                  {errors.citizenCheck && <p className="text-red-500 text-xs font-bold">{errors.citizenCheck.message}</p>}

                  <button
                    type="submit"
                    id="donationPayBtn"
                    className="w-full rounded-full bg-[#ED1C24] hover:bg-[#b0151b] py-4 text-base font-black text-white shadow-lg active:scale-98 transition-all uppercase"
                  >
                    Pay ₹{watchAmount || 0} Securely
                  </button>
                </form>
              </div>

            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Donate;
