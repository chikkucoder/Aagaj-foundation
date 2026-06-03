import React, { useState } from 'react';
import { X, Eye } from 'lucide-react';

const galleryItems = [
  { src: '/pic1.jpeg', title: 'Empowerment Awareness Rally', category: 'Events' },
  { src: '/pic2.jpg', title: 'Women Sewing Skill Center', category: 'Training' },
  { src: '/pic3.jpg', title: 'District Administrative Meet', category: 'Meetings' },
  { src: '/pic4.jpg', title: 'Sanitary & Health Distribution', category: 'Healthcare' },
  { src: '/pic5.jpg', title: 'Rural Block Campaign', category: 'Events' },
  { src: '/pic6.jpeg', title: 'Silayi Machine Delivery', category: 'Training' },
  { src: '/pic7.jpeg', title: 'Health Card Checkups', category: 'Healthcare' },
  { src: '/pic8.jpeg', title: 'Block Coordinator Workshop', category: 'Meetings' },
  { src: '/pic9.jpeg', title: 'Panchayat Educational Support', category: 'Events' },
  { src: '/pic10.jpeg', title: 'Empowering Women Groups', category: 'Training' },
];

const Gallery = () => {
  const [activePhoto, setActivePhoto] = useState(null);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      
      {/* Header */}
      <section className="relative py-16 bg-slate-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-rose-950 opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase">Event Gallery</h1>
          <p className="max-w-xl mx-auto text-slate-300 font-semibold text-base">
            Glimpses of our ongoing block developmental works, training sessions, and healthcare camps.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {galleryItems.map((item, index) => (
              <div 
                key={index} 
                className="group relative cursor-pointer overflow-hidden rounded-2xl bg-slate-950 shadow-md aspect-video"
                onClick={() => setActivePhoto(item)}
              >
                <img 
                  src={item.src} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:opacity-75"
                />
                
                {/* Overlay hover details */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 space-y-1 text-white">
                  <span className="text-xs font-black uppercase tracking-wider text-[#fdd831]">{item.category}</span>
                  <h3 className="text-base font-bold flex items-center gap-1.5 justify-between">
                    {item.title}
                    <Eye className="h-5 w-5 text-white stroke-[2.5]" />
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Lightbox Modal */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <button 
            onClick={() => setActivePhoto(null)}
            className="absolute top-6 right-6 text-white hover:text-[#fdd831] p-2 bg-slate-800/50 rounded-full transition-all"
            title="Close"
          >
            <X className="h-7 w-7" />
          </button>
          
          <div className="max-w-4xl w-full flex flex-col items-center gap-4">
            <img 
              src={activePhoto.src} 
              alt={activePhoto.title} 
              className="max-h-[75vh] w-auto object-contain rounded-lg border-2 border-slate-800 shadow-2xl"
            />
            <div className="text-center text-white space-y-1">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#fdd831]">{activePhoto.category}</span>
              <h2 className="text-xl font-bold">{activePhoto.title}</h2>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Gallery;
