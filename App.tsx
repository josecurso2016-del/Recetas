import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { Layout } from './components/Layout';
import { RecipeProvider, useRecipes } from './context/RecipeContext';
import { CATEGORIES, DAYS_OF_WEEK } from './constants';
import { Recipe, MainCategory } from './types';
import { useVoiceInput } from './hooks/useVoiceInput';
import { 
  Coffee, Sun, Cookie, Moon, Cake, Star, 
  Utensils, Plus, Trash2, Edit2, Mic, Image as ImageIcon,
  Save, X, Download, Upload, AlertTriangle 
} from 'lucide-react';

/* --- Components for Screens --- */

// 1. Home Screen
const HomeScreen = () => {
  const navigate = useNavigate();
  
  const cards = [
    { title: 'Desayuno', icon: <Coffee size={32} />, color: 'bg-orange-100 text-orange-600', link: '/guide/Desayuno' },
    { title: 'Comida', icon: <Sun size={32} />, color: 'bg-yellow-100 text-yellow-600', link: '/guide/Comida' },
    { title: 'Merienda', icon: <Cookie size={32} />, color: 'bg-pink-100 text-pink-600', link: '/guide/Merienda' },
    { title: 'Cena', icon: <Moon size={32} />, color: 'bg-indigo-100 text-indigo-600', link: '/guide/Cena' },
    { title: 'Postre', icon: <Cake size={32} />, color: 'bg-purple-100 text-purple-600', link: '/guide/Postre' },
    { title: 'Mis Favoritos', icon: <Star size={32} />, color: 'bg-red-100 text-red-600', link: '/favorites' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {cards.map((card) => (
        <div 
          key={card.title}
          onClick={() => navigate(card.link)}
          className={`${card.color} dark:bg-opacity-20 p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center aspect-square cursor-pointer hover:scale-105 transition-transform`}
        >
          <div className="mb-4">{card.icon}</div>
          <h2 className="font-bold text-lg text-center">{card.title}</h2>
        </div>
      ))}
    </div>
  );
};

// 2. Guide Screen (Subcategories)
const GuideScreen = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const subcategories = category && CATEGORIES[category] ? CATEGORIES[category] : [];

  if (!category) return <div>Categoría no encontrada</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-primary">{category}</h2>
      <div className="grid grid-cols-1 gap-3">
        {subcategories.sort().map((sub) => (
          <button
            key={sub}
            onClick={() => navigate(`/list/${category}/${encodeURIComponent(sub)}`)}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <Utensils size={20} />
              </div>
              <span className="font-medium text-lg">{sub}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// 3. Recipe List Screen (Generic & Favorites)
const RecipeListScreen = ({ isFavorites = false }: { isFavorites?: boolean }) => {
  const { category, subcategory } = useParams();
  const decodedSub = subcategory ? decodeURIComponent(subcategory) : '';
  const navigate = useNavigate();
  const { recipes, toggleFavorite, deleteRecipe } = useRecipes();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredRecipes = isFavorites
    ? recipes.filter(r => r.isFavorite)
    : recipes.filter(r => r.category === category && r.subcategory === decodedSub);
  
  const sortedRecipes = filteredRecipes.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          {isFavorites ? 'Mis Favoritos' : decodedSub}
        </h2>
        {!isFavorites && (
          <button
            onClick={() => navigate(`/add/${category}/${encodeURIComponent(decodedSub || '')}`)}
            className="bg-primary text-white p-2 rounded-full shadow-lg hover:bg-emerald-600"
          >
            <Plus size={24} />
          </button>
        )}
      </div>

      {sortedRecipes.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          <p>No hay recetas guardadas aquí.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedRecipes.map((recipe) => (
            <div key={recipe.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden flex">
              <div 
                className="w-24 h-24 bg-gray-200 dark:bg-gray-700 flex-shrink-0 cursor-pointer"
                onClick={() => navigate(`/edit/${recipe.id}`)}
              >
                {recipe.image ? (
                  <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Utensils size={32} />
                  </div>
                )}
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <h3 onClick={() => navigate(`/edit/${recipe.id}`)} className="font-bold text-lg leading-tight cursor-pointer hover:text-primary">
                    {recipe.name}
                  </h3>
                  <button onClick={() => toggleFavorite(recipe.id)} className="text-yellow-500">
                    <Star size={20} fill={recipe.isFavorite ? "currentColor" : "none"} />
                  </button>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => setDeleteId(recipe.id)} className="text-red-500 p-1 hover:bg-red-50 rounded">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-sm">
            <h3 className="text-lg font-bold mb-2">¿Eliminar receta?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Esta acción no se puede deshacer directamente (requiere botón deshacer).</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300"
              >
                Cancelar
              </button>
              <button 
                onClick={() => { deleteRecipe(deleteId); setDeleteId(null); }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 4. Recipe Editor (Add/Edit)
const RecipeEditor = () => {
  const { recipeId, category, subcategory } = useParams();
  const navigate = useNavigate();
  const { recipes, addRecipe, updateRecipe } = useRecipes();
  
  const isEditing = !!recipeId;
  const existingRecipe = isEditing ? recipes.find(r => r.id === recipeId) : null;

  const [name, setName] = useState(existingRecipe?.name || '');
  const [ingredients, setIngredients] = useState(existingRecipe?.ingredients || '');
  const [preparation, setPreparation] = useState(existingRecipe?.preparation || '');
  const [image, setImage] = useState<string | null>(existingRecipe?.image || null);
  
  const { isListening, startListening, transcript } = useVoiceInput();
  const [activeField, setActiveField] = useState<'name' | 'ingredients' | 'preparation' | null>(null);

  // Update field when voice transcript changes
  useEffect(() => {
    if (transcript && activeField) {
      if (activeField === 'name') setName(prev => prev + (prev ? ' ' : '') + transcript);
      if (activeField === 'ingredients') setIngredients(prev => prev + '\n- ' + transcript);
      if (activeField === 'preparation') setPreparation(prev => prev + '\n' + transcript);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return alert('El nombre es obligatorio');

    const newRecipe: Recipe = {
      id: existingRecipe?.id || Date.now().toString(),
      name,
      category: existingRecipe?.category || category || '',
      subcategory: existingRecipe?.subcategory || decodeURIComponent(subcategory || '') || '',
      ingredients,
      preparation,
      image,
      isFavorite: existingRecipe?.isFavorite || false,
      timestamp: Date.now(),
    };

    if (isEditing) {
      updateRecipe(newRecipe);
    } else {
      addRecipe(newRecipe);
    }
    navigate(-1);
  };

  const toggleMic = (field: 'name' | 'ingredients' | 'preparation') => {
    if (isListening) {
      setActiveField(null);
    } else {
      setActiveField(field);
      startListening(() => {});
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <h2 className="text-2xl font-bold">{isEditing ? 'Editar Receta' : 'Nueva Receta'}</h2>
      
      {/* Name */}
      <div className="space-y-2">
        <label className="font-semibold block">Nombre de la receta</label>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className="flex-1 p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700"
            placeholder="Ej: Paella Valenciana"
          />
          <button 
            onClick={() => toggleMic('name')}
            className={`p-3 rounded-lg ${activeField === 'name' && isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            <Mic size={20} />
          </button>
        </div>
      </div>

      {/* Image */}
      <div className="space-y-2">
        <label className="font-semibold block">Imagen</label>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
            {image ? (
              <img src={image} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <Utensils className="text-gray-400" />
            )}
          </div>
          <label className="bg-secondary text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer">
            <ImageIcon size={20} />
            <span>Subir foto</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
          {image && <button onClick={() => setImage(null)} className="text-red-500">Eliminar</button>}
        </div>
      </div>

      {/* Ingredients */}
      <div className="space-y-2">
        <label className="font-semibold block">Ingredientes</label>
        <div className="relative">
          <textarea 
            value={ingredients} 
            onChange={(e) => setIngredients(e.target.value)}
            className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 h-32"
            placeholder="Lista de ingredientes..."
          />
          <button 
            onClick={() => toggleMic('ingredients')}
            className={`absolute right-2 bottom-2 p-2 rounded-full ${activeField === 'ingredients' && isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            <Mic size={18} />
          </button>
        </div>
      </div>

      {/* Preparation */}
      <div className="space-y-2">
        <label className="font-semibold block">Preparación</label>
        <div className="relative">
          <textarea 
            value={preparation} 
            onChange={(e) => setPreparation(e.target.value)}
            className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 h-48"
            placeholder="Pasos a seguir..."
          />
           <button 
            onClick={() => toggleMic('preparation')}
            className={`absolute right-2 bottom-2 p-2 rounded-full ${activeField === 'preparation' && isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            <Mic size={18} />
          </button>
        </div>
      </div>

      <button 
        onClick={handleSave}
        className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2"
      >
        <Save size={24} />
        Guardar Receta
      </button>
    </div>
  );
};

// 5. Search Results Screen
const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { recipes } = useRecipes();
  const navigate = useNavigate();

  const results = recipes.filter(r => r.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Resultados para "{query}"</h2>
      <div className="space-y-3">
        {results.map(r => (
           <div key={r.id} onClick={() => navigate(`/edit/${r.id}`)} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow cursor-pointer">
             <h3 className="font-bold">{r.name}</h3>
             <p className="text-sm text-gray-500">{r.category} &gt; {r.subcategory}</p>
           </div>
        ))}
        {results.length === 0 && <p>No se encontraron recetas.</p>}
      </div>
    </div>
  );
};

// 6. Shopping List Screen
const ShoppingListScreen = () => {
  const { shoppingList, addToShoppingList, toggleShoppingItem, removeShoppingItem } = useRecipes();
  const { isListening, startListening, transcript } = useVoiceInput();
  const [newItem, setNewItem] = useState('');

  // Add voice input to list automatically
  useEffect(() => {
    if (transcript && isListening) {
      addToShoppingList(transcript);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if(newItem.trim()) {
      addToShoppingList(newItem);
      setNewItem('');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Lista de Compras</h2>
      
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input 
          type="text" 
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Añadir producto..."
          className="flex-1 p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700"
        />
        <button type="submit" className="bg-secondary text-white p-3 rounded-lg"><Plus /></button>
        <button type="button" onClick={() => startListening(() => {})} className={`p-3 rounded-lg ${isListening ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
          <Mic />
        </button>
      </form>

      <ul className="space-y-2">
        {shoppingList.map(item => (
          <li key={item.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={item.isChecked} 
                onChange={() => toggleShoppingItem(item.id)}
                className="w-5 h-5 accent-primary"
              />
              <span className={item.isChecked ? 'line-through text-gray-400' : ''}>{item.name}</span>
            </div>
            <button onClick={() => removeShoppingItem(item.id)} className="text-red-500"><X size={18} /></button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// 7. Planner Screen
const PlannerScreen = () => {
  const { weeklyPlan, updateMealPlan } = useRecipes();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Plan Semanal</h2>
      <div className="space-y-6">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-l-4 border-primary">
            <h3 className="font-bold text-lg mb-3">{day}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold">Comida</label>
                <input 
                  type="text"
                  value={weeklyPlan[day]?.lunch || ''}
                  onChange={(e) => updateMealPlan(day, 'lunch', e.target.value)}
                  className="w-full mt-1 p-2 bg-gray-50 dark:bg-gray-700 rounded border-none"
                  placeholder="Planificar comida..."
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase font-bold">Cena</label>
                <input 
                  type="text"
                  value={weeklyPlan[day]?.dinner || ''}
                  onChange={(e) => updateMealPlan(day, 'dinner', e.target.value)}
                  className="w-full mt-1 p-2 bg-gray-50 dark:bg-gray-700 rounded border-none"
                  placeholder="Planificar cena..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 8. Settings Screen (Backup)
const SettingsScreen = () => {
  const { exportData, importData } = useRecipes();
  const [fileError, setFileError] = useState('');

  const handleDownload = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mi-menu-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const success = importData(result);
        if (success) {
          alert('Copia de seguridad restaurada correctamente');
          setFileError('');
        } else {
          setFileError('El archivo no es válido.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Ajustes y Seguridad</h2>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm space-y-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Download className="text-primary" />
          Exportar Datos
        </h3>
        <p className="text-sm text-gray-500">Guarda una copia de seguridad de tus recetas, listas y planes.</p>
        <button onClick={handleDownload} className="bg-primary text-white px-4 py-2 rounded-lg w-full">
          Descargar Backup
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm space-y-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Upload className="text-secondary" />
          Importar Datos
        </h3>
        <p className="text-sm text-gray-500">Restaura tus datos desde un archivo JSON previamente guardado.</p>
        <label className="block w-full">
          <span className="sr-only">Elegir archivo</span>
          <input 
            type="file" 
            accept=".json"
            onChange={handleUpload}
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-secondary file:text-white
              hover:file:bg-blue-600"
          />
        </label>
        {fileError && <p className="text-red-500 text-sm flex items-center gap-1"><AlertTriangle size={14} /> {fileError}</p>}
      </div>
    </div>
  );
};

// 9. Install Prompt Component
const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    });
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setDeferredPrompt(null);
        setIsVisible(false);
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-gray-900 text-white p-4 rounded-xl shadow-2xl flex justify-between items-center z-50">
      <div>
        <h4 className="font-bold">Instalar App</h4>
        <p className="text-xs text-gray-300">Añade Mi Menú a tu pantalla de inicio</p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setIsVisible(false)} className="text-gray-400 p-2">No</button>
        <button onClick={handleInstallClick} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold">Instalar</button>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <Router>
      <RecipeProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/guide/:category" element={<GuideScreen />} />
            <Route path="/list/:category/:subcategory" element={<RecipeListScreen />} />
            <Route path="/favorites" element={<RecipeListScreen isFavorites={true} />} />
            <Route path="/add/:category/:subcategory" element={<RecipeEditor />} />
            <Route path="/edit/:recipeId" element={<RecipeEditor />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/shopping" element={<ShoppingListScreen />} />
            <Route path="/planner" element={<PlannerScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
          </Routes>
          <InstallPrompt />
        </Layout>
      </RecipeProvider>
    </Router>
  );
};

export default App;
