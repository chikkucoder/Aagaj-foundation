import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas-pro';
import { Download, Award } from 'lucide-react';

const PartnershipCertificate = ({ partner, onClose }) => {
  const certRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const availableHeight = Math.max(300, window.innerHeight - 150);
        const widthScale = width > 0 ? width / 960 : 1;
        const heightScale = availableHeight / 670;
        setScale(Math.min(1, widthScale, heightScale));
      }
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    window.addEventListener('resize', updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  if (!partner) return null;

  const certNo = partner.certificateNo || `AF/PARTNER/${new Date().getFullYear()}/${partner.uniqueId || '001'}`;
  const partnerName = partner.businessName || partner.name || 'PARTNER HOSPITAL & CLINIC';
  const partnershipDate = partner.partnershipDate || new Date().toISOString().split('T')[0];
  const validUntil = partner.validUntil || 'Lifelong Partnership';
  const location = partner.certificateLocation || `${partner.address?.city || 'Muzaffarpur'}, ${partner.address?.state || 'Bihar'}`;

  const handleDownloadImage = () => {
    if (!certRef.current) return;
    html2canvas(certRef.current, { scale: 3, useCORS: true, allowTaint: true })
      .then((canvas) => {
        const link = document.createElement('a');
        link.download = `Partnership_Certificate_${partnerName.replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      })
      .catch((err) => {
        console.error('Error rendering partnership certificate canvas:', err);
        alert('Failed to download certificate image. Please try again.');
      });
  };

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4 w-full">
      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2.5 w-full max-w-5xl bg-slate-50 border border-slate-200 rounded-2xl p-2.5 sm:p-3 shadow-sm">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wide">
          <Award className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-[#0D5C53] shrink-0" />
          <span>Official Partnership Certificate Preview</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleDownloadImage}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-[#0D5C53] hover:bg-[#093e38] text-white text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
          >
            <Download className="h-3.5 w-3.5" /> Download Certificate PNG
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold cursor-pointer transition-all"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Certificate Main Canvas Wrapper */}
      <div
        ref={containerRef}
        className="w-full flex justify-center items-center bg-slate-100/70 rounded-2xl sm:rounded-3xl border border-slate-200 p-1 sm:p-3 shadow-inner overflow-hidden"
      >
        <div
          className="relative shrink-0 overflow-hidden"
          style={{
            width: `${960 * scale}px`,
            height: `${670 * scale}px`,
            transition: 'width 0.1s ease-out, height 0.1s ease-out'
          }}
        >
          <div
            ref={certRef}
            className="w-[960px] h-[670px] bg-[#FCFDF9] p-5 select-none relative font-serif text-slate-800 shrink-0 border-[8px] border-[#D4AF37] shadow-2xl rounded-sm"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              backgroundImage: 'radial-gradient(circle at center, #FFFFFF 0%, #FAF8F2 100%)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.18)'
            }}
          >
            {/* Inner Double Gold Frame */}
            <div className="w-full h-full border-[2px] border-[#C5A059] p-1.5 relative">
              <div className="w-full h-full border-[1px] border-[#D4AF37] p-6 flex flex-col justify-between relative bg-white/90">

                {/* Top Left Decorative Corner Ribbon */}
                <div className="absolute top-0 left-0 w-36 h-36 overflow-hidden pointer-events-none z-10">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path d="M0,0 L90,0 C60,40 30,50 0,90 Z" fill="#0D5C53" />
                    <path d="M0,0 L70,0 C45,30 25,40 0,70 Z" fill="#8B1E4B" />
                    <path d="M0,0 L40,0 C25,18 15,25 0,40 Z" fill="#D4AF37" opacity="0.8" />
                  </svg>
                </div>

                {/* Bottom Right Decorative Corner Ribbon */}
                <div className="absolute bottom-0 right-0 w-36 h-36 overflow-hidden pointer-events-none z-10 rotate-180">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path d="M0,0 L90,0 C60,40 30,50 0,90 Z" fill="#0D5C53" />
                    <path d="M0,0 L70,0 C45,30 25,40 0,70 Z" fill="#8B1E4B" />
                    <path d="M0,0 L40,0 C25,18 15,25 0,40 Z" fill="#D4AF37" opacity="0.8" />
                  </svg>
                </div>

                {/* Top Right Ornate Gold Corner Flourish */}
                <div className="absolute top-2 right-2 w-16 h-16 pointer-events-none text-[#C5A059] opacity-85">
                  <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
                    <path d="M90,10 Q50,10 50,50 Q50,90 90,90 M80,20 Q40,20 40,50 M90,10 L10,10 L10,90" fill="none" stroke="currentColor" strokeWidth="2" />
                    <circle cx="85" cy="15" r="3" />
                    <circle cx="15" cy="85" r="3" />
                  </svg>
                </div>

                {/* Bottom Left Ornate Gold Corner Flourish */}
                <div className="absolute bottom-2 left-2 w-16 h-16 pointer-events-none text-[#C5A059] opacity-85 rotate-180">
                  <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
                    <path d="M90,10 Q50,10 50,50 Q50,90 90,90 M80,20 Q40,20 40,50 M90,10 L10,10 L10,90" fill="none" stroke="currentColor" strokeWidth="2" />
                    <circle cx="85" cy="15" r="3" />
                    <circle cx="15" cy="85" r="3" />
                  </svg>
                </div>

                {/* Top Bar: NGO Darpan & Certificate No. */}
                <div className="flex justify-between items-center w-full z-20 pl-28 pr-6 pt-1">
                  <div className="text-left">
                    <span className="text-xs font-serif text-slate-800 tracking-wider">
                      NGO DARPAN NO – <span className="font-bold border-b border-dashed border-slate-600 px-2 font-mono text-[#8B1E4B]">BR/2020/0260968</span>
                    </span>
                    <div className="w-48 h-[2px] bg-[#D4AF37] mt-0.5"></div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-serif text-slate-800 tracking-wider">
                      Certificate No.: <span className="font-bold border-b border-dashed border-slate-600 px-2 font-mono text-[#0D5C53]">{certNo}</span>
                    </span>
                    <div className="w-36 h-[2px] bg-[#D4AF37] mt-0.5 ml-auto"></div>
                  </div>
                </div>

                {/* Center Content Section */}
                <div className="flex flex-col items-center text-center z-20 px-8 py-1 flex-grow justify-center">

                  {/* Logo Section */}
                  <div className="flex flex-col items-center mb-2">
                    <img
                      src="/logo.jpg"
                      alt="Aagaj Foundation Logo"
                      className="h-16 w-16 object-contain rounded-full shadow-sm border border-slate-100"
                      crossOrigin="anonymous"
                      onError={(e) => { e.target.src = '/logo.jpg'; }}
                    />
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xl font-black text-[#0D5C53] tracking-widest uppercase">AAGAJ</span>
                      <span className="text-xl font-black text-[#8B1E4B] tracking-widest uppercase">FOUNDATION</span>
                    </div>
                    <span className="text-[10px] font-sans font-bold text-slate-600 tracking-widest uppercase mt-0.5">
                      NGO DARPAN NO – BR/2020/0260968 &nbsp;|&nbsp; REG NO – 759445
                    </span>
                  </div>

                  {/* Title */}
                  <h1 className="text-4xl font-extrabold text-[#0C5A52] tracking-[0.12em] uppercase font-serif mb-0.5">
                    CERTIFICATE
                  </h1>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-16 h-[1.5px] bg-[#D4AF37]"></div>
                    <h2 className="text-xl font-bold text-[#8B1E4B] tracking-[0.15em] uppercase font-serif">
                      OF PARTNERSHIP
                    </h2>
                    <div className="w-16 h-[1.5px] bg-[#D4AF37]"></div>
                  </div>

                  {/* Subtext */}
                  <p className="text-sm font-serif italic text-slate-700 mb-3">
                    This is to proudly certify that
                  </p>

                  {/* Partner Name Container with Laurel Leaves */}
                  <div className="flex items-center justify-center gap-4 w-full max-w-2xl my-1">
                    {/* Left Olive Laurel */}
                    <span className="text-2xl text-[#C5A059]">🌿</span>

                    <div className="flex-grow border-b-2 border-slate-800 pb-1">
                      <h3 className="text-2xl font-black text-[#0A3C36] uppercase tracking-wide font-serif px-4">
                        {partnerName}
                      </h3>
                    </div>

                    {/* Right Olive Laurel */}
                    <span className="text-2xl text-[#C5A059] scale-x-[-1]">🌿</span>
                  </div>

                  {/* Body Text */}
                  <div className="max-w-3xl text-center space-y-2 mt-3 text-xs leading-relaxed font-serif text-slate-700">
                    <p className="m-0">
                      has entered into an official partnership with <strong className="text-slate-900 font-bold">AAGAJ FOUNDATION</strong> for collaborative efforts in community welfare, healthcare awareness, medical support, health camps, social development initiatives, and public service programs.
                    </p>
                    <p className="m-0">
                      This partnership reflects our shared commitment to improving the quality of life and creating a positive social impact through mutual cooperation and dedicated service.
                    </p>
                    <p className="text-sm font-bold text-slate-900 mt-2">
                      The organization is hereby recognized as an <span className="text-[#8B1E4B] font-extrabold underline decoration-[#D4AF37] decoration-2">Official Partner</span> of <strong className="text-[#0D5C53]">AAGAJ FOUNDATION</strong>.
                    </p>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-200/80 w-full max-w-2xl text-xs font-serif text-slate-800">
                    <div>
                      Partnership Date: <strong className="border-b border-slate-600 px-2 text-[#0D5C53]">{partnershipDate}</strong>
                    </div>
                    <div className="text-slate-300">|</div>
                    <div>
                      Valid Until: <strong className="border-b border-slate-600 px-2 text-[#8B1E4B]">{validUntil}</strong>
                    </div>
                    <div className="text-slate-300">|</div>
                    <div>
                      Location: <strong className="border-b border-slate-600 px-2 text-slate-900">{location}</strong>
                    </div>
                  </div>

                  <p className="text-[10px] italic text-slate-500 mt-2">
                    We appreciate the valuable contribution and look forward to a long-term collaborative relationship.
                  </p>
                </div>

                {/* Footer Signatures and Seal Section */}
                <div className="flex justify-between items-end w-full px-10 pb-2 z-20">
                  {/* Left Signature */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-40 border-b border-slate-800 mb-1"></div>
                    <span className="text-[11px] font-bold text-[#8B1E4B]">Authorized Signatory</span>
                    <span className="text-[9px] font-black text-[#0D5C53] tracking-wider uppercase">AAGAJ FOUNDATION</span>
                  </div>

                  {/* Center Official Seal */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#C5A059] flex items-center justify-center p-0.5 bg-amber-50/30">
                      <div className="w-full h-full rounded-full border border-[#D4AF37] flex flex-col items-center justify-center text-[7px] font-black text-[#8B1E4B] tracking-tighter uppercase text-center p-0.5 leading-tight">
                        <span className="text-[6.5px]">AAGAJ</span>
                        <span className="text-[5.5px] font-bold text-slate-700">BR/2020/0260968</span>
                        <span className="text-[#0D5C53] text-[6.5px]">OFFICIAL SEAL</span>
                      </div>
                    </div>
                    <span className="text-[8px] font-serif text-slate-400 mt-0.5">(Official Seal)</span>
                  </div>

                  {/* Right Signature */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-40 border-b border-slate-800 mb-1"></div>
                    <span className="text-[11px] font-bold text-[#8B1E4B]">President / Founder</span>
                    <span className="text-[9px] font-black text-[#0D5C53] tracking-wider uppercase">AAGAJ FOUNDATION</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnershipCertificate;
