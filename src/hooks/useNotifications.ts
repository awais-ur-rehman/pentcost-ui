import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { collaborationApi } from '../services/api/endpoints';
import type { Notification } from '../types';

// Query keys
export const notificationKeys = {
    all: ['notifications'] as const,
    lists: () => [...notificationKeys.all, 'list'] as const,
    details: () => [...notificationKeys.all, 'detail'] as const,
    detail: (id: string) => [...notificationKeys.details(), id] as const,
};

// Get notifications
export function useNotifications() {
    return useQuery({
        queryKey: notificationKeys.lists(),
        queryFn: async () => {
            const response = await collaborationApi.getNotifications();
            if (!response.success) {
                throw new Error(response.error || 'Failed to fetch notifications');
            }
            return response.data;
        },
        staleTime: 30 * 1000, // 30 seconds
        refetchInterval: 60 * 1000, // Refetch every minute
    });
}

// Mark notification as read mutation
export function useMarkNotificationAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (notificationId: string) => {
            const response = await collaborationApi.markNotificationAsRead(notificationId);
            if (!response.success) {
                throw new Error(response.error || 'Failed to mark notification as read');
            }
            return response.data;
        },
        onSuccess: (updatedNotification, notificationId) => {
            // Update the notification in cache
            queryClient.setQueryData(notificationKeys.detail(notificationId), updatedNotification);

            // Invalidate notifications list to refetch
            queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
        },
    });
}

// Delete notification mutation
export function useDeleteNotification() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (notificationId: string) => {
            const response = await collaborationApi.deleteNotification(notificationId);
            if (!response.success) {
                throw new Error(response.error || 'Failed to delete notification');
            }
            return response.data;
        },
        onSuccess: (_, notificationId) => {
            // Remove the notification from cache
            queryClient.removeQueries({ queryKey: notificationKeys.detail(notificationId) });

            // Invalidate notifications list to refetch
            queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
        },
    });
}
