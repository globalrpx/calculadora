import type { QuoteInput, QuoteResult } from "@/lib/calculator/calculate-quote";

export type ClientQuoteRecord = QuoteInput &
  QuoteResult & {
    id: string;
    createdAt: string;
    status: string;
    images: string[];
    supplierContactImages: string[];
    supplierName?: string;
    supplierEmail?: string;
    supplierPhone?: string;
    hasSimulationRequest?: boolean;
  };

export type ClientQuotePayload = QuoteInput &
  QuoteResult & {
    id?: string;
    images: string[];
    supplierContactImages: string[];
    supplierName?: string;
    supplierEmail?: string;
    supplierPhone?: string;
  };

export type ClientSimulationRecord = {
  id: string;
  title: string;
  status: string;
  quoteFileUrl: string | null;
  createdAt: string;
  quote: {
    id: string;
    productName: string;
    hsCode: string | null;
  } | null;
};
