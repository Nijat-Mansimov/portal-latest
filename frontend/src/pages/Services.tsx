import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, ExternalLink, Play, X, Shield } from 'lucide-react';
import { SectionTitle } from '../components/SectionTitle';

interface Service {
  id: string;
  title: string;
  description: string;
  redirectUrl: string;
  tutorialUrl: string;
}

export function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const headers: HeadersInit = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/services', { headers });
        if (!res.ok) throw new Error('Failed to fetch services');
        const data = await res.json();
        const mappedServices = data.map((s: any) => ({
          id: s.id || s.Id,
          title: s.title || s.Title || '',
          description: s.description || s.Description || '',
          redirectUrl: s.redirectUrl || s.RedirectUrl || '',
          tutorialUrl: s.tutorialUrl || s.TutorialUrl || ''
        }));
        setServices(mappedServices);
      } catch (err) {
        setError('Xidmətləri yükləmək mümkün olmadı.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [token]);

  const filteredServices = services.filter(s => 
    (s.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  if (error) return <div className="text-red-500 text-center py-12">{error}</div>;

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">
        <SectionTitle title="BÜTÜN XİDMƏTLƏR" />
        
        <div className="mb-8">
          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Xidmət axtar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map(service => (
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
                      onClick={() => setPreviewVideo(service.tutorialUrl)}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded font-medium transition-colors text-center flex-1"
                    >
                      Təlimat
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filteredServices.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500 dark:text-slate-400">
              Axtarışa uyğun xidmət tapılmadı.
            </div>
          )}
        </div>
      </div>

      {/* Video Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-950 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-semibold">Təlimat Videosu</h3>
              <button
                onClick={() => setPreviewVideo(null)}
                className="p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative pt-[56.25%] bg-black">
              <iframe
                src={previewVideo}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
