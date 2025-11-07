export type MealType = 'breakfast' | 'lunch' | 'snack';

export interface MenuItem {
  id: string;
  mealType: MealType;
  title: string;
  description: string;
  calories: number;
  isVeg: boolean;
  tags: string[];
}

export interface MenuDay {
  date: string;
  items: MenuItem[];
}

export interface MealToggle {
  mealType: MealType;
  attending: boolean;
  specialRequest?: string;
}

export interface MealSelection {
  userId: string;
  date: string;
  meals: MealToggle[];
  confirmedAt: string;
}

export interface UserPreference {
  userId: string;
  dietaryPreference: 'standard' | 'vegetarian' | 'vegan' | 'jain';
  allergyNotes: string[];
  additionalNotes?: string;
  autoOptIn: boolean;
}

export interface AttendanceSummary {
  date: string;
  totals: Record<MealType, number>;
  dropOffRate: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'admin';
  department: string;
  passwordHash: string;
}
