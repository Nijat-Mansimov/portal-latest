import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Calendar, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface NewsDetail {
  id: string;
  title: string;
  content: string;
  publishDate: string;
  coverImage: string;
  readers: { userId: string }[];
}

export function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [news, setNews] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingRead, setMarkingRead] = useState(false);
  const [hasRead, setHasRead] = useState(false);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        const headers: HeadersInit = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        const res = await fetch(`/api/news/${id}`, { headers, cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        
        setNews({
          id: data.id || data.Id,
          title: data.title || data.Title || '',
          content: data.content || data.Content || '',
          publishDate: data.publishDate || data.PublishDate || '',
          coverImage: data.coverImage || data.CoverImageUrl || data.coverImageUrl || '',
          readers: []
        });

        if (token) {
          const readRes = await fetch(`/api/news/${id}/check-read`, { headers, cache: 'no-store' });
          if (readRes.ok) {
            const readData = await readRes.json();
            setHasRead(readData.hasRead);
          }
        }
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError('Could not load article: ' + (err.message || 'Bilinməyən xəta'));
      } finally {
        setLoading(false);
      }
    };

    fetchNewsDetail();
  }, [id, token]);

  const handleMarkAsRead = async () => {
    if (!news || !user) return;
    setMarkingRead(true);
    try {
      const res = await fetch(`/api/news/${id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setHasRead(true);
      }
    } catch (err) {
      console.error('Failed to mark as read', err);
    } finally {
      setMarkingRead(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  if (error || !news) return <div className="text-red-500 text-center py-12">{error || 'Məqalə tapılmadı'}</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-12 py-8 space-y-8">
      <button
        onClick={() => navigate('/news')}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Xəbərlərə qayıt
      </button>

      <article className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="aspect-[21/9] w-full relative bg-slate-100 dark:bg-slate-800">
          <img
            src={news.coverImage}
            alt={news.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="p-8 md:p-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              <Calendar className="w-4 h-4" />
              {format(new Date(news.publishDate), 'MMMM d, yyyy')}
            </div>
            
            {user && (
              <button
                onClick={handleMarkAsRead}
                disabled={hasRead || markingRead}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  hasRead 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 cursor-default'
                    : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40'
                }`}
              >
                {hasRead ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Oxundu
                  </>
                ) : (
                  markingRead ? 'Qeyd edilir...' : 'Oxunmuş kimi qeyd et'
                )}
              </button>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">{news.title}</h1>
          
          <div className="prose prose-slate dark:prose-invert max-w-none">
            {(news.content || '').split('\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
