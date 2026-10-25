import {
  equalTo,
  get,
  orderByChild,
  push,
  query,
  ref as dbRef,
  set,
  update,
} from 'firebase/database';
import type { DataSnapshot } from 'firebase/database';
import { rtdb } from '../firebase/config';
import type { AppUser } from '../models/User';
import type { Campaign, CampaignCategory } from '../models/Campaign';
import { PUBLIC_STATUSES } from '../models/Campaign';
import { notificationUpdate } from './notificationService';
import { auditUpdate } from './auditService';

/** The fields a campaign owner fills in on the campaign form. */
export interface CampaignFormData {
  title: string;
  description: string;
  category: CampaignCategory;
  beneficiaryName: string;
  beneficiaryInfo: string;
  imageUrl: string;
  goalAmount: number;
  startDate: string; // YYYY-MM-DD
  deadline: string; // YYYY-MM-DD
  locationAddress: string;
  latitude: number | null; // from the map pin, null when no pin was set
  longitude: number | null;
}

function isPermissionDenied(error: unknown): boolean {
  const code = String((error as { code?: string })?.code ?? '');
  const message = String((error as { message?: string })?.message ?? '');
  return (
    code.toUpperCase() === 'PERMISSION_DENIED' ||
    message.toUpperCase().includes('PERMISSION_DENIED')
  );
}

function friendlyError(error: unknown): Error {
  console.error('Campaign service error:', error);
  if (isPermissionDenied(error)) {
    return new Error(
      'Permission denied. You may not be allowed to do this, or the database rules have not been published.'
    );
  }
  const code = String((error as { code?: string })?.code ?? '');
  const message = String((error as { message?: string })?.message ?? '');
  return new Error(`Something went wrong (${code || message || 'unknown error'}). Please try again.`);
}

/** Realtime Database drops empty values, so fill in defaults for anything missing. */
function normalizeCampaign(id: string, data: Partial<Campaign>): Campaign {
  return {
    id,
    organizerId: data.organizerId ?? '',
    organizerName: data.organizerName ?? '',
    title: data.title ?? '',
    description: data.description ?? '',
    category: data.category ?? 'Other',
    beneficiaryName: data.beneficiaryName ?? '',
    beneficiaryInfo: data.beneficiaryInfo ?? '',
    imageUrl: data.imageUrl ?? '',
    goalAmount: data.goalAmount ?? 0,
    startDate: data.startDate ?? '',
    deadline: data.deadline ?? '',
    status: data.status ?? 'Active',
    locationAddress: data.locationAddress ?? '',
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    createdAt: data.createdAt ?? '',
    verifiedTotal: data.verifiedTotal ?? 0,
    verifiedDonorCount: data.verifiedDonorCount ?? 0,
    rejectionReason: data.rejectionReason ?? '',
    reviewedBy: data.reviewedBy ?? '',
    reviewedAt: data.reviewedAt ?? '',
  };
}

function snapshotToCampaigns(snapshot: DataSnapshot): Campaign[] {
  const list: Campaign[] = [];
  snapshot.forEach((child) => {
    list.push(normalizeCampaign(child.key as string, child.val() as Partial<Campaign>));
  });
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); // newest first
}

function roundCoordinate(value: number | null): number | null {
  return value === null ? null : Math.round(value * 1e6) / 1e6;
}

function cleanForm(form: CampaignFormData): CampaignFormData {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    category: form.category,
    beneficiaryName: form.beneficiaryName.trim(),
    beneficiaryInfo: form.beneficiaryInfo.trim(),
    imageUrl: form.imageUrl.trim(),
    goalAmount: form.goalAmount,
    startDate: form.startDate,
    deadline: form.deadline,
    locationAddress: form.locationAddress.trim(),
    latitude: roundCoordinate(form.latitude),
    longitude: roundCoordinate(form.longitude),
  };
}

/* ---------- Public (anyone can read active campaigns) ---------- */

/** Returns only campaigns that are open to the public (status "Active"). */
export async function getPublicCampaigns(): Promise<Campaign[]> {
  try {
    const snapshot = await get(
      query(dbRef(rtdb, 'campaigns'), orderByChild('status'), equalTo('Active'))
    );
    return snapshotToCampaigns(snapshot).filter((c) => PUBLIC_STATUSES.includes(c.status));
  } catch (error) {
    throw friendlyError(error);
  }
}

/** Returns one public campaign, or null if it does not exist or is not public. */
export async function getCampaignById(id: string): Promise<Campaign | null> {
  try {
    const snapshot = await get(dbRef(rtdb, `campaigns/${id}`));
    if (!snapshot.exists()) return null;
    const campaign = normalizeCampaign(id, snapshot.val() as Partial<Campaign>);
    return PUBLIC_STATUSES.includes(campaign.status) ? campaign : null;
  } catch (error) {
    // A campaign that is not public (or does not exist) cannot be read by strangers
    if (isPermissionDenied(error)) return null;
    throw friendlyError(error);
  }
}

