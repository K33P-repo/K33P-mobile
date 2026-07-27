// Next-Of-Kin (NOK) API client.
//
// Talks to the K33P backend's /api/nok endpoints. The backend is the admin of
// the Midnight NOK contract and submits register / approve transactions on the
// user's behalf — the mobile app never touches the contract or admin secret.
//
// Mapping (see Contract/NOK-DEPLOYMENT.md §10):
//   userId        -> owner_identifier = ownerIdentifierToField(userId)
//   nokIdentifier -> nok_hash        = nokHashToField(nokIdentifier)

import { useAuthStore } from '@/store/useAuthMethod';

// Keep consistent with the rest of the app (services/walletFoldersAPI.ts).
const API_BASE_URL = 'http://localhost:3000/api';

export interface NokResult {
  userId: string;
  ownerIdentifier: string;
  registered?: boolean;
  approved?: boolean;
}

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: { code?: string; message?: string };
}

const getAuthToken = (): string => {
  const token = useAuthStore.getState().token;
  if (!token) {
    throw new Error('No authentication token found');
  }
  return token;
};

const parse = async <T>(response: Response): Promise<T> => {
  const body = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || body.success === false) {
    throw new Error(body.error?.message || body.message || `Request failed (${response.status})`);
  }
  return body.data as T;
};

/**
 * Register a next-of-kin for the currently authenticated user.
 * The owner is derived from the auth token on the backend.
 */
export const registerNok = async (nokIdentifier: string): Promise<NokResult> => {
  const authToken = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/nok/register`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nokIdentifier }),
  });
  return parse<NokResult>(response);
};

/**
 * Approve a NOK-initiated login. Public endpoint: the next-of-kin is not logged
 * in as the owner, so we pass the owner's K33P userId + the NOK identifier.
 * Returns true when the stored hash matches (login allowed).
 */
export const approveNokLogin = async (
  userId: string,
  nokIdentifier: string,
): Promise<boolean> => {
  const response = await fetch(`${API_BASE_URL}/nok/approve-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, nokIdentifier }),
  });
  try {
    const result = await parse<NokResult>(response);
    return Boolean(result.approved);
  } catch {
    // Backend returns ACCESS_DENIED (non-2xx) when not approved.
    return false;
  }
};

/** Check whether a K33P user has a registered next-of-kin. */
export const checkNokRegistered = async (userId: string): Promise<boolean> => {
  const response = await fetch(`${API_BASE_URL}/nok/check/${encodeURIComponent(userId)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const result = await parse<NokResult>(response);
  return Boolean(result.registered);
};
