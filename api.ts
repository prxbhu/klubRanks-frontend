const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://192.168.1.12:8080';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(text || 'Request failed', res.status);
  }

  // some endpoints may return empty body
  const contentLength = res.headers.get('content-length');
  if (contentLength === '0' || res.status === 204) {
    return {} as T;
  }

  return res.json();
}

// -------- Auth --------

export interface LoginResponse {
  message: string;
  token: string;
  user: {
      id: number;
      username: string;
      avatar_id: string;
  };
}

export async function loginApi(
  username: string,
  password: string,
): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/login', {
    method: 'POST',
    body: JSON.stringify({
      username,
      password,
    }),
  });
}

export async function signupApi(
  username: string,
  password: string,
  avatarId = 'default',
) {
  return apiFetch<{ message: string }>('/signup', {
    method: 'POST',
    body: JSON.stringify({ username, password, avatar_id: avatarId }),
  });
}

export async function updateAvatarApi(token: string, avatarId: string) {
  return apiFetch<{ message: string }>(
    '/users/avatar',
    {
      method: 'PUT',
      body: JSON.stringify({ avatar_id: avatarId }),
    },
    token,
  );
}

// -------- Clubs --------

export interface BackendClub {
  id: number;
  name: string;
  description?: string | null;
  is_private: boolean;
  number_of_members: number;
  created_by: number;
  created_at: string;
  code: string;
  current_rank: number;
  action: string;
}

export async function getMyClubsApi(
  token: string,
): Promise<BackendClub[]> {
  return apiFetch<BackendClub[]>('/clubs', { method: 'GET' }, token);
}

export async function createClubApi(
  token: string,
  payload: { name: string; description?: string; is_private?: boolean; action: string },
): Promise<BackendClub> {
  return apiFetch<BackendClub>(
    '/clubs',
    {
      method: 'POST',
      body: JSON.stringify({
        name: payload.name,
        description: payload.description ?? null,
        is_private: payload.is_private ?? false,
        action: payload.action ?? "units",
      }),
    },
    token,
  );
}

// THIS FUNCTION WAS MISSING
export async function updateClubApi(
  token: string,
  clubId: string,
  payload: { name: string; description?: string; is_private?: boolean; action: string },
): Promise<BackendClub> {
  return apiFetch<BackendClub>(
    `/clubs/${clubId}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        name: payload.name,
        description: payload.description ?? null,
        is_private: payload.is_private ?? false,
        action: payload.action,
      }),
    },
    token,
  );
}

export async function addMemberApi(token: string, clubCode: string) {
  return apiFetch<{ message: string }>(
    `/clubs/join/${clubCode}`, // Updated to new route
    { method: 'POST' },
    token,
  );
}

export async function leaveClubApi(token: string, clubId: string) {
  return apiFetch<{ message: string }>(
    `/clubs/${clubId}/members`,
    { method: 'DELETE' },
    token,
  );
}

// -------- Leaderboard / Stats --------

export interface LeaderboardUser {
  id: number;
  username: string;
  avatar_id: string;
}

export interface LeaderboardEntry {
  user: LeaderboardUser;
  score: number;
  current_streak: number;
  longest_streak: number;
  last_checkedin?: string | null;
}

export async function getLeaderboardApi(
  token: string,
  clubId: string,
  limit = 50,
): Promise<LeaderboardEntry[]> {
  return apiFetch<LeaderboardEntry[]>(
    `/clubs/${clubId}/leaderboard?limit=${limit}`,
    { method: 'GET' },
    token,
  );
}

export async function updateLeaderboardScoreApi(
  token: string,
  clubId: string,
) {
  return apiFetch<{ message: string }>(
    `/clubs/${clubId}/leaderboard/score`,
    { method: 'POST' },
    token,
  );
}

export async function getUserStatsApi(token: string, clubId: string) {
    return apiFetch<any>(`/clubs/${clubId}/stats/me`, { method: 'GET' }, token);
}

// -------- Messages --------

export interface BackendClubMessage {
  user: LeaderboardUser;
  message: string;
  timestamp: string;
  type: string;
}

export async function getClubMessagesApi(
  token: string,
  clubId: string,
  limit = 50,
  offset = 0,
): Promise<BackendClubMessage[]> {
  return apiFetch<BackendClubMessage[]>(
    `/clubs/${clubId}/messages?limit=${limit}&offset=${offset}`,
    { method: 'GET' },
    token,
  );
}

export async function sendMessageApi(
  token: string,
  clubId: string,
  text: string,
) {
  return apiFetch<{ message: string }>(
    `/clubs/${clubId}/messages`,
    {
      method: 'POST',
      body: JSON.stringify({ message: text }),
    },
    token,
  );
}