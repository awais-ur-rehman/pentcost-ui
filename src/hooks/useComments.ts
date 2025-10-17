import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { collaborationApi } from '../services/api/endpoints';

// Query keys
export const commentKeys = {
    all: ['comments'] as const,
    lists: () => [...commentKeys.all, 'list'] as const,
    list: (contractId: string) => [...commentKeys.lists(), contractId] as const,
    details: () => [...commentKeys.all, 'detail'] as const,
    detail: (contractId: string, commentId: string) => [...commentKeys.details(), contractId, commentId] as const,
};

// Get comments for a contract
export function useComments(contractId: string) {
    return useQuery({
        queryKey: commentKeys.list(contractId),
        queryFn: async () => {
            const response = await collaborationApi.getComments(contractId);
            if (!response.success) {
                throw new Error(response.error || 'Failed to fetch comments');
            }
            return response.data;
        },
        enabled: !!contractId,
        staleTime: 1 * 60 * 1000, // 1 minute
    });
}

// Add comment mutation
export function useAddComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ contractId, commentData }: { contractId: string; commentData: { content: string; lineNumber?: number; parentCommentId?: string } }) => {
            const response = await collaborationApi.addComment(contractId, commentData);
            if (!response.success) {
                throw new Error(response.error || 'Failed to add comment');
            }
            return response.data;
        },
        onSuccess: (newComment, { contractId }) => {
            // Invalidate comments list to refetch
            queryClient.invalidateQueries({ queryKey: commentKeys.list(contractId) });

            // Add the new comment to the cache
            queryClient.setQueryData(commentKeys.detail(contractId, newComment.id), newComment);
        },
    });
}

// Update comment mutation
export function useUpdateComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ contractId, commentId, content }: { contractId: string; commentId: string; content: string }) => {
            const response = await collaborationApi.updateComment(contractId, commentId, content);
            if (!response.success) {
                throw new Error(response.error || 'Failed to update comment');
            }
            return response.data;
        },
        onSuccess: (updatedComment, { contractId }) => {
            // Update the comment in cache
            queryClient.setQueryData(commentKeys.detail(contractId, updatedComment.id), updatedComment);

            // Invalidate comments list to refetch
            queryClient.invalidateQueries({ queryKey: commentKeys.list(contractId) });
        },
    });
}

// Delete comment mutation
export function useDeleteComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ contractId, commentId }: { contractId: string; commentId: string }) => {
            const response = await collaborationApi.deleteComment(contractId, commentId);
            if (!response.success) {
                throw new Error(response.error || 'Failed to delete comment');
            }
            return response.data;
        },
        onSuccess: (_, { contractId, commentId }) => {
            // Remove the comment from cache
            queryClient.removeQueries({ queryKey: commentKeys.detail(contractId, commentId) });

            // Invalidate comments list to refetch
            queryClient.invalidateQueries({ queryKey: commentKeys.list(contractId) });
        },
    });
}

// Resolve comment mutation
export function useResolveComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ contractId, commentId }: { contractId: string; commentId: string }) => {
            const response = await collaborationApi.resolveComment(contractId, commentId);
            if (!response.success) {
                throw new Error(response.error || 'Failed to resolve comment');
            }
            return response.data;
        },
        onSuccess: (resolvedComment, { contractId }) => {
            // Update the comment in cache
            queryClient.setQueryData(commentKeys.detail(contractId, resolvedComment.id), resolvedComment);

            // Invalidate comments list to refetch
            queryClient.invalidateQueries({ queryKey: commentKeys.list(contractId) });
        },
    });
}
