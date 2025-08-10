import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { 
  AdProvider, InsertAdProvider,
  AdCampaign, InsertAdCampaign,
  AdSlot, InsertAdSlot,
  AdSlotAssignment, InsertAdSlotAssignment,
  AdAnalytics, AdView, InsertAdView
} from '@shared/schema';

// Helper function for API requests with proper JSON handling
async function apiRequest(url: string, options?: RequestInit): Promise<any> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  
  return response.json();
}

// Ad Providers
export function useAdProviders() {
  return useQuery<AdProvider[]>({
    queryKey: ['/api/admin/ad-providers'],
  });
}

export function useCreateAdProvider() {
  const queryClient = useQueryClient();
  return useMutation<AdProvider, Error, InsertAdProvider>({
    mutationFn: (provider) => apiRequest('/api/admin/ad-providers', {
      method: 'POST',
      body: JSON.stringify(provider),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ad-providers'] });
    },
  });
}

export function useUpdateAdProvider() {
  const queryClient = useQueryClient();
  return useMutation<AdProvider, Error, { id: string; updates: Partial<AdProvider> }>({
    mutationFn: ({ id, updates }) => apiRequest(`/api/admin/ad-providers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ad-providers'] });
    },
  });
}

export function useDeleteAdProvider() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => apiRequest(`/api/admin/ad-providers/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ad-providers'] });
    },
  });
}

// Ad Campaigns
export function useAdCampaigns(providerId?: string) {
  const queryKey = providerId 
    ? ['/api/admin/ad-campaigns', `providerId=${providerId}`]
    : ['/api/admin/ad-campaigns'];
    
  return useQuery<AdCampaign[]>({
    queryKey,
  });
}

export function useCreateAdCampaign() {
  const queryClient = useQueryClient();
  return useMutation<AdCampaign, Error, InsertAdCampaign>({
    mutationFn: (campaign) => apiRequest('/api/admin/ad-campaigns', {
      method: 'POST',
      body: JSON.stringify(campaign),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ad-campaigns'] });
    },
  });
}

export function useUpdateAdCampaign() {
  const queryClient = useQueryClient();
  return useMutation<AdCampaign, Error, { id: string; updates: Partial<AdCampaign> }>({
    mutationFn: ({ id, updates }) => apiRequest(`/api/admin/ad-campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ad-campaigns'] });
    },
  });
}

export function useDeleteAdCampaign() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => apiRequest(`/api/admin/ad-campaigns/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ad-campaigns'] });
    },
  });
}

// Ad Slots (Admin)
export function useAdSlotsAdmin(page?: string) {
  const queryKey = page 
    ? ['/api/admin/ad-slots', `page=${page}`]
    : ['/api/admin/ad-slots'];
    
  return useQuery<AdSlot[]>({
    queryKey,
  });
}

export function useCreateAdSlot() {
  const queryClient = useQueryClient();
  return useMutation<AdSlot, Error, InsertAdSlot>({
    mutationFn: (slot) => apiRequest('/api/admin/ad-slots', {
      method: 'POST',
      body: JSON.stringify(slot),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ad-slots'] });
    },
  });
}

export function useUpdateAdSlot() {
  const queryClient = useQueryClient();
  return useMutation<AdSlot, Error, { id: string; updates: Partial<AdSlot> }>({
    mutationFn: ({ id, updates }) => apiRequest(`/api/admin/ad-slots/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ad-slots'] });
    },
  });
}

export function useDeleteAdSlot() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => apiRequest(`/api/admin/ad-slots/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ad-slots'] });
    },
  });
}

// Ad Slot Assignments
export function useSlotAssignments(slotId?: string) {
  const queryKey = slotId 
    ? ['/api/admin/slot-assignments', `slotId=${slotId}`]
    : ['/api/admin/slot-assignments'];
    
  return useQuery<AdSlotAssignment[]>({
    queryKey,
  });
}

export function useCreateSlotAssignment() {
  const queryClient = useQueryClient();
  return useMutation<AdSlotAssignment, Error, InsertAdSlotAssignment>({
    mutationFn: (assignment) => apiRequest('/api/admin/slot-assignments', {
      method: 'POST',
      body: JSON.stringify(assignment),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/slot-assignments'] });
    },
  });
}

export function useUpdateSlotAssignment() {
  const queryClient = useQueryClient();
  return useMutation<AdSlotAssignment, Error, { id: string; updates: Partial<AdSlotAssignment> }>({
    mutationFn: ({ id, updates }) => apiRequest(`/api/admin/slot-assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/slot-assignments'] });
    },
  });
}

export function useDeleteSlotAssignment() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => apiRequest(`/api/admin/slot-assignments/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/slot-assignments'] });
    },
  });
}

// Ad Analytics
export function useAdAnalytics(filters?: {
  slotId?: string;
  campaignId?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.slotId) params.append('slotId', filters.slotId);
  if (filters?.campaignId) params.append('campaignId', filters.campaignId);
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters?.dateTo) params.append('dateTo', filters.dateTo);
  
  const queryString = params.toString();
  const queryKey = queryString 
    ? ['/api/admin/ad-analytics', queryString]
    : ['/api/admin/ad-analytics'];
    
  return useQuery<AdAnalytics[]>({
    queryKey,
  });
}

export function useRecordAdView() {
  return useMutation<AdView, Error, InsertAdView>({
    mutationFn: (view) => apiRequest('/api/ads/view', {
      method: 'POST',
      body: JSON.stringify(view),
    }),
  });
}

// Public Ad Serving
export function usePageAds(page: string) {
  return useQuery<{ slot: AdSlot; campaign?: AdCampaign }[]>({
    queryKey: ['/api/ads/page', page],
    refetchInterval: 60000, // Refetch every minute for real-time updates
  });
}

export function useSlotAd(slotId: string) {
  return useQuery<{ slot: AdSlot; campaign?: AdCampaign }>({
    queryKey: ['/api/ads/slot', slotId],
    refetchInterval: 60000, // Refetch every minute for real-time updates
  });
}