export interface Recipe {
  id: string;
  name: string;
  category: string; // e.g., "Comida"
  subcategory: string; // e.g., "Arroz"
  image: string | null; // Base64 or URL
  ingredients: string;
  preparation: string;
  isFavorite: boolean;
  timestamp: number;
}

export interface ShoppingItem {
  id: string;
  name: string;
  isChecked: boolean;
}

export interface WeeklyPlan {
  [day: string]: {
    lunch: string;
    dinner: string;
  };
}

export type MainCategory = 'Desayuno' | 'Comida' | 'Merienda' | 'Cena' | 'Postre' | 'Favoritos';

export interface CategoryStructure {
  [key: string]: string[];
}
