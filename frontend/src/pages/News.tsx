import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SectionTitle } from '../components/SectionTitle';

interface NewsItem {
  id: string;
  title: string;
  snippet: string;
  publishDate: string;
  coverImage: string;
}

export function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const headers: HeadersInit = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/news', { headers });
        if (!res.ok) throw new Error('Failed to fetch news');
        const data = await res.json();
        const mappedNews = data.map((s: any) => ({
          id: s.id || s.Id,
          title: s.title || s.Title || '',
          snippet: (s.content || s.Content || '').substring(0, 150) + '...',
          publishDate: s.publishDate || s.PublishDate || '',
          coverImage: s.coverImage || s.CoverImageUrl || s.coverImageUrl || ''
        }));
        setNews(mappedNews);
      } catch (err) {
        setError('Xəbərləri yükləmək mümkün olmadı.');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [token]);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  if (error) return <div className="text-red-500 text-center py-12">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-12 py-8">
      <SectionTitle title="XƏBƏRLƏR" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {news.map(item => (
          <Link
            key={item.id}
            to={`/news/${item.id}`}
            className="bg-white dark:bg-slate-950 shadow-md hover:shadow-xl transition-shadow flex flex-col h-full rounded-sm overflow-hidden group"
          >
            <div className="aspect-[4/3] w-full overflow-hidden relative">
              <img
                src={item.coverImage}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-lg font-bold text-[#1b2353] dark:text-white mb-3 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 flex-1 line-clamp-3">
                {item.snippet}
              </p>
              <div className="mt-auto flex items-center font-bold text-sm text-[#1b2353] dark:text-blue-400">
                ƏTRAFLI <span className="ml-2 text-lg leading-none">&rarr;</span>
              </div>
            </div>
          </Link>
        ))}
        {news.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500 dark:text-slate-400">
            Xəbər tapılmadı.
          </div>
        )}
      </div>
    </div>
  );
}
