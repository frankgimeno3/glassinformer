export type TabId = 'news-portal' | 'magazine' | 'other-services';

export interface CartPricedItem {
  id: string;
  label: string;
  priceUsd: number;
  quantity?: number; // for items like newsletter banner (quantity × unit price)
}

export interface CartPendingItem {
  id: string;
  label: string;
}

export interface MediakitCartState {
  priced: CartPricedItem[];
  pending: CartPendingItem[];
}
