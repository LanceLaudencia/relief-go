import {
  equalTo,
  get,
  orderByChild,
  query,
  ref as dbRef,
  set,
  update,
} from 'firebase/database';
import type { DataSnapshot } from 'firebase/database';
import { rtdb } from '../firebase/config';
import type { AppUser } from '../models/User';
import type { Campaign } from '../models/Campaign';
import type { Donation, PaymentMethod, PublicDonor } from '../models/Donation';
import { formatPeso } from '../utils/format';
import { notificationUpdate } from './notificationService';
import { auditUpdate } from './auditService';

/** What the donor fills in on the donation form. */
export interface DonationFormData {
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  senderName: string;
  isAnonymous: boolean;
}

function friendlyError(error: unknown, permissionMessage?: string): Error {
  console.error('Donation service error:', error);
  const code = String((error as { code?: string })?.code ?? '');
  const message = String((error as { message?: string })?.message ?? '');
  const denied =
    code.toUpperCase() === 'PERMISSION_DENIED' ||
    message.toUpperCase().includes('PERMISSION_DENIED');

  if (denied) {
    return new Error(
      permissionMessage ??
        'Permission denied. You may not be allowed to do this, or the database rules have not been published.'
    );
  }
  return new Error(`Something went wrong (${code || message || 'unknown error'}). Please try again.`);
}

