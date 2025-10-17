import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { branchApi } from '../services/api/endpoints';
import type { Branch } from '../types';

// Query keys
export const branchKeys = {
    all: ['branches'] as const,
    lists: () => [...branchKeys.all, 'list'] as const,
    list: (contractId: string) => [...branchKeys.lists(), contractId] as const,
    details: () => [...branchKeys.all, 'detail'] as const,
    detail: (contractId: string, branchId: string) => [...branchKeys.details(), contractId, branchId] as const,
};

// Get branches for a contract
export function useBranches(contractId: string) {
    return useQuery({
        queryKey: branchKeys.list(contractId),
        queryFn: async () => {
            const response = await branchApi.getBranches(contractId);
            if (!response.success) {
                throw new Error(response.error || 'Failed to fetch branches');
            }
            return response.data;
        },
        enabled: !!contractId,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

// Create branch mutation
export function useCreateBranch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ contractId, branchData }: { contractId: string; branchData: { name: string; description: string; baseCommitId: string } }) => {
            const response = await branchApi.createBranch(contractId, branchData);
            if (!response.success) {
                throw new Error(response.error || 'Failed to create branch');
            }
            return response.data;
        },
        onSuccess: (newBranch, { contractId }) => {
            // Invalidate branches list to refetch
            queryClient.invalidateQueries({ queryKey: branchKeys.list(contractId) });

            // Add the new branch to the cache
            queryClient.setQueryData(branchKeys.detail(contractId, newBranch.id), newBranch);
        },
    });
}

// Merge branch mutation
export function useMergeBranch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ contractId, branchId }: { contractId: string; branchId: string }) => {
            const response = await branchApi.mergeBranch(contractId, branchId);
            if (!response.success) {
                throw new Error(response.error || 'Failed to merge branch');
            }
            return response.data;
        },
        onSuccess: (mergedBranch, { contractId }) => {
            // Invalidate branches list to refetch
            queryClient.invalidateQueries({ queryKey: branchKeys.list(contractId) });

            // Update the merged branch in cache
            queryClient.setQueryData(branchKeys.detail(contractId, mergedBranch.id), mergedBranch);
        },
    });
}

// Delete branch mutation
export function useDeleteBranch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ contractId, branchId }: { contractId: string; branchId: string }) => {
            const response = await branchApi.deleteBranch(contractId, branchId);
            if (!response.success) {
                throw new Error(response.error || 'Failed to delete branch');
            }
            return response.data;
        },
        onSuccess: (_, { contractId, branchId }) => {
            // Remove the branch from cache
            queryClient.removeQueries({ queryKey: branchKeys.detail(contractId, branchId) });

            // Invalidate branches list to refetch
            queryClient.invalidateQueries({ queryKey: branchKeys.list(contractId) });
        },
    });
}
