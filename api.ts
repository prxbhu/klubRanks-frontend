const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080';

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }

  // Safe JSON parsing
  try {
    const text = await res.text();
    return text ? JSON.parse(text) : ({} as T);
  } catch {
    return {} as T;
  }
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
      avatar_id: 'default',
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

// -------- Auth --------

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
}

export async function getMyClubsApi(
  token: string,
): Promise<BackendClub[]> {
  return apiFetch<BackendClub[]>('/clubs', { method: 'GET' }, token);
}

export async function createClubApi(
  token: string,
  payload: { name: string; description?: string; is_private?: boolean },
): Promise<BackendClub> {
  return apiFetch<BackendClub>(
    '/clubs',
    {
      method: 'POST',
      body: JSON.stringify({
        name: payload.name,
        description: payload.description ?? null,
        is_private: payload.is_private ?? false,
      }),
    },
    token,
  );
}

export async function addMemberApi(token: string, clubId: string) {
  return apiFetch<{ message: string }>(
    `/clubs/${clubId}/members`,
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

