export type TabId = 'portal' | 'magazine' | 'dem';

export interface MediakitCatalogRow {
  service_id: string;
  service_full_name: string;
  service_unit_price: number;
  service_group_channel: string;
  service_group_name: string | null;
}

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
