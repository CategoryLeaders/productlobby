import {
  Smartphone,
  Shirt,
  UtensilsCrossed,
  Home,
  Dumbbell,
  Sparkles,
  Zap,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react'

export interface CategoryDefinition {
  slug: string
  name: string
  description: string
  icon: string // lucide-react icon name
  gradientFrom: string // Tailwind color
  gradientTo: string // Tailwind color
  accentColor: string // Tailwind color
}

export const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  {
    slug: 'tech',
    name: 'Tech',
    description: 'Consumer electronics, software, gadgets, and digital innovation',
    icon: 'Smartphone',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-cyan-500',
    accentColor: 'blue-400',
  },
  {
    slug: 'fashion',
    name: 'Fashion',
    description: 'Apparel, footwear, accessories, and wearable fashion items',
    icon: 'Shirt',
    gradientFrom: 'from-pink-500',
    gradientTo: 'to-rose-500',
    accentColor: 'pink-400',
  },
  {
    slug: 'food_drink',
    name: 'Food & Drink',
    description: 'Beverages, snacks, recipes, and culinary experiences',
    icon: 'UtensilsCrossed',
    gradientFrom: 'from-orange-500',
    gradientTo: 'to-amber-500',
    accentColor: 'orange-400',
  },
  {
    slug: 'home',
    name: 'Home',
    description: 'Furniture, decor, kitchenware, and home improvement',
    icon: 'Home',
    gradientFrom: 'from-green-500',
    gradientTo: 'to-emerald-500',
    accentColor: 'green-400',
  },
  {
    slug: 'sports',
    name: 'Sports',
    description: 'Fitness equipment, athletic gear, and sports accessories',
    icon: 'Dumbbell',
    gradientFrom: 'from-red-500',
    gradientTo: 'to-orange-500',
    accentColor: 'red-400',
  },
  {
    slug: 'beauty',
    name: 'Beauty',
    description: 'Cosmetics, skincare, personal care, and wellness products',
    icon: 'Sparkles',
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-pink-500',
    accentColor: 'purple-400',
  },
  {
    slug: 'automotive',
    name: 'Automotive',
    description: 'Car accessories, automotive technology, and vehicle products',
    icon: 'Zap',
    gradientFrom: 'from-gray-600',
    gradientTo: 'to-slate-500',
    accentColor: 'gray-400',
  },
  {
    slug: 'other',
    name: 'Other',
    description: 'All other product categories and unique innovations',
    icon: 'MoreHorizontal',
    gradientFrom: 'from-indigo-500',
    gradientTo: 'to-violet-500',
    accentColor: 'indigo-400',
  },
]

/**
 * Get a category definition by slug
 */
export function getCategoryBySlug(slug: string): CategoryDefinition | undefined {
  return CATEGORY_DEFINITIONS.find((cat) => cat.slug === slug)
}

/**
 * Get all category definitions
 */
export function getAllCategories(): CategoryDefinition[] {
  return CATEGORY_DEFINITIONS
}

/**
 * Get the Lucide icon component for a category
 */
export function getCategoryIcon(categorySlug: string): LucideIcon {
  const category = getCategoryBySlug(categorySlug)
  if (!category) return MoreHorizontal

  const iconMap: { [key: string]: LucideIcon } = {
    Smartphone,
    Shirt,
    UtensilsCrossed,
    Home,
    Dumbbell,
    Sparkles,
    Zap,
    MoreHorizontal,
  }

  return iconMap[category.icon] || MoreHorizontal
}

/**
 * Check if a slug is a valid category
 */
export function isValidCategorySlug(slug: string): boolean {
  return CATEGORY_DEFINITIONS.some((cat) => cat.slug === slug)
}
