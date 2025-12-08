import { API_BASE_URL } from '../Config';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Request failed with status ${response.status}`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error('API request error:', error);
    return {
      success: false,
      error: error.message || 'Network error',
    };
  }
}

// Meetup-specific API helpers
export const meetupApi = {
  // Create meetup
  createMeetup: (data: any) => 
    apiRequest('/api/meetups/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get invitation
  getInvitation: (shareableCode: string) => 
    apiRequest(`/api/meetups/${shareableCode}/invitation`),

  // Accept invitation
  acceptInvitation: (shareableCode: string) =>
    apiRequest(`/api/meetups/${shareableCode}/accept`, {
      method: 'POST',
    }),

  // Set joiner preferences
  setJoinerPreferences: (meetupId: string, data: any) =>
    apiRequest(`/api/meetups/${meetupId}/joiner-preferences`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get lobby data
  getLobbyData: (meetupCode: string) =>
    apiRequest(`/api/meetups/${meetupCode}/lobby`),

  // Add comment
  addComment: (meetupCode: string, content: string) =>
    apiRequest(`/api/meetups/${meetupCode}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  // Confirm venue
  confirmVenue: (meetupCode: string, venueId: number) =>
    apiRequest(`/api/meetups/${meetupCode}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ venue_id: venueId }),
    }),
};
