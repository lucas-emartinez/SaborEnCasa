// constants/categoryImages.ts
import { FoodCategory, Cuisine } from '@/types/enums';

export const FOOD_CATEGORY_IMAGES: Record<FoodCategory, any> = {
  [FoodCategory.VEGETABLES]: require('@/assets/images/categories/vegetables.png'),
  [FoodCategory.FRUITS]: require('@/assets/images/categories/fruits.png'),
  [FoodCategory.MEAT]: require('@/assets/images/categories/meat.png'),
  [FoodCategory.FISH]: require('@/assets/images/categories/fish.png'),
  [FoodCategory.DAIRY]: require('@/assets/images/categories/dairy.png'),
  [FoodCategory.GRAINS]: require('@/assets/images/categories/grains.png'),
  [FoodCategory.LEGUMES]: require('@/assets/images/categories/legumes.webp'),
  [FoodCategory.SNACKS]: require('@/assets/images/categories/snacks.jpg'),
};

export const CUISINE_IMAGES: Record<Cuisine, any> = {
  [Cuisine.CHINESE]: require('@/assets/images/cuisines/chinese.jpg'),
  [Cuisine.JAPANESE]: require('@/assets/images/cuisines/japanese.webp'),
  [Cuisine.MEXICAN]: require('@/assets/images/cuisines/mexican.jpg'),
  [Cuisine.ITALIAN]: require('@/assets/images/cuisines/italian.jpeg'),
  [Cuisine.FASTFOOD]: require('@/assets/images/cuisines/fast.jpg'),
  [Cuisine.MEDITERRANEAN]: require('@/assets/images/cuisines/mediterranean.webp'),
  [Cuisine.VEGGIE]: require('@/assets/images/cuisines/veggie.jpg'),
  [Cuisine.BAKERY]: require('@/assets/images/cuisines/bakery.jpg'),
  [Cuisine.INTERNATIONAL]: require('@/assets/images/cuisines/international.jpg'),
};