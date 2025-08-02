export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  lowStockThreshold: number;
  totalValue: number;
}
