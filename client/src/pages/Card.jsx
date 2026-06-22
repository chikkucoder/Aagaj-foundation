import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas-pro';
import { ArrowLeft, Download, ShieldAlert } from 'lucide-react';

const Card = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const name = searchParams.get('name') || '';
  const mobile = searchParams.get('mobile') || 'N/A';
  const email = searchParams.get('email') || 'N/A';
  const dob = searchParams.get('dob') || 'N/A';
  const applyForPost = searchParams.get('apply_for_post') || 'N/A';
  const district = searchParams.get('district') || 'N/A';
  const state = searchParams.get('state') || 'N/A';
  const uniqueId = searchParams.get('unique_id') || '0000';
  const photoPath = searchParams.get('photo') || '';
  const role = searchParams.get('role') || 'NGO Employee';
  const postPlace = searchParams.get('post_place') || '';
  const doj = searchParams.get('doj') || new Date().toLocaleDateString('en-GB');

  const [photoUrl, setPhotoUrl] = useState('https://via.placeholder.com/120?text=Photo');

  useEffect(() => {
    let active = true;
    let localUrl = '';

    if (photoPath && photoPath !== 'undefined' && photoPath !== 'null') {
      const resolved = photoPath.startsWith('http') 
        ? photoPath 
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${photoPath}`;
      
      fetch(resolved)
        .then((res) => {
          if (!res.ok) throw new Error('Image fetch failed');
          return res.blob();
        })
        .then((blob) => {
          if (!active) return;
          localUrl = URL.createObjectURL(blob);
          setPhotoUrl(localUrl);
        })
        .catch((err) => {
          console.error("CORS fetch failed, trying fallback:", err);
          const prodBase = 'https://aagajfoundation.com';
          if (resolved.includes('localhost') || resolved.includes('127.0.0.1')) {
            try {
              const urlObj = new URL(resolved);
              const fallbackUrl = `${prodBase}${urlObj.pathname}`;
              fetch(fallbackUrl)
                .then((res) => {
                  if (!res.ok) throw new Error('Fallback failed');
                  return res.blob();
                })
                .then((blob) => {
                  if (!active) return;
                  localUrl = URL.createObjectURL(blob);
                  setPhotoUrl(localUrl);
                })
                .catch(() => {
                  if (active) setPhotoUrl('https://via.placeholder.com/120?text=Photo');
                });
            } catch (e) {
              if (active) setPhotoUrl('https://via.placeholder.com/120?text=Photo');
            }
          } else {
            if (active) setPhotoUrl('https://via.placeholder.com/120?text=Photo');
          }
        });
    } else {
      setPhotoUrl('https://via.placeholder.com/120?text=Photo');
    }

    return () => {
      active = false;
      if (localUrl) {
        URL.revokeObjectURL(localUrl);
      }
    };
  }, [photoPath]);

  const downloadCard = () => {
    const cardElement = document.getElementById('employeeIdCard');
    if (cardElement) {
      html2canvas(cardElement, { scale: 3, useCORS: true, allowTaint: true })
        .then((canvas) => {
          const link = document.createElement('a');
          link.download = `Aagaj_ID_${uniqueId}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        })
        .catch((err) => {
          console.error("Error generating card canvas:", err);
          alert("Failed to save image. Please try again.");
        });
    }
  };

  const handleImageError = (e) => {
    const currentSrc = e.target.src;
    const prodBase = 'https://aagajfoundation.com';
    
    if (currentSrc && (currentSrc.includes('localhost') || currentSrc.includes('127.0.0.1'))) {
      try {
        const url = new URL(currentSrc);
        setPhotoUrl(`${prodBase}${url.pathname}`);
        return;
      } catch (err) {}
    }
    setPhotoUrl('https://via.placeholder.com/120?text=Photo');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 space-y-6">
      
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-[#ED1C24] transition-all"
      >
        <ArrowLeft className="h-5 w-5" /> Back to Home
      </button>

      {/* ID CARD */}
      <div 
        id="employeeIdCard"
        className="w-[350px] h-[520px] bg-white rounded-3xl shadow-xl overflow-hidden relative border border-slate-200 flex flex-col justify-between"
      >
        {/* Header */}
        <div className="bg-[#000080] text-white text-center py-4 px-2 border-b-[5px] border-[#ED1C24] shrink-0">
          <h3 className="text-lg font-black tracking-wider leading-none uppercase">Aagaj Foundation</h3>
          <p className="text-[10px] font-bold tracking-widest opacity-85 uppercase mt-1">Registered Under Indian Trust Act 1882</p>
        </div>

        {/* Photo and Unique ID badge */}
        <div className="flex flex-col items-center pt-5 shrink-0">
          <img 
            src={photoUrl} 
            alt="Employee Photo" 
            className="w-28 h-28 rounded-full border-4 border-[#ED1C24] object-cover p-0.5 shadow-inner"
            crossOrigin="anonymous"
            onError={handleImageError}
          />
          <div className="bg-[#ED1C24] text-white text-xs font-black tracking-widest px-4 py-1 rounded-full shadow mt-3 uppercase">
            ID: {uniqueId}
          </div>
        </div>

        {/* Body content */}
        <div className="px-6 text-center space-y-1.5 flex-grow pt-4">
          <h4 className="text-slate-900 text-lg font-black tracking-wide uppercase truncate">{name || 'APPLICANT NAME'}</h4>
          <p className="text-[#ED1C24] text-xs font-extrabold tracking-widest uppercase leading-none">{role}</p>
          {postPlace && (
            <p className="text-[#000080] text-[10px] font-black uppercase tracking-wider leading-none mt-1">
              Place: {postPlace}
            </p>
          )}
          <p className="text-[#000080] text-xs font-black uppercase tracking-wide truncate">{applyForPost}</p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left text-xs font-semibold text-slate-600 leading-relaxed mt-2.5">
            {postPlace && <div className="flex"><strong className="text-[#000080] w-14 shrink-0">Place:</strong> <span className="text-slate-800 uppercase">{postPlace}</span></div>}
            <div className="flex"><strong className="text-[#000080] w-14 shrink-0">DOJ:</strong> <span className="text-slate-800">{doj}</span></div>
            <div className="flex"><strong className="text-[#000080] w-14 shrink-0">DOB:</strong> <span className="text-slate-800">{dob}</span></div>
            <div className="flex"><strong className="text-[#000080] w-14 shrink-0">Mobile:</strong> <span className="text-slate-800">{mobile}</span></div>
            <div className="flex"><strong className="text-[#000080] w-14 shrink-0">Email:</strong> <span className="text-slate-800 truncate">{email}</span></div>
            <div className="flex"><strong className="text-[#000080] w-14 shrink-0">District:</strong> <span className="text-slate-800 truncate">{district}</span></div>
            <div className="flex"><strong className="text-[#000080] w-14 shrink-0">State:</strong> <span className="text-slate-800 truncate">{state}</span></div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#000080] text-white text-center py-2 px-2 text-[10px] font-bold tracking-wide shrink-0">
          www.aagajfoundation.com | Helpline: 9431430464
        </div>

      </div>

      {/* Note box */}
      <div className="max-w-[350px] w-full bg-rose-50 border border-dashed border-[#ED1C24] text-[#ED1C24] rounded-xl p-3 text-xs font-black text-center flex items-center gap-2">
        <ShieldAlert className="h-5 w-5 shrink-0" />
        <span>NOTE: Your User ID and Password will be generated after 24 hours.</span>
      </div>

      {/* Download action button */}
      <button
        onClick={downloadCard}
        className="w-[350px] flex items-center justify-center gap-2 rounded-xl bg-[#ED1C24] hover:bg-[#b0151b] py-3.5 text-base font-extrabold text-white shadow-lg active:scale-95 transition-all"
      >
        <Download className="h-5 w-5" /> Download ID Card
      </button>

    </div>
  );
};

export default Card;
