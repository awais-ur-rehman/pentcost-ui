import { createContext, useContext, useReducer, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { contractApi, versionApi, branchApi } from '../services/api/endpoints';
import type { Contract, Commit, Branch, ContractForm, CommitForm } from '../types';

interface ContractState {
  contracts: Contract[];
  currentContract: Contract | null;
  versions: Commit[];
  branches: Branch[];
  loading: boolean;
  error: string | null;
}

type ContractAction =
  | { type: 'CONTRACT_START' }
  | { type: 'CONTRACT_SUCCESS'; payload: Contract[] }
  | { type: 'CONTRACT_FAILURE'; payload: string }
  | { type: 'SET_CURRENT_CONTRACT'; payload: Contract }
  | { type: 'UPDATE_CONTRACT'; payload: Contract }
  | { type: 'DELETE_CONTRACT'; payload: string }
  | { type: 'SET_VERSIONS'; payload: Commit[] }
  | { type: 'ADD_VERSION'; payload: Commit }
  | { type: 'SET_BRANCHES'; payload: Branch[] }
  | { type: 'ADD_BRANCH'; payload: Branch }
  | { type: 'UPDATE_BRANCH'; payload: Branch }
  | { type: 'CLEAR_ERROR' };

interface ContractContextType extends ContractState {
  fetchContracts: () => Promise<void>;
  fetchContract: (id: string) => Promise<void>;
  createContract: (contractData: ContractForm) => Promise<Contract>;
  updateContract: (id: string, contractData: Partial<ContractForm>) => Promise<void>;
  deleteContract: (id: string) => Promise<void>;
  fetchVersions: (contractId: string) => Promise<void>;
  commitChanges: (contractId: string, commitData: CommitForm) => Promise<void>;
  pullChanges: (contractId: string) => Promise<void>;
  fetchBranches: (contractId: string) => Promise<void>;
  createBranch: (contractId: string, branchData: { name: string; description: string; baseCommitId: string }) => Promise<void>;
  mergeBranch: (contractId: string, branchId: string) => Promise<void>;
  clearError: () => void;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

const initialState: ContractState = {
  contracts: [],
  currentContract: null,
  versions: [],
  branches: [],
  loading: false,
  error: null,
};

function contractReducer(state: ContractState, action: ContractAction): ContractState {
  switch (action.type) {
    case 'CONTRACT_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'CONTRACT_SUCCESS':
      return {
        ...state,
        loading: false,
        contracts: action.payload,
        error: null,
      };
    case 'CONTRACT_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'SET_CURRENT_CONTRACT':
      return {
        ...state,
        currentContract: action.payload,
      };
    case 'UPDATE_CONTRACT':
      return {
        ...state,
        contracts: state.contracts.map(contract =>
          contract.id === action.payload.id ? action.payload : contract
        ),
        currentContract: state.currentContract?.id === action.payload.id 
          ? action.payload 
          : state.currentContract,
      };
    case 'DELETE_CONTRACT':
      return {
        ...state,
        contracts: state.contracts.filter(contract => contract.id !== action.payload),
        currentContract: state.currentContract?.id === action.payload 
          ? null 
          : state.currentContract,
      };
    case 'SET_VERSIONS':
      return {
        ...state,
        versions: action.payload,
      };
    case 'ADD_VERSION':
      return {
        ...state,
        versions: [action.payload, ...state.versions],
      };
    case 'SET_BRANCHES':
      return {
        ...state,
        branches: action.payload,
      };
    case 'ADD_BRANCH':
      return {
        ...state,
        branches: [...state.branches, action.payload],
      };
    case 'UPDATE_BRANCH':
      return {
        ...state,
        branches: state.branches.map(branch =>
          branch.id === action.payload.id ? action.payload : branch
        ),
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

interface ContractProviderProps {
  children: ReactNode;
}

export function ContractProvider({ children }: ContractProviderProps) {
  const [state, dispatch] = useReducer(contractReducer, initialState);

  const fetchContracts = async () => {
    dispatch({ type: 'CONTRACT_START' });
    
    try {
      const response = await contractApi.getContracts();
      
      if (response.success) {
        dispatch({ type: 'CONTRACT_SUCCESS', payload: response.data.data });
      } else {
        const errorMessage = response.error || 'Failed to fetch contracts';
        toast.error(errorMessage);
        dispatch({ type: 'CONTRACT_FAILURE', payload: errorMessage });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch contracts';
      toast.error(errorMessage);
      dispatch({ type: 'CONTRACT_FAILURE', payload: errorMessage });
    }
  };

  const fetchContract = async (id: string) => {
    dispatch({ type: 'CONTRACT_START' });
    
    try {
      const response = await contractApi.getContract(id);
      
      if (response.success) {
        dispatch({ type: 'SET_CURRENT_CONTRACT', payload: response.data });
      } else {
        dispatch({ type: 'CONTRACT_FAILURE', payload: response.error || 'Failed to fetch contract' });
      }
    } catch (error) {
      dispatch({ type: 'CONTRACT_FAILURE', payload: error instanceof Error ? error.message : 'Failed to fetch contract' });
    }
  };

  const createContract = async (contractData: ContractForm): Promise<Contract> => {
    dispatch({ type: 'CONTRACT_START' });
    
    try {
      const response = await contractApi.createContract(contractData);
      
      if (response.success) {
        dispatch({ type: 'UPDATE_CONTRACT', payload: response.data });
        toast.success('Contract created successfully!');
        return response.data;
      } else {
        const errorMessage = response.error || 'Failed to create contract';
        toast.error(errorMessage);
        dispatch({ type: 'CONTRACT_FAILURE', payload: errorMessage });
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create contract';
      toast.error(errorMessage);
      dispatch({ type: 'CONTRACT_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const updateContract = async (id: string, contractData: Partial<ContractForm>) => {
    dispatch({ type: 'CONTRACT_START' });
    
    try {
      const response = await contractApi.updateContract(id, contractData);
      
      if (response.success) {
        dispatch({ type: 'UPDATE_CONTRACT', payload: response.data });
      } else {
        dispatch({ type: 'CONTRACT_FAILURE', payload: response.error || 'Failed to update contract' });
      }
    } catch (error) {
      dispatch({ type: 'CONTRACT_FAILURE', payload: error instanceof Error ? error.message : 'Failed to update contract' });
    }
  };

  const deleteContract = async (id: string) => {
    dispatch({ type: 'CONTRACT_START' });
    
    try {
      const response = await contractApi.deleteContract(id);
      
      if (response.success) {
        dispatch({ type: 'DELETE_CONTRACT', payload: id });
      } else {
        dispatch({ type: 'CONTRACT_FAILURE', payload: response.error || 'Failed to delete contract' });
      }
    } catch (error) {
      dispatch({ type: 'CONTRACT_FAILURE', payload: error instanceof Error ? error.message : 'Failed to delete contract' });
    }
  };

  const fetchVersions = async (contractId: string) => {
    try {
      const response = await versionApi.getVersions(contractId);
      
      if (response.success) {
        dispatch({ type: 'SET_VERSIONS', payload: response.data });
      } else {
        dispatch({ type: 'CONTRACT_FAILURE', payload: response.error || 'Failed to fetch versions' });
      }
    } catch (error) {
      dispatch({ type: 'CONTRACT_FAILURE', payload: error instanceof Error ? error.message : 'Failed to fetch versions' });
    }
  };

  const commitChanges = async (contractId: string, commitData: CommitForm) => {
    try {
      const response = await versionApi.commitChanges(contractId, commitData);
      
      if (response.success) {
        dispatch({ type: 'ADD_VERSION', payload: response.data });
      } else {
        dispatch({ type: 'CONTRACT_FAILURE', payload: response.error || 'Failed to commit changes' });
      }
    } catch (error) {
      dispatch({ type: 'CONTRACT_FAILURE', payload: error instanceof Error ? error.message : 'Failed to commit changes' });
    }
  };

  const pullChanges = async (contractId: string) => {
    try {
      const response = await versionApi.pullChanges(contractId);
      
      if (response.success) {
        dispatch({ type: 'SET_CURRENT_CONTRACT', payload: response.data });
      } else {
        dispatch({ type: 'CONTRACT_FAILURE', payload: response.error || 'Failed to pull changes' });
      }
    } catch (error) {
      dispatch({ type: 'CONTRACT_FAILURE', payload: error instanceof Error ? error.message : 'Failed to pull changes' });
    }
  };

  const fetchBranches = async (contractId: string) => {
    try {
      const response = await branchApi.getBranches(contractId);
      
      if (response.success) {
        dispatch({ type: 'SET_BRANCHES', payload: response.data });
      } else {
        dispatch({ type: 'CONTRACT_FAILURE', payload: response.error || 'Failed to fetch branches' });
      }
    } catch (error) {
      dispatch({ type: 'CONTRACT_FAILURE', payload: error instanceof Error ? error.message : 'Failed to fetch branches' });
    }
  };

  const createBranch = async (contractId: string, branchData: { name: string; description: string; baseCommitId: string }) => {
    try {
      const response = await branchApi.createBranch(contractId, branchData);
      
      if (response.success) {
        dispatch({ type: 'ADD_BRANCH', payload: response.data });
      } else {
        dispatch({ type: 'CONTRACT_FAILURE', payload: response.error || 'Failed to create branch' });
      }
    } catch (error) {
      dispatch({ type: 'CONTRACT_FAILURE', payload: error instanceof Error ? error.message : 'Failed to create branch' });
    }
  };

  const mergeBranch = async (contractId: string, branchId: string) => {
    try {
      const response = await branchApi.mergeBranch(contractId, branchId);
      
      if (response.success) {
        dispatch({ type: 'UPDATE_BRANCH', payload: response.data });
      } else {
        dispatch({ type: 'CONTRACT_FAILURE', payload: response.error || 'Failed to merge branch' });
      }
    } catch (error) {
      dispatch({ type: 'CONTRACT_FAILURE', payload: error instanceof Error ? error.message : 'Failed to merge branch' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: ContractContextType = {
    ...state,
    fetchContracts,
    fetchContract,
    createContract,
    updateContract,
    deleteContract,
    fetchVersions,
    commitChanges,
    pullChanges,
    fetchBranches,
    createBranch,
    mergeBranch,
    clearError,
  };

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
}

export function useContract() {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error('useContract must be used within a ContractProvider');
  }
  return context;
}
