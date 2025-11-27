import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Recipe, ShoppingItem, WeeklyPlan } from '../types';

interface RecipeContextType {
  recipes: Recipe[];
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  toggleFavorite: (id: string) => void;
  shoppingList: ShoppingItem[];
  addToShoppingList: (name: string) => void;
  toggleShoppingItem: (id: string) => void;
  removeShoppingItem: (id: string) => void;
  weeklyPlan: WeeklyPlan;
  updateMealPlan: (day: string, type: 'lunch' | 'dinner', value: string) => void;
  undoLastAction: () => void;
  importData: (jsonData: string) => boolean;
  exportData: () => string;
  canUndo: boolean;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export const RecipeProvider = ({ children }: { children: ReactNode }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>({});
  
  // Undo history stack (stores previous full state)
  const [history, setHistory] = useState<{recipes: Recipe[], shoppingList: ShoppingItem[], weeklyPlan: WeeklyPlan}[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    const savedRecipes = localStorage.getItem('recipes');
    const savedShopping = localStorage.getItem('shoppingList');
    const savedPlan = localStorage.getItem('weeklyPlan');

    if (savedRecipes) setRecipes(JSON.parse(savedRecipes));
    if (savedShopping) setShoppingList(JSON.parse(savedShopping));
    if (savedPlan) setWeeklyPlan(JSON.parse(savedPlan));
  }, []);

  // Save to local storage whenever state changes
  useEffect(() => {
    localStorage.setItem('recipes', JSON.stringify(recipes));
    localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
    localStorage.setItem('weeklyPlan', JSON.stringify(weeklyPlan));
  }, [recipes, shoppingList, weeklyPlan]);

  const saveToHistory = () => {
    setHistory(prev => [...prev, { recipes, shoppingList, weeklyPlan }].slice(-10)); // Keep last 10 states
  };

  const undoLastAction = () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setRecipes(lastState.recipes);
    setShoppingList(lastState.shoppingList);
    setWeeklyPlan(lastState.weeklyPlan);
    setHistory(prev => prev.slice(0, -1));
  };

  const addRecipe = (recipe: Recipe) => {
    saveToHistory();
    setRecipes(prev => [...prev, recipe]);
  };

  const updateRecipe = (updatedRecipe: Recipe) => {
    saveToHistory();
    setRecipes(prev => prev.map(r => r.id === updatedRecipe.id ? updatedRecipe : r));
  };

  const deleteRecipe = (id: string) => {
    saveToHistory();
    setRecipes(prev => prev.filter(r => r.id !== id));
  };

  const toggleFavorite = (id: string) => {
    // Intentionally not adding to history to avoid spamming undo stack for simple toggles, 
    // but can be added if requested.
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, isFavorite: !r.isFavorite } : r));
  };

  const addToShoppingList = (name: string) => {
    saveToHistory();
    const newItem: ShoppingItem = { id: Date.now().toString(), name, isChecked: false };
    setShoppingList(prev => [...prev, newItem]);
  };

  const toggleShoppingItem = (id: string) => {
    setShoppingList(prev => prev.map(item => item.id === id ? { ...item, isChecked: !item.isChecked } : item));
  };

  const removeShoppingItem = (id: string) => {
    saveToHistory();
    setShoppingList(prev => prev.filter(item => item.id !== id));
  };

  const updateMealPlan = (day: string, type: 'lunch' | 'dinner', value: string) => {
    saveToHistory();
    setWeeklyPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: value
      }
    }));
  };

  const exportData = () => {
    const data = { recipes, shoppingList, weeklyPlan };
    return JSON.stringify(data, null, 2);
  };

  const importData = (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.recipes && Array.isArray(data.recipes)) {
        saveToHistory();
        setRecipes(data.recipes);
        setShoppingList(data.shoppingList || []);
        setWeeklyPlan(data.weeklyPlan || {});
        return true;
      }
      return false;
    } catch (e) {
      console.error("Import failed", e);
      return false;
    }
  };

  return (
    <RecipeContext.Provider value={{
      recipes, addRecipe, updateRecipe, deleteRecipe, toggleFavorite,
      shoppingList, addToShoppingList, toggleShoppingItem, removeShoppingItem,
      weeklyPlan, updateMealPlan, undoLastAction, canUndo: history.length > 0,
      importData, exportData
    }}>
      {children}
    </RecipeContext.Provider>
  );
};

export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (!context) throw new Error("useRecipes must be used within a RecipeProvider");
  return context;
};