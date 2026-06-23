/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  category: 'salve' | 'soap' | 'cream' | 'perfume' | 'candle';
  categoryLabel: string;
  description: string;
  detailedDescription: string;
  priceValue: number;
  price: string;
  image: string;
  tags: string[];
  ingredients: string[];
  usage: string;
  features: string[];
  isOriginalPhoto?: boolean; // True if it directly matches user's uploaded image style
  originalPhotoDescription?: string;
}

export interface DIYIngredient {
  id: string;
  name: string;
  type: 'base' | 'oil' | 'purpose';
  description: string;
  benefit: string;
  color: string; // for dynamic aesthetic styling of our bottle preview
}

export interface CartItem {
  id: string; // Product ID or unique DIY key
  name: string;
  price: number;
  quantity: number;
  image: string;
  categoryLabel: string;
  isCustomDIY?: boolean;
  diyDetails?: {
    base: string;
    oils: string[];
    purpose: string;
  };
}
