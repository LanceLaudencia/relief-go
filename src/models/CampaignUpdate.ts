import type { CampaignStatus } from './Campaign';

/** Campaign owners can post updates only while their campaign has one of these statuses. */
export const UPDATE_ALLOWED_CAMPAIGN_STATUSES: CampaignStatus[] = [
  'Approved',
  'Active',
  'Completed',
];

export interface CampaignUpdate {
  id: string;
  campaignId: string;
  organizerId: string;
  organizerName: string;
  title: string;
  message: string;
  imageUrl: string; // empty when there is no photo
  createdAt: string; // ISO date string
}