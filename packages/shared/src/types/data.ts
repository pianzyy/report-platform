export interface MacroData {
  gdp: number;
  gdpGrowth: number;
  cpi: number;
  pmi: number;
  m2Supply: number;
  m2Growth: number;
  lpr1y: number;
  lpr5y: number;
  unemploymentRate: number;
  period: string;
  source: string;
  fetchedAt: string;
}

export interface HousingPriceData {
  city: string;
  newHomePriceIndex: number;
  newHomePriceYoY: number;
  newHomePriceMoM: number;
  secondHandPriceIndex: number;
  secondHandPriceYoY: number;
  secondHandPriceMoM: number;
  period: string;
  source: string;
}

export interface TransactionData {
  city: string;
  period: string;
  newHomeTransactions: number;
  newHomeTransactionArea: number;
  secondHandTransactions: number;
  secondHandTransactionArea: number;
  transactionValue: number;
  avgPrice: number;
  avgPriceYoY: number;
  source: string;
}

export interface InventoryData {
  city: string;
  period: string;
  newHomeInventory: number;
  newHomeInventoryArea: number;
  secondHandListings: number;
  absorptionRate: number;
  deStockCycle: number;
  vacancyRate: number;
  source: string;
}

export interface LandAuctionData {
  city: string;
  period: string;
  landParcelsSold: number;
  landAreaSold: number;
  landRevenue: number;
  avgFloorPrice: number;
  premiumRate: number;
  source: string;
}

export interface PolicyData {
  id: string;
  title: string;
  summary: string;
  publishDate: string;
  effectiveDate: string;
  issuingBody: string;
  category: PolicyCategory;
  city: string;
  tags: string[];
  impactLevel: 'high' | 'medium' | 'low';
  impactDirection: 'positive' | 'negative' | 'neutral';
  fullText: string;
  source: string;
}

export enum PolicyCategory {
  PURCHASE_RESTRICTION = 'purchase_restriction',
  CREDIT = 'credit',
  TAX = 'tax',
  TRANSACTION = 'transaction',
  LAND = 'land',
  RENTAL = 'rental',
  DE_STOCK = 'de_stock',
  OTHER = 'other',
}

export const PolicyCategoryLabel: Record<PolicyCategory, string> = {
  [PolicyCategory.PURCHASE_RESTRICTION]: '限购政策',
  [PolicyCategory.CREDIT]: '信贷政策',
  [PolicyCategory.TAX]: '税收政策',
  [PolicyCategory.TRANSACTION]: '交易政策',
  [PolicyCategory.LAND]: '土地政策',
  [PolicyCategory.RENTAL]: '租赁政策',
  [PolicyCategory.DE_STOCK]: '去库存政策',
  [PolicyCategory.OTHER]: '其他',
};

export interface GongDiFangData {
  city: string;
  period: string;
  totalListings: number;
  avgDiscountRate: number;
  priceDiscountVsMarket: number;
  avgPrice: number;
  marketAvgPrice: number;
  propertyTypes: {
    type: string;
    count: number;
    avgDiscount: number;
  }[];
  districtDistribution: {
    district: string;
    count: number;
    avgPrice: number;
  }[];
  avgDaysOnMarket: number;
  transactionVolume: number;
  source: string;
}

export interface ScrapedData {
  macro?: MacroData[];
  housingPrices?: HousingPriceData[];
  transactions?: TransactionData[];
  inventory?: InventoryData[];
  landAuctions?: LandAuctionData[];
  policies?: PolicyData[];
  gongDiFang?: GongDiFangData[];
}
