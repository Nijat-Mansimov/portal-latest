import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SectionTitle } from '../components/SectionTitle';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Service {
  id: string;
  title: string;
  description: string;
  redirectUrl: string;
  tutorialUrl?: string;
}

interface NewsItem {
  id: string;
  title: string;
  coverImage: string;
}

export function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers: HeadersInit = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // Fetch Services
        const resServices = await fetch('/api/services', { headers, cache: 'no-store' });
        if (resServices.ok) {
          const data = await resServices.json();
          const mappedServices = data.map((s: any) => ({
            id: s.id || s.Id,
            title: s.title || s.Title || '',
            description: s.description || s.Description || '',
            redirectUrl: s.redirectUrl || s.RedirectUrl || '',
            tutorialUrl: s.tutorialUrl || s.TutorialUrl || ''
          }));
          setServices(mappedServices.slice(0, 3));
        }

        // Fetch News for Slider
        const resNews = await fetch('/api/news', { cache: 'no-store' });
        if (resNews.ok) {
          const nData = await resNews.json();
          const mappedNews = nData.map((s: any) => ({
            id: s.id || s.Id,
            title: s.title || s.Title || '',
            coverImage: s.coverImage || s.CoverImageUrl || s.coverImageUrl || ''
          }));
          setNews(mappedNews.slice(0, 5)); // Last 5 news
        }

      } catch (err) {
        console.error('Home data load error', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Auto-play slider
  useEffect(() => {
    if (news.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % news.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [news.length]);

  const activeNews = news[currentSlide];

  return (
    <div className="w-full">
      {/* Hero Section Slider */}
      <div className="relative w-full h-[500px] bg-slate-900 group">
        {activeNews ? (
          <>
            <img 
              key={activeNews.coverImage} // forces refresh animation if desired
              src={activeNews.coverImage} 
              alt={activeNews.title} 
              className="w-full h-full object-cover opacity-60 transition-opacity duration-1000"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
            <div className="absolute inset-0 flex items-end">
              <div className="max-w-6xl mx-auto px-6 md:px-12 pb-20 w-full">
                <div className="max-w-3xl flex flex-col items-start transform transition-all duration-700 translate-y-0 opacity-100">
                  <div className="bg-white/10 dark:bg-slate-900/40 backdrop-blur-md border-l-4 border-blue-500 px-6 md:px-8 py-5 w-full shadow-2xl">
                     <h1 className="text-2xl md:text-3xl font-bold text-white leading-snug drop-shadow-md">
                       {activeNews.title}
                     </h1>
                  </div>
                  <button 
                    onClick={() => navigate(`/news/${activeNews.id}`)}
                    className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 font-bold text-sm flex items-center gap-2 transition-colors uppercase tracking-wide rounded shadow-lg"
                  >
                    ƏTRAFLI <span className="text-white text-lg leading-none font-bold">❯</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Controls */}
            {news.length > 1 && (
              <>
                <button 
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + news.length) % news.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/30 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-all z-20"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button 
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % news.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/30 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-all z-20"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
                
                {/* Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                  {news.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-3 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-blue-500' : 'w-3 bg-white/50 hover:bg-white'}`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-500"></div>
          </div>
        )}
      </div>

      {/* Latest Services Section */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-16">
        <SectionTitle title="XİDMƏTLƏR" />
        
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {services.map(service => (
              <div 
                key={service.id}
                className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all flex flex-col h-full min-h-[350px]"
              >
                <img 
                  src={`https://picsum.photos/seed/${service.id}/600/800`} 
                  alt={service.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1b2353] via-[#1b2353]/80 to-transparent"></div>
                <div className="relative z-10 p-8 flex flex-col h-full">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {service.title}
                  </h3>
                  <p className="text-slate-200 text-lg mb-8 flex-1">
                    {service.description}
                  </p>
                  <div className="flex gap-4 mt-auto">
                    <a
                      href={service.redirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-medium transition-colors text-center flex-1"
                    >
                      Daxil ol
                    </a>
                    {service.tutorialUrl && (
                      <button
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded font-medium transition-colors text-center flex-1"
                      >
                        Təlimat
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex justify-center mt-12">
          <Link to="/services" className="bg-[#1b2353] hover:bg-blue-800 text-white px-8 py-3 rounded font-bold transition-colors">
            BÜTÜN XİDMƏTLƏRƏ BAX
          </Link>
        </div>
      </div>
    </div>
  );
}
