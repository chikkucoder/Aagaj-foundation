import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Tag, ArrowRight } from 'lucide-react';

const GeneralJobs = () => {
  const navigate = useNavigate();
  const [filterLoc, setFilterLoc] = useState('all');

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      
      {/* Header */}
      <section className="py-16 bg-white text-center space-y-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight uppercase">
            Join The Aagaj Team
          </h1>
          <div className="h-1.5 w-32 bg-[#fdd831] mx-auto rounded-full"></div>
          <p className="max-w-2xl mx-auto text-slate-500 font-semibold leading-relaxed">
            Discover opportunities that align with your capabilities and enable professional growth while serving communities.
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-rose-100 hover:translate-x-1 transition-all">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-[#ED1C24] shrink-0 mt-1">
                  <Briefcase className="h-6 w-6 stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-xl font-bold text-slate-800">Apply for Job (General Staff)</h3>
                    <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-black text-slate-500">
                      <Tag className="h-3 w-3" /> Fee: ₹499
                    </span>
                  </div>
                  <p className="flex items-center gap-1 text-sm font-semibold text-slate-400">
                    <MapPin className="h-4 w-4" /> Across All Regions
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/careers/apply?role=Normal%20Job&category=Normal&fee=499')}
                className="mt-4 sm:mt-0 flex items-center justify-center gap-1 rounded-lg bg-[#fdd831] hover:bg-[#ED1C24] hover:text-white font-extrabold text-slate-800 px-6 py-2.5 shadow transition-all duration-300 w-full sm:w-auto"
              >
                Apply Now <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

export default GeneralJobs;
