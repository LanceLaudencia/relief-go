import type { CampaignStatus } from './Campaign';

export type ExpenseStatus = 'Pending Review' | 'Verified' | 'Rejected';

export type ExpenseCategory =
  | 'Food and Groceries'
  | 'Medicine and Medical'
  | 'School Supplies'
  | 'Transportation'
  | 'Shelter and Materials'
  | 'Other';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food and Groceries',
  'Medicine and Medical',
  'School Supplies',
  'Transportation',
  'Shelter and Materials',
  'Other',
];

export type DocumentType =
  | 'Receipt'
  | 'Invoice'
  | 'Photo of goods'
  | 'Acknowledgment receipt'
  | 'Other';

export const DOCUMENT_TYPES: DocumentType[] = [
  'Receipt',
  'Invoice',
  'Photo of goods',
  'Acknowledgment receipt',
  'Other',
];

/** The most supporting documents one expense can have. The database rules enforce the same number. */
export const MAX_DOCUMENTS = 8;

/** Organizers can add expenses only while their campaign has one of these statuses. */
export const EXPENSE_ALLOWED_CAMPAIGN_STATUSES: CampaignStatus[] = [
  'Approved',
  'Active',
  'Completed',
];

/** A supporting document, stored as a link (for example a Google Drive share link). */
export interface ExpenseDocument {
  type: DocumentType;
  url: string; // must start with https://
  label: string; // short note, may be empty
}

export interface Expense {
  id: string;
  campaignId: string;
  campaignTitle: string;
  organizerId: string;
  organizerName: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  expenseDate: string; // YYYY-MM-DD
  documents: ExpenseDocument[];
  status: ExpenseStatus;
  createdAt: string; // ISO date string
  reviewedBy: string; // admin uid, empty if not reviewed
  reviewDate: string; // ISO date string, empty if not reviewed
  rejectionReason: string;
}

/** What the public transparency report shows (verified expenses only). */
export interface PublicExpense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  expenseDate: string;
  documents: ExpenseDocument[];
  verifiedAt: string;
}