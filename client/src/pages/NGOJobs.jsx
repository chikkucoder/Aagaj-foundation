import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Tag, ArrowRight } from 'lucide-react';

const jobs = [
  { id: 'panchayat', title: 'Panchayat Co-ordinator', fee: 999, location: 'Kolkata / Village Operations' },
  { id: 'block', title: 'Block Co-ordinator', fee: 1499, location: 'Mumbai / Block Supervision' },
  { id: 'district', title: 'District Co-ordinator', fee: 2100, location: 'Mumbai / District HQ' },
  { id: 'health', title: 'Health Supervisor', fee: 1499, location: 'Bangalore / Field Work' },
  { id: 'mitra', title: 'Mahila Mitra', fee: 999, location: 'Rural Areas' },
  { id: 'trainer', title: 'Skill Trainer', fee: 'Contact Support', location: 'Vocational Centers' },
];

const NGOJobs = () => {
  const navigate = useNavigate();
  const [filterLoc, setFilterLoc] = useState('all');

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      
      {/* Intro Header */}
      <section className="py-16 bg-white text-center space-y-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight uppercase">
            Join The Aagaj Team
          </h1>
          <div className="h-1.5 w-32 bg-[#fdd831] mx-auto rounded-full"></div>
          <p className="max-w-2xl mx-auto text-slate-500 font-semibold leading-relaxed">
            Do you believe in every child’s right to a happier childhood and every woman’s right to self-employment? Then come join us to embark on a rewarding journey.
          </p>
        </div>
      </section>

      {/* List */}
      <section className="py-12 bg-amber-50/10 flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-black text-[#ED1C24] tracking-tight uppercase">Build Your Career At Aagaj</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-slate-400">Filter Location:</span>
              <select 
                value={filterLoc} 
                onChange={(e) => setFilterLoc(e.target.value)}
                className="bg-transparent text-sm font-bold text-[#ED1C24] cursor-pointer focus:outline-none border-b border-[#ED1C24]"
              >
                <option value="all">All Locations</option>
                <option value="bihar">Bihar</option>
                <option value="up">Uttar Pradesh</option>
                <option value="jharkhand">Jharkhand</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            {jobs.map((job) => (
              <div 
                key={job.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-rose-100 hover:translate-x-1 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-[#ED1C24] shrink-0 mt-1">
                    <Briefcase className="h-6 w-6 stroke-[2.5]" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-xl font-bold text-slate-800">{job.title}</h3>
                      <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-black text-slate-500">
                        <Tag className="h-3 w-3" /> Fee: {typeof job.fee === 'number' ? `₹${job.fee}` : job.fee}
                      </span>
                    </div>
                    <p className="flex items-center gap-1 text-sm font-semibold text-slate-400">
                      <MapPin className="h-4 w-4" /> {job.location}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/careers/apply?role=${encodeURIComponent(job.title)}&category=NGO&fee=${job.fee}`)}
                  className="mt-4 sm:mt-0 flex items-center justify-center gap-1 rounded-lg bg-[#fdd831] hover:bg-[#ED1C24] hover:text-white font-extrabold text-slate-800 px-6 py-2.5 shadow transition-all duration-300 w-full sm:w-auto"
                >
                  Apply Now <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
};

export default NGOJobs;
