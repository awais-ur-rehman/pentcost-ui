import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contractApi } from '../services/api/endpoints';
import type { ContractForm, CreateContractRequest } from '../types';

// Query keys
export const contractKeys = {
    all: ['contracts'] as const,
    lists: () => [...contractKeys.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...contractKeys.lists(), { filters }] as const,
    details: () => [...contractKeys.all, 'detail'] as const,
    detail: (id: string) => [...contractKeys.details(), id] as const,
};

// Get contracts list
export function useContracts(page = 1, limit = 10) {
    return useQuery({
        queryKey: contractKeys.list({ page, limit }),
        queryFn: async () => {
            const response = await contractApi.getContracts(page, limit);
            if (!response.success) {
                throw new Error(response.error || 'Failed to fetch contracts');
            }
            // Handle the nested structure from API documentation
            return {
                contracts: (response.data as any).contracts || response.data.data || response.data,
                pagination: (response.data as any).pagination
            };
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

// Get single contract
export function useContract(id: string) {
    return useQuery({
        queryKey: contractKeys.detail(id),
        queryFn: async () => {
            const response = await contractApi.getContract(id);
            if (!response.success) {
                throw new Error(response.error || 'Failed to fetch contract');
            }
            return response.data;
        },
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

// Create contract mutation
export function useCreateContract() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (contractData: CreateContractRequest) => {
            const response = await contractApi.createContract(contractData);
            if (!response.success) {
                throw new Error(response.error || 'Failed to create contract');
            }
            return response.data;
        },
        onSuccess: (newContract) => {
            // Invalidate and refetch contracts list
            queryClient.invalidateQueries({ queryKey: contractKeys.lists() });

            // Add the new contract to the cache
            queryClient.setQueryData(contractKeys.detail(newContract.id), newContract);
        },
    });
}

// Update contract mutation
export function useUpdateContract() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<ContractForm> }) => {
            const response = await contractApi.updateContract(id, data);
            if (!response.success) {
                throw new Error(response.error || 'Failed to update contract');
            }
            return response.data;
        },
        onSuccess: (updatedContract) => {
            // Update the contract in cache
            queryClient.setQueryData(contractKeys.detail(updatedContract.id), updatedContract);

            // Invalidate contracts list to refetch
            queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
        },
    });
}

// Delete contract mutation
export function useDeleteContract() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await contractApi.deleteContract(id);
            if (!response.success) {
                throw new Error(response.error || 'Failed to delete contract');
            }
            return response.data;
        },
        onSuccess: (_, deletedId) => {
            // Remove the contract from cache
            queryClient.removeQueries({ queryKey: contractKeys.detail(deletedId) });

            // Invalidate contracts list to refetch
            queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
        },
    });
}

// Share contract mutation
export function useShareContract() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, shareData }: { id: string; shareData: { userIds: string[]; permissions: string[] } }) => {
            const response = await contractApi.shareContract(id, shareData);
            if (!response.success) {
                throw new Error(response.error || 'Failed to share contract');
            }
            return response.data;
        },
        onSuccess: (_, { id }) => {
            // Invalidate the specific contract to refetch updated data
            queryClient.invalidateQueries({ queryKey: contractKeys.detail(id) });
        },
    });
}

// Sign contract mutation
export function useSignContract() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, signatureData }: { id: string; signatureData: { signature: string; signatureData: string } }) => {
            const response = await contractApi.signContract(id, signatureData);
            if (!response.success) {
                throw new Error(response.error || 'Failed to sign contract');
            }
            return response.data;
        },
        onSuccess: (updatedContract) => {
            // Update the contract in cache
            queryClient.setQueryData(contractKeys.detail(updatedContract.id), updatedContract);

            // Invalidate contracts list to refetch
            queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
        },
    });
}

// Finalize contract mutation
export function useFinalizeContract() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await contractApi.finalizeContract(id);
            if (!response.success) {
                throw new Error(response.error || 'Failed to finalize contract');
            }
            return response.data;
        },
        onSuccess: (updatedContract) => {
            // Update the contract in cache
            queryClient.setQueryData(contractKeys.detail(updatedContract.id), updatedContract);

            // Invalidate contracts list to refetch
            queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
        },
    });
}
