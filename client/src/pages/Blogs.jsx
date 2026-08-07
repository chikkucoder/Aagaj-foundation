import React, { useState, useEffect } from 'react';
import { getBlogs } from '../api/userApi';
import { Calendar, User, Clock, ChevronRight, X, ArrowLeft } from 'lucide-react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

const fallbackBlogs = [
  {
    _id: '1',
    title: 'Empowering Women Through Skill Development and Training',
    slug: 'empowering-women-through-skill-development',
    description: 'How Mahila Silayi Prasikshan Yojana is transforming rural lives in Bihar by creating self-reliance and local employment.',
    content: 'Empowerment of women is essential for the sustainable development of any society. Aagaj Foundation is proud to run the Mahila Silayi Prasikshan Yojana, which equips women in rural parts of Patna and Paliganj with expert tailoring skills. By providing professional sewing training and access to startup toolkits, we enable women to earn from home, support their children\'s education, and gain financial autonomy. Over 500 women have successfully graduated and are now operating micro-ventures in their local villages. The training curriculum focuses on apparel design, quality inspection, and marketing, making them fully independent.',
    image: '/silai.jpeg',
    category: 'Women Empowerment',
    author: 'Bireena Devi',
    createdAt: new Date('2026-08-01')
  },
  {
    _id: '2',
    title: 'Creating Sustainable Livelihoods: Women Self-Help Groups',
    slug: 'creating-sustainable-livelihoods-self-help-groups',
    description: 'An in-depth look at Mahila Swarojgaar Yojana and how collective savings and enterprise financing solve rural unemployment.',
    content: 'Unemployment is a key challenge in rural India, but women have the power to create jobs collectively. Under the Mahila Swarojgaar Yojana, Aagaj Foundation organizes women into Self-Help Groups (SHGs) and provides training in micro-business management, packaging, and digital payments. This collective framework enables them to raise credit easily and start local manufacturing units (e.g., for garments, local crafts, and packaging items). This blog discusses our model and how local trust drives financial progress. The focus is to build sustainable, self-reliant enterprise clusters.',
    image: '/swarojgaar.png',
    category: 'Livelihoods',
    author: 'Vivek Kumar',
    createdAt: new Date('2026-08-03')
  },
  {
    _id: '3',
    title: 'Access to Quality Healthcare: Swasthya Suraksha Yojana',
    slug: 'access-quality-healthcare-swasthya-suraksha',
    description: 'Understanding our community health card system and how partnered networks of clinics bring affordable treatments to local villages.',
    content: 'Rural healthcare suffers from lack of infrastructure and high outpatient costs. Aagaj Foundation\'s Swasthya Suraksha Yojana bridges this gap. By issuing digital Health Cards, we connect beneficiaries directly to partnered clinics, blood banks, and chemists. Cardholders receive flat discounts of 10% to 50% on doctors\' consultations, lab tests, and life-saving medicines. This ensures no family goes into debt due to unexpected medical emergencies. We currently have over 30 partnered clinics across Bihar. The digital card platform is expanding to include telemedicine.',
    image: '/health.jpg',
    category: 'Healthcare',
    author: 'Vivek Kumar',
    createdAt: new Date('2026-08-05')
  }
];

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await getBlogs();
        if (res.success && res.data && res.data.length > 0) {
          setBlogs(res.data);
        } else {
          setBlogs(fallbackBlogs);
        }
      } catch (err) {
        console.warn('API error fetching blogs, falling back to local copies:', err.message);
        setBlogs(fallbackBlogs);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // Handle sitemap direct entry via query parameters: ?post=slug
  useEffect(() => {
    if (blogs.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const postSlug = params.get('post');
      if (postSlug) {
        const matched = blogs.find((b) => b.slug === postSlug);
        if (matched) {
          setSelectedBlog(matched);
        }
      }
    }
  }, [blogs]);

  const categories = ['All', 'Women Empowerment', 'Livelihoods', 'Healthcare'];
  const filteredBlogs = activeTab === 'All' 
    ? blogs 
    : blogs.filter((b) => b.category === activeTab);

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getReadingTime = (text) => {
    const words = text ? text.split(/\s+/).length : 0;
    const minutes = Math.ceil(words / 150);
    return `${minutes} min read`;
  };

  const getDynamicMetaDescription = (blog) => {
    if (!blog) return "Read updates on Aagaj Foundation's social work, women training center events, and free community checkups in Bihar.";
    if (blog.description) return blog.description;
    const text = blog.content || "";
    return text.length > 155 ? `${text.substring(0, 152)}...` : text;
  };

  const getDynamicKeywords = (blog) => {
    if (!blog) return "Aagaj Foundation blog, NGO news Patna, rural women welfare updates";
    const cleanTitle = blog.title.replace(/[^\w\s]/g, "");
    const words = cleanTitle.split(/\s+/).filter(w => w.length > 4);
    return ["Aagaj Foundation", ...words, "NGO Bihar"].join(", ");
  };

  const seoTitle = selectedBlog 
    ? `${selectedBlog.title} - Aagaj Foundation Blog`
    : "Our Blog & Insights - Aagaj Foundation";
  const seoDesc = getDynamicMetaDescription(selectedBlog);
  const seoUrl = selectedBlog 
    ? `https://aagajfoundation.com/blogs?post=${selectedBlog.slug}`
    : "https://aagajfoundation.com/blogs";
  const seoImage = selectedBlog && selectedBlog.image 
    ? selectedBlog.image 
    : "https://aagajfoundation.com/logo.jpg";

  const blogSchema = selectedBlog ? {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": selectedBlog.title,
    "image": [
      selectedBlog.image ? (selectedBlog.image.startsWith('http') ? selectedBlog.image : `https://aagajfoundation.com${selectedBlog.image}`) : "https://aagajfoundation.com/logo.jpg"
    ],
    "datePublished": selectedBlog.createdAt,
    "dateModified": selectedBlog.createdAt,
    "author": {
      "@type": "Person",
      "name": selectedBlog.author || "Vivek Kumar",
      "jobTitle": "Representative, AAGAJ Foundation"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Aagaj Foundation",
      "logo": {
        "@type": "ImageObject",
        "url": "https://aagajfoundation.com/logo.jpg"
      }
    },
    "description": seoDesc
  } : null;

  const breadcrumbsSchema = {
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
        "name": "Blogs",
        "item": "https://aagajfoundation.com/blogs"
      }
    ]
  };

  const schemas = [breadcrumbsSchema];
  if (blogSchema) {
    schemas.push(blogSchema);
  }

  return (
    <div className="bg-slate-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <SEO 
        title={seoTitle}
        description={seoDesc}
        canonicalUrl={seoUrl}
        keywords={getDynamicKeywords(selectedBlog)}
        ogTitle={seoTitle}
        ogDescription={seoDesc}
        ogImage={seoImage}
        schema={schemas}
      />
      
      {/* Blog Detail View Mode */}
      {selectedBlog ? (
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 animate-fade-in">
          
          {/* Back button */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                setSelectedBlog(null);
                // Clear URL parameters
                window.history.pushState({}, '', window.location.pathname);
              }}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0B2C66] transition-all cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Blog List
            </button>
            <span className="inline-flex items-center rounded-full bg-[#0B2C66]/5 px-2.5 py-0.5 text-xs font-bold text-[#0B2C66]">
              {selectedBlog.category}
            </span>
          </div>

          {/* Hero Image */}
          {selectedBlog.image && (
            <div className="h-[250px] sm:h-[350px] w-full overflow-hidden relative">
              <img 
                src={selectedBlog.image} 
                alt={selectedBlog.title} 
                className="w-full h-full object-cover"
                onError={(e) => e.target.src = '/logo.jpg'}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <h1 className="text-xl sm:text-3xl font-extrabold leading-tight">{selectedBlog.title}</h1>
              </div>
            </div>
          )}

          {/* Meta Details */}
          <div className="p-8 sm:p-12 space-y-6">
            <div className="flex flex-wrap items-center gap-6 text-slate-400 text-xs sm:text-sm border-b pb-6 border-slate-100">
              <span className="flex items-center gap-1.5 font-medium">
                <User className="h-4 w-4 text-[#ED1C24]" /> By {selectedBlog.author === "Vivek Kumar" ? (
                  <Link to="/about/founder" className="hover:text-[#ED1C24] underline transition-all">Vivek Kumar</Link>
                ) : (selectedBlog.author || "Vivek Kumar")}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="h-4 w-4 text-[#ED1C24]" /> {formatDate(selectedBlog.createdAt)}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="h-4 w-4 text-[#ED1C24]" /> {getReadingTime(selectedBlog.content)}
              </span>
            </div>

            {/* Content Body */}
            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base space-y-4 whitespace-pre-line">
              {selectedBlog.content}
            </div>
          </div>
        </div>
      ) : (
        /* Blog Grid List Mode */
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0B2C66] tracking-tight">Our Blog & Insights</h1>
            <p className="text-slate-500 text-sm sm:text-base max-w-lg mx-auto">
              Stay updated with articles on local training camps, healthcare campaigns, and women empowerment initiatives.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 border-b border-slate-200 pb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${activeTab === cat ? 'bg-[#0B2C66] text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid list */}
          {loading ? (
            <div className="flex justify-center py-24">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0B2C66] border-t-transparent"></div>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-20 text-slate-400 font-semibold">No posts found in this category.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((blog) => (
                <div
                  key={blog._id}
                  className="bg-white rounded-3xl overflow-hidden shadow-md border border-slate-100 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
                >
                  
                  {/* Blog Image */}
                  <div className="h-48 overflow-hidden relative bg-slate-100">
                    <img
                      src={blog.image || '/logo.jpg'}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                      onError={(e) => e.target.src = '/logo.jpg'}
                    />
                    <span className="absolute top-4 left-4 bg-white/95 px-3 py-1 rounded-full text-[10px] font-extrabold text-[#0B2C66] shadow-sm uppercase">
                      {blog.category}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-slate-400 text-[10px] font-semibold">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-[#ED1C24]" /> {formatDate(blog.createdAt)}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-[#ED1C24]" /> {getReadingTime(blog.content)}</span>
                      </div>
                      <h2 className="text-base font-bold text-slate-800 line-clamp-2 hover:text-[#0B2C66] transition-all">
                        {blog.title}
                      </h2>
                      <p className="text-slate-500 text-xs sm:text-sm line-clamp-3">
                        {blog.description}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedBlog(blog);
                        // Add parameter to URL without page refresh
                        window.history.pushState({}, '', `?post=${blog.slug}`);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-extrabold text-[#ED1C24] hover:text-[#0B2C66] transition-all cursor-pointer self-start"
                    >
                      Read Full Article <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Blogs;