/* ---------- Campaign owner ---------- */

/** All campaigns created by one person (any status). */
export async function getMyCampaigns(organizerId: string): Promise<Campaign[]> {
  try {
    const snapshot = await get(
      query(dbRef(rtdb, 'campaigns'), orderByChild('organizerId'), equalTo(organizerId))
    );
    return snapshotToCampaigns(snapshot);
  } catch (error) {
    throw friendlyError(error);
  }
}

/** Reads one full campaign record (the owner or an admin). */
export async function getCampaignRecord(id: string): Promise<Campaign | null> {
  try {
    const snapshot = await get(dbRef(rtdb, `campaigns/${id}`));
    if (!snapshot.exists()) return null;
    return normalizeCampaign(id, snapshot.val() as Partial<Campaign>);
  } catch (error) {
    if (isPermissionDenied(error)) return null;
    throw friendlyError(error);
  }
}

/** Creates a campaign. It is public ("Active") immediately. */
export async function createCampaign(form: CampaignFormData, organizer: AppUser): Promise<string> {
  try {
    const newRef = push(dbRef(rtdb, 'campaigns'));
    const id = newRef.key as string;

    const campaign: Campaign = {
      ...cleanForm(form),
      id,
      organizerId: organizer.uid,
      organizerName: organizer.displayName,
      status: 'Active',
      createdAt: new Date().toISOString(),
      verifiedTotal: 0,
      verifiedDonorCount: 0,
      rejectionReason: '',
      reviewedBy: '',
      reviewedAt: '',
    };

    await set(newRef, campaign);
    return id;
  } catch (error) {
    throw friendlyError(error);
  }
}

/** Saves edits to an active campaign. The totals and status cannot be changed here. */
export async function updateCampaign(existing: Campaign, form: CampaignFormData): Promise<void> {
  try {
    const updated: Campaign = {
      ...existing,
      ...cleanForm(form),
    };
    await set(dbRef(rtdb, `campaigns/${existing.id}`), updated);
  } catch (error) {
    throw friendlyError(error);
  }
}

/* ---------- Administrator ---------- */

/** All campaigns, any status (admin only). */
export async function getAllCampaigns(): Promise<Campaign[]> {
  try {
    const snapshot = await get(dbRef(rtdb, 'campaigns'));
    return snapshotToCampaigns(snapshot);
  } catch (error) {
    throw friendlyError(error);
  }
}

/** Suspends a campaign (it disappears from the public list) and notifies the owner. */
export async function suspendCampaign(
  campaign: Campaign,
  adminUid: string,
  reason: string
): Promise<void> {
  try {
    await update(dbRef(rtdb), {
      [`campaigns/${campaign.id}/status`]: 'Suspended',
      [`campaigns/${campaign.id}/rejectionReason`]: reason.trim(),
      [`campaigns/${campaign.id}/reviewedBy`]: adminUid,
      [`campaigns/${campaign.id}/reviewedAt`]: new Date().toISOString(),
      ...notificationUpdate(campaign.organizerId, {
        type: 'campaign',
        title: 'Campaign suspended',
        message: `Your campaign "${campaign.title}" was suspended. Reason: ${reason.trim()}`,
        link: '/organizer/campaigns',
      }),
      ...auditUpdate(
        'Suspended campaign',
        'campaign',
        campaign.id,
        `"${campaign.title}" - ${reason.trim()}`
      ),
    });
  } catch (error) {
    throw friendlyError(error);
  }
}

/** Puts a suspended campaign back online and notifies the owner. */
export async function reinstateCampaign(campaign: Campaign, adminUid: string): Promise<void> {
  try {
    await update(dbRef(rtdb), {
      [`campaigns/${campaign.id}/status`]: 'Active',
      [`campaigns/${campaign.id}/rejectionReason`]: '',
      [`campaigns/${campaign.id}/reviewedBy`]: adminUid,
      [`campaigns/${campaign.id}/reviewedAt`]: new Date().toISOString(),
      ...notificationUpdate(campaign.organizerId, {
        type: 'campaign',
        title: 'Campaign reinstated',
        message: `Your campaign "${campaign.title}" is public again.`,
        link: '/organizer/campaigns',
      }),
      ...auditUpdate('Reinstated campaign', 'campaign', campaign.id, `"${campaign.title}"`),
    });
  } catch (error) {
    throw friendlyError(error);
  }
}