/** Keeps letters and digits only, in uppercase. "1234 567-890" becomes "1234567890". */
export function normalizeReference(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

/** Realtime Database drops empty values, so fill in defaults for anything missing. */
function normalizeDonation(id: string, data: Partial<Donation>): Donation {
  return {
    id,
    campaignId: data.campaignId ?? '',
    campaignTitle: data.campaignTitle ?? '',
    donorId: data.donorId ?? '',
    donorName: data.donorName ?? '',
    senderName: data.senderName ?? '',
    isAnonymous: data.isAnonymous ?? false,
    amount: data.amount ?? 0,
    paymentMethod: data.paymentMethod ?? 'Other',
    referenceNumber: data.referenceNumber ?? '',
    screenshotUrl: data.screenshotUrl ?? '',
    transactionDate: data.transactionDate ?? '',
    status: data.status ?? 'Pending Verification',
    verifiedBy: data.verifiedBy ?? '',
    verificationDate: data.verificationDate ?? '',
    rejectionReason: data.rejectionReason ?? '',
  };
}

function snapshotToDonations(snapshot: DataSnapshot): Donation[] {
  const list: Donation[] = [];
  snapshot.forEach((child) => {
    list.push(normalizeDonation(child.key as string, child.val() as Partial<Donation>));
  });
  return list.sort((a, b) => b.transactionDate.localeCompare(a.transactionDate)); // newest first
}

/* ---------- Donor ---------- */

/**
 * Submits a donation. It always starts as "Pending Verification".
 * The donation's key includes the reference number, so the same reference
 * cannot be submitted twice.
 */
export async function createDonation(
  campaign: Campaign,
  donor: AppUser,
  form: DonationFormData
): Promise<string> {
  const reference = normalizeReference(form.referenceNumber);
  const id = `${form.paymentMethod}_${reference}`;

  try {
    await set(dbRef(rtdb, `donations/${id}`), {
      id,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      donorId: donor.uid,
      donorName: donor.displayName,
      senderName: form.senderName.trim(),
      isAnonymous: form.isAnonymous,
      amount: form.amount,
      paymentMethod: form.paymentMethod,
      referenceNumber: reference,
      transactionDate: new Date().toISOString(),
      status: 'Pending Verification',
    });
    return id;
  } catch (error) {
    throw friendlyError(
      error,
      'The donation could not be submitted. This reference number may already have been used, the campaign may no longer accept donations, or it may be your own campaign.'
    );
  }
}

export async function getMyDonations(donorId: string): Promise<Donation[]> {
  try {
    const snapshot = await get(
      query(dbRef(rtdb, 'donations'), orderByChild('donorId'), equalTo(donorId))
    );
    return snapshotToDonations(snapshot);
  } catch (error) {
    throw friendlyError(error);
  }
}

/** Reads one donation (the donor who made it, or an admin). */
export async function getDonation(id: string): Promise<Donation | null> {
  try {
    const snapshot = await get(dbRef(rtdb, `donations/${id}`));
    if (!snapshot.exists()) return null;
    return normalizeDonation(id, snapshot.val() as Partial<Donation>);
  } catch (error) {
    throw friendlyError(error);
  }
}

/* ---------- Public ---------- */

/** The 10 most recent verified donors of a campaign (names respect privacy choices). */
export async function getPublicDonors(campaignId: string): Promise<PublicDonor[]> {
  try {
    const snapshot = await get(dbRef(rtdb, `publicDonations/${campaignId}`));
    const list: PublicDonor[] = [];
    snapshot.forEach((child) => {
      const data = child.val() as Partial<PublicDonor>;
      list.push({
        id: child.key as string,
        donorName: data.donorName ?? 'Anonymous',
        amount: data.amount ?? 0,
        verifiedAt: data.verifiedAt ?? '',
      });
    });
    return list.sort((a, b) => b.verifiedAt.localeCompare(a.verifiedAt)).slice(0, 10);
  } catch (error) {
    throw friendlyError(error);
  }
}

/* ---------- Administrator ---------- */

export async function getAllDonations(): Promise<Donation[]> {
  try {
    const snapshot = await get(dbRef(rtdb, 'donations'));
    return snapshotToDonations(snapshot);
  } catch (error) {
    throw friendlyError(error);
  }
}

/**
 * Recalculates a campaign's verified total and verified donor count from the
 * verified donations themselves, so the numbers can never drift.
 */
async function recalculateCampaignTotals(campaignId: string): Promise<void> {
  const snapshot = await get(
    query(dbRef(rtdb, 'donations'), orderByChild('campaignId'), equalTo(campaignId))
  );

  let total = 0;
  const donors = new Set<string>();
  snapshot.forEach((child) => {
    const donation = child.val() as Partial<Donation>;
    if (donation.status === 'Verified') {
      total += donation.amount ?? 0;
      if (donation.donorId) donors.add(donation.donorId);
    }
  });
  total = Math.round(total * 100) / 100;

  await update(dbRef(rtdb), {
    [`campaigns/${campaignId}/verifiedTotal`]: total,
    [`campaigns/${campaignId}/verifiedDonorCount`]: donors.size,
  });
}

export async function verifyDonation(donation: Donation, adminUid: string): Promise<void> {
  try {
    const current = await getDonation(donation.id);
    if (!current || current.status !== 'Pending Verification') {
      throw new Error('This donation has already been reviewed.');
    }

    const now = new Date().toISOString();
    await update(dbRef(rtdb), {
      [`donations/${current.id}/status`]: 'Verified',
      [`donations/${current.id}/verifiedBy`]: adminUid,
      [`donations/${current.id}/verificationDate`]: now,
      [`donations/${current.id}/rejectionReason`]: '',
      [`publicDonations/${current.campaignId}/${current.id}`]: {
        donorName: current.isAnonymous ? 'Anonymous' : current.donorName,
        amount: current.amount,
        verifiedAt: now,
      },
      ...notificationUpdate(current.donorId, {
        type: 'donation',
        title: 'Donation verified',
        message: `Your ${formatPeso(current.amount)} donation to "${current.campaignTitle}" was verified. Thank you!`,
        link: `/donor/donations/${current.id}`,
      }),
      ...auditUpdate(
        'Verified donation',
        'donation',
        current.id,
        `${formatPeso(current.amount)} to "${current.campaignTitle}" (ref ${current.referenceNumber})`
      ),
    });

    await recalculateCampaignTotals(current.campaignId);
  } catch (error) {
    if (error instanceof Error && error.message === 'This donation has already been reviewed.') {
      throw error;
    }
    throw friendlyError(error);
  }
}

export async function rejectDonation(
  donation: Donation,
  adminUid: string,
  reason: string
): Promise<void> {
  try {
    const current = await getDonation(donation.id);
    if (!current || current.status !== 'Pending Verification') {
      throw new Error('This donation has already been reviewed.');
    }

    await update(dbRef(rtdb), {
      [`donations/${current.id}/status`]: 'Rejected',
      [`donations/${current.id}/rejectionReason`]: reason.trim(),
      [`donations/${current.id}/verifiedBy`]: adminUid,
      [`donations/${current.id}/verificationDate`]: new Date().toISOString(),
      ...notificationUpdate(current.donorId, {
        type: 'donation',
        title: 'Donation rejected',
        message: `Your ${formatPeso(current.amount)} donation to "${current.campaignTitle}" could not be verified. Reason: ${reason.trim()}`,
        link: `/donor/donations/${current.id}`,
      }),
      ...auditUpdate(
        'Rejected donation',
        'donation',
        current.id,
        `${formatPeso(current.amount)} to "${current.campaignTitle}" (ref ${current.referenceNumber}) - ${reason.trim()}`
      ),
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'This donation has already been reviewed.') {
      throw error;
    }
    throw friendlyError(error);
  }
}

