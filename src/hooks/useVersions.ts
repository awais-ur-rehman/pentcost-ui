import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { versionApi } from '../services/api/endpoints';
import type { CommitForm } from '../types';

// Query keys
export const versionKeys = {
    all: ['versions'] as const,
    lists: () => [...versionKeys.all, 'list'] as const,
    list: (contractId: string) => [...versionKeys.lists(), contractId] as const,
    details: () => [...versionKeys.all, 'detail'] as const,
    detail: (contractId: string, versionId: string) => [...versionKeys.details(), contractId, versionId] as const,
};

// Get versions for a contract
export function useVersions(contractId: string) {
    return useQuery({
        queryKey: versionKeys.list(contractId),
        queryFn: async () => {
            const response = await versionApi.getVersions(contractId);
            if (!response.success) {
                throw new Error(response.error || 'Failed to fetch versions');
            }
            return response.data;
        },
        enabled: !!contractId,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

// Get specific version
export function useVersion(contractId: string, versionId: string) {
    return useQuery({
        queryKey: versionKeys.detail(contractId, versionId),
        queryFn: async () => {
            const response = await versionApi.getVersion(contractId, versionId);
            if (!response.success) {
                throw new Error(response.error || 'Failed to fetch version');
            }
            return response.data;
        },
        enabled: !!contractId && !!versionId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

// Commit changes mutation
export function useCommitChanges() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ contractId, commitData }: { contractId: string; commitData: CommitForm }) => {
            const response = await versionApi.commitChanges(contractId, commitData);
            if (!response.success) {
                throw new Error(response.error || 'Failed to commit changes');
            }
            return response.data;
        },
        onSuccess: (newCommit, { contractId }) => {
            // Invalidate versions list to refetch
            queryClient.invalidateQueries({ queryKey: versionKeys.list(contractId) });

            // Add the new commit to the cache
            queryClient.setQueryData(versionKeys.detail(contractId, newCommit.id), newCommit);
        },
    });
}

// Pull changes mutation
export function usePullChanges() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (contractId: string) => {
            const response = await versionApi.pullChanges(contractId);
            if (!response.success) {
                throw new Error(response.error || 'Failed to pull changes');
            }
            return response.data;
        },
        onSuccess: (updatedContract, contractId) => {
            // Update the contract in cache
            queryClient.setQueryData(['contracts', 'detail', contractId], updatedContract);

            // Invalidate versions list to refetch
            queryClient.invalidateQueries({ queryKey: versionKeys.list(contractId) });
        },
    });
}

// Get diff between versions
export function useVersionDiff(contractId: string, fromVersion?: number, toVersion?: number) {
    return useQuery({
        queryKey: [...versionKeys.list(contractId), 'diff', fromVersion, toVersion],
        queryFn: async () => {
            const response = await versionApi.getDiff(contractId, fromVersion, toVersion);
            if (!response.success) {
                throw new Error(response.error || 'Failed to get version diff');
            }
            return response.data;
        },
        enabled: !!contractId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

// Rollback to version mutation
export function useRollbackVersion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ contractId, versionId }: { contractId: string; versionId: string }) => {
            const response = await versionApi.rollback(contractId, versionId);
            if (!response.success) {
                throw new Error(response.error || 'Failed to rollback version');
            }
            return response.data;
        },
        onSuccess: (updatedContract, { contractId }) => {
            // Update the contract in cache
            queryClient.setQueryData(['contracts', 'detail', contractId], updatedContract);

            // Invalidate versions list to refetch
            queryClient.invalidateQueries({ queryKey: versionKeys.list(contractId) });
        },
    });
}
