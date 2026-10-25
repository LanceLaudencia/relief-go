export type PaymentMethod = 'GCash' | 'Maya' | 'Other';

export const PAYMENT_METHODS: PaymentMethod[] = ['GCash', 'Maya', 'Other'];

export type DonationStatus =
  | 'Pending Verification'
  | 'Verified'
  | 'Rejected'
  | 'Refunded';

/** Donation limits in pesos. The database rules enforce the same numbers. */
export const MIN_DONATION = 20;
export const MAX_DONATION = 500000;

export interface Donation {
  id: string; // "<paymentMethod>_<referenceNumber>", which also blocks duplicates
  campaignId: string;
  campaignTitle: string;
  donorId: string;
  donorName: string;
  senderName: string; // name on the GCash/Maya account used to pay
  isAnonymous: boolean; // true = hide the donor's name publicly
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber: string; // uppercase letters and digits only
  screenshotUrl: string; // empty until screenshot uploads are added
  transactionDate: string; // ISO date string (when it was submitted)
  status: DonationStatus;
  verifiedBy: string; // admin uid, empty if not reviewed
  verificationDate: string; // ISO date string, empty if not reviewed
  rejectionReason: string;
}

/** What the public donor list shows on a campaign page. */
export interface PublicDonor {
  id: string;
  donorName: string; // "Anonymous" when the donor chose to hide their name
  amount: number;
  verifiedAt: string;
}