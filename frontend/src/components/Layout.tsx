import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Menu, X, Shield } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';

export function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const leftNavItems = [
    { name: 'Xidmətlər', path: '/services' },
  ];

  const rightNavItems = [
    { name: 'Xəbərlər', path: '/news' },
  ];

  if (user?.isAdmin) {
    rightNavItems.push({ name: 'İdarəetmə', path: '/admin' });
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] dark:bg-slate-900 text-slate-900 dark:text-slate-50 flex flex-col font-sans transition-colors duration-200">
      {/* Top Bar */}
      <div className="bg-[#1b2353] text-white py-4 hidden md:block border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 md:px-12 flex justify-between items-center text-sm">
          <div className="flex items-center gap-5 lg:gap-6">
            <div className="w-20 h-20 shrink-0 rounded-full overflow-hidden border-2 border-white/20 bg-slate-400">
               <img src="/haydar_aliyev.jpg" alt="Ümummilli Lider Heydər Əliyev" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="italic text-sm lg:text-[15px] max-w-2xl text-slate-300 leading-snug">
              "Dövlət orqanlarının, hər bir təşkilatın səmərəli işləməsi üçün<br/>rabitə çox mühüm bir vasitədir."<br/>
              <div className="mt-1"><span className="font-bold text-white not-italic">Ümummilli Lider Heydər Əliyev</span></div>
            </div>
          </div>
          <div className="font-bold text-right max-w-sm leading-tight text-sm tracking-wide shrink-0">
            AZƏRBAYCAN RESPUBLİKASI MÜDAFİƏ NAZİRLİYİ<br/>KİBERTƏHLÜKƏSİZLİK XİDMƏTİ
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <header className="bg-white dark:bg-slate-950 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between md:justify-center relative">
          
          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-[#1b2353] dark:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Desktop Nav Left */}
          <nav className="hidden md:flex flex-1 justify-end items-center gap-8 font-bold text-[#1b2353] dark:text-slate-200 text-[15px]">
            {leftNavItems.map((item, idx) => (
              <Link
                key={idx}
                to={item.path}
                className={cn(
                  "hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
                  location.pathname === item.path && "text-blue-600 dark:text-blue-400"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Center Logo */}
          <Link to="/" className="md:mx-12 w-28 h-28 bg-white dark:bg-slate-950 rounded-full border-4 border-[#f4f6f9] dark:border-slate-900 shadow-lg flex items-center justify-center relative md:-bottom-4 z-10 shrink-0 overflow-hidden">
             <img src="/state-logo.png" alt="Logo" className="w-full h-full object-cover p-1" onError={(e) => { e.currentTarget.src = 'https://picsum.photos/seed/logo/200/200'; }} />
          </Link>

          {/* Desktop Nav Right */}
          <nav className="hidden md:flex flex-1 justify-start items-center gap-8 font-bold text-[#1b2353] dark:text-slate-200 text-[15px]">
            {rightNavItems.map((item, idx) => (
              <Link
                key={idx}
                to={item.path}
                className={cn(
                  "hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
                  location.pathname === item.path && "text-blue-600 dark:text-blue-400"
                )}
              >
                {item.name}
              </Link>
            ))}
            
            <div className="flex items-center gap-4 border-l border-slate-200 dark:border-slate-800 pl-6 ml-auto">
              <button onClick={logout} className="text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase">
                Çıxış
              </button>
              <button onClick={toggleTheme} className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-[#1b2353] dark:hover:text-white transition-colors">
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 space-y-4 shadow-lg absolute w-full left-0">
            <nav className="flex flex-col gap-3 font-bold text-[#1b2353] dark:text-slate-200">
              {[...leftNavItems, ...rightNavItems].map((item, idx) => (
                <Link
                  key={idx}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-2 py-1 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 mt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-2">
                <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="text-red-600 dark:text-red-400 uppercase">
                  Çıxış
                </button>
                <button onClick={toggleTheme} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 w-full pb-12">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#1b2353] text-white pt-16 pb-8 border-t-4 border-blue-600">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-white rounded-full p-1 shrink-0 flex items-center justify-center">
                  <img src="/state-logo.png" alt="Logo" className="w-full h-full object-contain rounded-full" onError={(e) => { e.currentTarget.src = 'https://picsum.photos/seed/logo/200/200'; }} />
                </div>
                <div className="font-bold text-sm md:text-base leading-tight tracking-wide">
                  AZƏRBAYCAN RESPUBLİKASI MÜDAFİƏ NAZİRLİYİ<br/>KİBERTƏHLÜKƏSİZLİK XİDMƏTİ
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed max-w-md">
                Dövlət orqanlarının və təşkilatların səmərəli işləməsi üçün rabitə və kibertəhlükəsizlik mühüm vasitədir. Biz rəqəmsal məkanın təhlükəsizliyini təmin edirik.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-6 border-b border-white/20 pb-2 inline-block">Sürətli Keçidlər</h3>
              <ul className="space-y-3 text-sm text-slate-300">
                <li><Link to="/" className="hover:text-blue-400 transition-colors">Ana Səhifə</Link></li>
                <li><Link to="/services" className="hover:text-blue-400 transition-colors">Xidmətlər</Link></li>
                <li><Link to="/news" className="hover:text-blue-400 transition-colors">Xəbərlər</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-6 border-b border-white/20 pb-2 inline-block">Əlaqə</h3>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5">📍</span>
                  <span>Bakı şəhəri, Azərbaycan Respublikası</span>
                </li>
                <li className="flex items-center gap-3">
                  <span>📞</span>
                  <span>+994 12 000 00 00</span>
                </li>
                <li className="flex items-center gap-3">
                  <span>✉️</span>
                  <span>info@mod.gov.az</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
            <p>&copy; {new Date().getFullYear()} Azərbaycan Respublikası Müdafiə Nazirliyi Kibertəhlükəsizlik Xidməti. Bütün hüquqlar qorunur.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">Məxfilik Siyasəti</a>
              <a href="#" className="hover:text-white transition-colors">İstifadə Şərtləri</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
