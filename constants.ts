import { CategoryStructure } from './types';

export const CATEGORIES: CategoryStructure = {
  'Desayuno': ['Desayuno dulce', 'Desayuno salado'],
  'Comida': [
    'Arroz', 
    'Carne blanca', 
    'Carne roja', 
    'Ensaladas', 
    'Legumbres', 
    'Pasta', 
    'Pescado', 
    'Salsas', 
    'Sopas y Pures', 
    'Verduras y Vegetales'
  ],
  'Merienda': ['Merienda dulce', 'Merienda salada'],
  'Cena': [
    'Carne blanca', 
    'Carne roja', 
    'Ensaladas', 
    'Pasta', 
    'Pescado', 
    'Sopas y Pures', 
    'Verduras y Vegetales'
  ],
  'Postre': ['Postres calientes', 'Postres fríos']
};

export const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Voice replacement map
export const VOICE_REPLACEMENTS: Record<string, string> = {
  ' k ': ' Kilo ',
  ' gr ': ' gramos ',
  ' l ': ' litros ',
  ' ml ': ' mililitros ',
};
