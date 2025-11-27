import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, ShoppingCart, Calendar, Settings, ChevronLeft, Search } from 'lucide-react';
import { useRecipes } from '../context/RecipeContext';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { canUndo, undoLastAction } = useRecipes();
  const [searchTerm, setSearchTerm] = useState('');

  const isHome = location.pathname === '/';
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-50 dark:bg-gray-900 border-x border-gray-200 dark:border-gray-800 shadow-xl">
      {/* Header */}
      <header className="bg-primary text-white p-4 shadow-md z-10 sticky top-0">
        <div className="flex items-center justify-between mb-2">
          {!isHome ? (
            <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/20 rounded-full">
              <ChevronLeft size={28} />
            </button>
          ) : (
            <div className="w-8"></div> // Spacer
          )}
          <h1 className="text-xl font-bold truncate">
            {isHome ? 'Mi Menúv2' : 'Mi Menú'}
          </h1>
          {canUndo ? (
             <button onClick={undoLastAction} className="text-xs bg-white text-primary px-2 py-1 rounded font-bold">
               Deshacer
             </button>
          ) : (
            <div className="w-8"></div>
          )}
        </div>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative">
          <input 
            type="text" 
            placeholder="Buscar recetas..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 pl-10 pr-4 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </form>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 scroll-smooth">
        {children}
      </main>

      {/* Persistent Footer Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 pb-safe">
        <ul className="flex justify-around items-center">
          <li>
            <Link to="/" className={`flex flex-col items-center p-2 rounded-lg ${location.pathname === '/' ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}>
              <Home size={24} />
              <span className="text-xs mt-1">Inicio</span>
            </Link>
          </li>
          <li>
            <Link to="/planner" className={`flex flex-col items-center p-2 rounded-lg ${location.pathname === '/planner' ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}>
              <Calendar size={24} />
              <span className="text-xs mt-1">Plan</span>
            </Link>
          </li>
          <li>
            <Link to="/shopping" className={`flex flex-col items-center p-2 rounded-lg ${location.pathname === '/shopping' ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}>
              <ShoppingCart size={24} />
              <span className="text-xs mt-1">Lista</span>
            </Link>
          </li>
          <li>
            <Link to="/settings" className={`flex flex-col items-center p-2 rounded-lg ${location.pathname === '/settings' ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}>
              <Settings size={24} />
              <span className="text-xs mt-1">Ajustes</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};
