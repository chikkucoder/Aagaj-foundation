import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas-pro';
import { Download, Award, Printer } from 'lucide-react';

const MembershipCertificate = ({ member, onClose }) => {
  const certRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        if (width > 0) {
          setScale(Math.min(1, width / 880));
        }
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
  }, [member]);

  if (!member) return null;

  const handleDownloadImage = () => {
    if (!certRef.current) return;
    html2canvas(certRef.current, { scale: 3, useCORS: true, allowTaint: true })
      .then((canvas) => {
        const link = document.createElement('a');
        link.download = `Membership_Certificate_${member.membershipId || 'AAGAJ'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      })
      .catch((err) => {
        console.error('Error rendering membership certificate canvas:', err);
        alert('Failed to download certificate image. Please try again.');
      });
  };

  const handlePrint = () => {
    if (!certRef.current) return;
    const printWindow = window.open('', '_blank');
    const content = certRef.current.outerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Membership Certificate - ${member.fullName || 'AAGAJ'}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { size: landscape; margin: 0; }
            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #fff; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4 w-full font-sans">
      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2.5 w-full max-w-4xl bg-slate-50 border border-slate-200 rounded-2xl p-2.5 sm:p-3 shadow-sm print:hidden">
        <div className="flex items-center gap-2 text-rose-900 font-bold text-xs uppercase tracking-wide">
          <Award className="h-4.5 w-4.5 text-rose-700 shrink-0" />
          <span>Official Membership Certificate Preview</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleDownloadImage}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
          >
            <Download className="h-3.5 w-3.5" /> Download PNG
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
          >
            <Printer className="h-3.5 w-3.5" /> Print
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold cursor-pointer transition-all"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Certificate Main Canvas Wrapper */}
      <div
        ref={containerRef}
        className="w-full flex justify-center items-center bg-slate-100/80 rounded-3xl border border-slate-200 p-2 sm:p-4 shadow-inner overflow-hidden"
      >
        <div
          className="relative shrink-0 overflow-hidden"
          style={{
            width: `${880 * scale}px`,
            height: `${640 * scale}px`,
            transition: 'width 0.1s ease-out, height 0.1s ease-out'
          }}
        >
          <div
            ref={certRef}
            className="w-[880px] h-[640px] bg-gradient-to-b from-amber-50/40 via-white to-rose-50/30 p-6 select-none border-[12px] border-double border-rose-900 rounded-2xl shadow-2xl relative font-serif text-slate-800 shrink-0 flex flex-col justify-between"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left'
            }}
          >
            {/* Decorative Certificate Corner Accents */}
            <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-rose-600 rounded-tl-xl pointer-events-none"></div>
            <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-rose-600 rounded-tr-xl pointer-events-none"></div>
            <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-rose-600 rounded-bl-xl pointer-events-none"></div>
            <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-rose-600 rounded-br-xl pointer-events-none"></div>

            {/* Watermark Logo */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
              <img src="/logo.jpeg" alt="Watermark" className="w-[450px] h-auto object-contain" />
            </div>

            <div>
              {/* Header Info */}
              <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-sans font-bold text-slate-600 mb-2 pb-1.5 border-b border-rose-200">
                <div>
                  Reg. No: <span className="text-slate-900 font-black">759445/2020</span> | NGO DARPAN: <span className="text-rose-900 font-black">BR/2020/0260968</span>
                </div>
                <div className="text-center font-mono">
                  <span className="bg-rose-100 text-rose-800 px-3 py-0.5 rounded-full text-xs font-black">
                    CERTIFICATE NO: {member.certificateNo || 'AF/MBR/2026/00001'}
                  </span>
                </div>
                <div>ISO 9001:2015 CERTIFIED</div>
              </div>

              {/* Logo & Foundation Header */}
              <div className="text-center space-y-0.5 mb-2">
                <div className="flex justify-center items-center gap-3">
                  <img src="/logo.jpeg" alt="Aagaj Foundation Logo" className="h-14 w-auto rounded-xl shadow-md border-2 border-rose-600" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-rose-900 tracking-wider uppercase font-sans">
                  AAGAJ FOUNDATION
                </h1>
                <p className="text-[10px] sm:text-[11px] font-sans font-bold text-slate-600 uppercase tracking-widest">
                  (Registered Under Indian Trust Act 1882 &nbsp;|&nbsp; NGO DARPAN NO – BR/2020/0260968)
                </p>
                <p className="text-[9px] sm:text-[10px] font-sans font-medium text-slate-500">
                  Head Office: Main Road, Patna, Bihar | Web: www.aagajfoundation.com
                </p>
              </div>

              {/* Certificate Title Badge */}
              <div className="text-center my-2">
                <div className="inline-block bg-gradient-to-r from-rose-800 via-rose-600 to-rose-800 text-white font-sans font-black text-base sm:text-lg uppercase tracking-widest px-6 py-1 rounded-full shadow-md border-2 border-amber-300">
                  MEMBERSHIP CERTIFICATE / सदस्य प्रमाण पत्र
                </div>
              </div>

              {/* Main Certificate Content */}
              <div className="my-2 text-center space-y-1 font-sans text-xs sm:text-sm leading-relaxed text-slate-800">
                <p className="text-slate-600 italic text-[11px]">This is to officially certify that / एतद्द्वारा प्रमाणित किया जाता है कि</p>
                
                <div className="text-xl sm:text-2xl font-black text-rose-950 font-serif border-b-2 border-dashed border-rose-400 inline-block px-5 py-0.5 my-0.5">
                  {member.fullName || 'Full Name'}
                </div>

                <p className="text-slate-700 text-xs">
                  {member.fatherOrHusbandName ? `S/o / W/o Shri ${member.fatherOrHusbandName}, ` : ''}
                  Resident of <strong className="text-slate-900">{member.city || member.district || 'Patna'}, {member.state || 'Bihar'}</strong>
                </p>

                <p className="text-slate-800 max-w-2xl mx-auto font-medium text-xs">
                  is officially enrolled as an esteemed <span className="bg-rose-100 text-rose-900 font-extrabold px-2 py-0.5 rounded border border-rose-300">{member.membershipType || 'General Member'}</span> of <strong>AAGAJ FOUNDATION</strong> starting from <strong>{member.joiningDate || new Date().toISOString().split('T')[0]}</strong>.
                </p>

                {member.interestAreas && member.interestAreas.length > 0 && (
                  <p className="text-[10px] text-slate-600 pt-0.5">
                    Key Contribution Areas: <strong className="text-slate-800">{member.interestAreas.join(', ')}</strong>
                  </p>
                )}
              </div>

              {/* Member Details Grid & Photo */}
              <div className="my-2 p-2.5 rounded-xl bg-rose-50/80 border border-rose-200 flex items-center justify-between gap-4 font-sans text-[11px]">
                {/* Photo */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-16 rounded-xl border-2 border-rose-600 overflow-hidden bg-slate-200 shadow-md shrink-0">
                    {member.photoUrl ? (
                      <img src={member.photoUrl} alt="Member Photo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-[8px] text-center font-bold">
                        NO PHOTO
                      </div>
                    )}
                  </div>

                  <div className="space-y-0.5 text-left text-[10px] sm:text-[11px]">
                    <p><span className="text-slate-500 font-bold">Membership ID:</span> <strong className="text-slate-900 font-mono text-xs">{member.membershipId || 'AF-MBR-2026-00001'}</strong></p>
                    <p><span className="text-slate-500 font-bold">Mobile:</span> <strong className="text-slate-900">{member.mobileNumber || 'N/A'}</strong></p>
                    <p><span className="text-slate-500 font-bold">Joining Date:</span> <strong className="text-slate-900">{member.joiningDate || 'N/A'}</strong></p>
                    <p><span className="text-slate-500 font-bold">Aadhaar No:</span> <strong className="text-slate-900 font-mono">{member.aadhaarNumber ? `XXXX-XXXX-${member.aadhaarNumber.slice(-4)}` : 'N/A'}</strong></p>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="bg-white p-2 rounded-xl border border-rose-200 shadow-sm text-left space-y-0.5 shrink-0 text-[10px]">
                  <p className="font-bold text-rose-800 text-[9px] uppercase border-b border-slate-100 pb-0.5">Payment Status: PAID ✅</p>
                  <p><span className="text-slate-500 font-semibold">Amount Paid:</span> <strong className="text-rose-700 font-black">₹{member.paymentAmount || 250}</strong></p>
                  <p><span className="text-slate-500 font-semibold">Txn Reference:</span> <strong className="text-slate-800 font-mono text-[9px]">{member.paymentId || 'TXN-MBR-12345'}</strong></p>
                </div>
              </div>
            </div>

            <div>
              {/* Signatures & Seal Section */}
              <div className="mt-1 pt-1 border-t border-rose-200 flex justify-between items-end font-sans text-center">
                <div className="w-28 sm:w-32">
                  <div className="h-5"></div>
                  <div className="border-t border-slate-400 pt-0.5 text-[8.5px] font-bold text-slate-700 uppercase">
                    Settler Cum Secretary
                    <span className="block text-[6.5px] text-slate-400 font-normal">AAGAJ FOUNDATION</span>
                  </div>
                </div>

                {/* Official Stamp Overlay */}
                <div className="relative flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full border-2 border-rose-700 border-dashed flex flex-col items-center justify-center p-0.5 opacity-85 rotate-[-12deg] bg-rose-50/50 shadow-sm">
                    <span className="text-[5.5px] font-black text-rose-900 uppercase">AAGAJ FOUNDATION</span>
                    <span className="text-[4px] text-rose-700 font-bold">REG. 759445/2020</span>
                    <span className="text-[4px] text-rose-700 font-bold">DARPAN: BR/2020/0260968</span>
                    <span className="text-[4.5px] font-black text-rose-800 mt-0.5">OFFICIAL SEAL</span>
                  </div>
                </div>

                <div className="w-28 sm:w-32">
                  <div className="h-5"></div>
                  <div className="border-t border-slate-400 pt-0.5 text-[8.5px] font-bold text-slate-700 uppercase">
                    Settler Cum President
                    <span className="block text-[6.5px] text-slate-400 font-normal">AAGAJ FOUNDATION</span>
                  </div>
                </div>

                <div className="w-28 sm:w-32">
                  <div className="h-5"></div>
                  <div className="border-t border-slate-400 pt-0.5 text-[8.5px] font-bold text-slate-700 uppercase">
                    Coordinator / समन्वयक
                    <span className="block text-[6.5px] text-slate-400 font-normal">AAGAJ FOUNDATION</span>
                  </div>
                </div>
              </div>

              {/* Footer QR Verification Code */}
              <div className="mt-1 pt-1 border-t border-slate-200 flex justify-between items-center font-sans text-[8.5px] text-slate-500">
                <span>Verify online at: www.aagajfoundation.com/membership</span>
                <div className="flex items-center gap-1.5">
                  <span>Scan to verify certificate</span>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=45x45&data=AAGAJ-MBR:${member.membershipId}%0ANAME:${encodeURIComponent(member.fullName || '')}`}
                    alt="QR"
                    className="w-7 h-7 object-contain rounded border border-slate-300"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipCertificate;
