import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Users, X } from 'lucide-react';
import { format } from 'date-fns';

export function Admin() {
  const [activeTab, setActiveTab] = useState<'services' | 'news'>('services');
  const { token } = useAuth();
  
  return (
    <div className="max-w-6xl mx-auto px-6 md:px-12 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">İdarəetmə Paneli</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Portal məzmununu idarə edin və analitikaya baxın.</p>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('services')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'services' 
              ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Xidmətləri İdarə Et
        </button>
        <button
          onClick={() => setActiveTab('news')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'news' 
              ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Xəbərləri İdarə Et
        </button>
      </div>

      {activeTab === 'services' ? <ServicesAdmin token={token!} /> : <NewsAdmin token={token!} />}
    </div>
  );
}

function ServicesAdmin({ token }: { token: string }) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', redirectUrl: '', tutorialUrl: '' });

  const fetchServices = async () => {
    const res = await fetch('/api/services', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setServices(data);
    setLoading(false);
  };

  useEffect(() => { fetchServices(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/services/${editingId}` : '/api/services';
    const method = editingId ? 'PUT' : 'POST';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(formData)
    });
    
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ title: '', description: '', redirectUrl: '', tutorialUrl: '' });
    fetchServices();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Əminsiniz?')) {
      await fetch(`/api/services/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      fetchServices();
    }
  };

  const openEdit = (service: any) => {
    setEditingId(service.id || service.Id);
    setFormData({ 
      title: service.title || service.Title || '', 
      description: service.description || service.Description || '', 
      redirectUrl: service.redirectUrl || service.RedirectUrl || '', 
      tutorialUrl: service.tutorialUrl || service.TutorialUrl || '' 
    });
    setIsModalOpen(true);
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => { setEditingId(null); setFormData({ title: '', description: '', redirectUrl: '', tutorialUrl: '' }); setIsModalOpen(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Xidmət Əlavə Et
        </button>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-3 font-medium">Başlıq</th>
              <th className="px-6 py-3 font-medium">Təsvir</th>
              <th className="px-6 py-3 font-medium text-right">Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {services.map(s => (
              <tr key={s.id || s.Id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                <td className="px-6 py-4 font-medium">{s.title || s.Title}</td>
                <td className="px-6 py-4 text-slate-500 truncate max-w-xs">{s.description || s.Description}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => openEdit(s)} className="p-2 text-slate-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(s.id || s.Id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-950 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-semibold">{editingId ? 'Xidməti Redaktə Et' : 'Xidmət Əlavə Et'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Başlıq</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border rounded-md dark:bg-slate-900 dark:border-slate-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Təsvir</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2 border rounded-md dark:bg-slate-900 dark:border-slate-700" rows={3}></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Yönləndirmə URL-i</label>
                <input required type="url" value={formData.redirectUrl} onChange={e => setFormData({...formData, redirectUrl: e.target.value})} className="w-full p-2 border rounded-md dark:bg-slate-900 dark:border-slate-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Təlimat Videosu URL-i (Embed)</label>
                <input required type="url" value={formData.tutorialUrl} onChange={e => setFormData({...formData, tutorialUrl: e.target.value})} className="w-full p-2 border rounded-md dark:bg-slate-900 dark:border-slate-700" />
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">Ləğv et</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">Yadda saxla</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function NewsAdmin({ token }: { token: string }) {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analyticsId, setAnalyticsId] = useState<string | null>(null);
  const [readers, setReaders] = useState<any[]>([]);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', snippet: '', publishDate: '' });
  const [file, setFile] = useState<File | null>(null);

  const fetchNews = async () => {
    const res = await fetch('/api/news', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setNews(data);
    setLoading(false);
  };

  useEffect(() => { fetchNews(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/news/${editingId}` : '/api/news';
    const method = editingId ? 'PUT' : 'POST';
    
    const data = new FormData();
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('snippet', formData.snippet);
    if (formData.publishDate) data.append('publishDate', formData.publishDate);
    if (file) data.append('coverImage', file);
    
    await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: data
    });
    
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ title: '', content: '', snippet: '', publishDate: '' });
    setFile(null);
    fetchNews();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Əminsiniz?')) {
      await fetch(`/api/news/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      fetchNews();
    }
  };

  const openEdit = async (item: any) => {
    // Need to fetch full content for edit
    const res = await fetch(`/api/news/${item.id || item.Id}`, { headers: { Authorization: `Bearer ${token}` } });
    const fullItem = await res.json();
    
    setEditingId(fullItem.id || fullItem.Id);
    setFormData({ 
      title: fullItem.title || fullItem.Title || '', 
      content: fullItem.content || fullItem.Content || '', 
      snippet: (fullItem.content || fullItem.Content || '').substring(0, 150), 
      publishDate: fullItem.publishDate || fullItem.PublishDate || '' 
    });
    setFile(null);
    setIsModalOpen(true);
  };

  const viewAnalytics = async (id: string) => {
    const res = await fetch(`/api/news/${id}/readers`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setReaders(data);
    setAnalyticsId(id);
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => { setEditingId(null); setFormData({ title: '', content: '', snippet: '', publishDate: '' }); setFile(null); setIsModalOpen(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Xəbər Əlavə Et
        </button>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-3 font-medium">Başlıq</th>
              <th className="px-6 py-3 font-medium">Tarix</th>
              <th className="px-6 py-3 font-medium text-right">Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {news.map(n => (
              <tr key={n.id || n.Id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                <td className="px-6 py-4 font-medium">{n.title || n.Title}</td>
                <td className="px-6 py-4 text-slate-500">{format(new Date(n.publishDate || n.PublishDate), 'MMM d, yyyy')}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => viewAnalytics(n.id || n.Id)} className="p-2 text-slate-400 hover:text-green-600" title="Analytics"><Users className="w-4 h-4" /></button>
                  <button onClick={() => openEdit(n)} className="p-2 text-slate-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(n.id || n.Id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-950 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-semibold">{editingId ? 'Xəbəri Redaktə Et' : 'Xəbər Əlavə Et'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium mb-1">Başlıq</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border rounded-md dark:bg-slate-900 dark:border-slate-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Qısa məzmun</label>
                <textarea required value={formData.snippet} onChange={e => setFormData({...formData, snippet: e.target.value})} className="w-full p-2 border rounded-md dark:bg-slate-900 dark:border-slate-700" rows={2}></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Məzmun</label>
                <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full p-2 border rounded-md dark:bg-slate-900 dark:border-slate-700" rows={6}></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nəşr Tarixi (İstəyə bağlı)</label>
                <input type="datetime-local" value={formData.publishDate ? new Date(formData.publishDate).toISOString().slice(0, 16) : ''} onChange={e => setFormData({...formData, publishDate: new Date(e.target.value).toISOString()})} className="w-full p-2 border rounded-md dark:bg-slate-900 dark:border-slate-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Örtük Şəkli</label>
                <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full p-2 border rounded-md dark:bg-slate-900 dark:border-slate-700" />
              </div>
              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">Ləğv et</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">Yadda saxla</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {analyticsId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-950 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-semibold">Oxunma Analitikası</h3>
              <button onClick={() => setAnalyticsId(null)} className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {readers.length === 0 ? (
                <p className="text-slate-500 text-center py-4">Hələ oxucu yoxdur.</p>
              ) : (
                <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                  {readers.map((r, i) => (
                    <li key={i} className="py-3 flex justify-between items-center">
                      <span className="font-medium">{r.DisplayName || r.name || r.Username}</span>
                      <span className="text-sm text-slate-500">{format(new Date(r.ReadAt || r.readAt), 'MMM d, h:mm a')}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
