export type CampaignCategory =
  | 'Disaster Relief'
  | 'Medical Assistance'
  | 'Educational Assistance'
  | 'Food and Basic Needs'
  | 'Community Assistance'
  | 'Emergency Relief'
  | 'Other';

export const CAMPAIGN_CATEGORIES: CampaignCategory[] = [
  'Disaster Relief',
  'Medical Assistance',
  'Educational Assistance',
  'Food and Basic Needs',
  'Community Assistance',
  'Emergency Relief',
  'Other',
];

/**
 * New campaigns start as "Active" (public right away). An administrator can
 * move a campaign to "Suspended" and back. The other statuses come from the
 * older approval process and are only kept so old data still loads.
 */
export type CampaignStatus =
  | 'Pending Approval'
  | 'Approved'
  | 'Rejected'
  | 'Active'
  | 'Completed'
  | 'Suspended';

/** Only campaigns with these statuses are shown publicly and can receive donations. */
export const PUBLIC_STATUSES: CampaignStatus[] = ['Active'];

/** Organizers may edit their campaign while it has one of these statuses. */
export const EDITABLE_STATUSES: CampaignStatus[] = ['Active'];

export interface Campaign {
  id: string;
  organizerId: string;
  organizerName: string;
  title: string;
  description: string;
  category: CampaignCategory;
  beneficiaryName: string;
  beneficiaryInfo: string;
  imageUrl: string; // empty string = no image
  goalAmount: number;
  startDate: string; // YYYY-MM-DD
  deadline: string; // YYYY-MM-DD
  status: CampaignStatus;
  locationAddress: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: string; // ISO date string
  verifiedTotal: number; // verified donations only
  verifiedDonorCount: number;
  rejectionReason: string; // the administrator's reason when a campaign is suspended
  reviewedBy: string; // admin uid, empty if never reviewed
  reviewedAt: string; // ISO date string, empty if never reviewed
}