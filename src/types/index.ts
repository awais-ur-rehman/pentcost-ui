// User Types
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'contract_creator' | 'reviewer' | 'admin';
    preferredLanguage: string;
    createdAt: string;
    updatedAt: string;
}

export interface AuthUser extends User {
    token?: string;
    accessToken?: string;
    refreshToken?: string;
}

// Contract Types
export interface Contract {
    _id: string;
    title: string;
    description?: string;
    content: string;
    originalLanguage: string;
    status: 'draft' | 'active' | 'finalized';
    createdBy: string;
    collaborators: Collaborator[];
    currentBranch: string;
    branches: string[];
    signatures: Signature[];
    createdAt: string;
    updatedAt: string;
}

export interface Collaborator {
    userId: string;
    permission: 'read' | 'write' | 'admin';
    addedAt: string;
}

export interface Signature {
    userId: string;
    signatureData: string;
    signedAt: string;
}

// Version Control Types
export interface Commit {
    id: string;
    contractId: string;
    authorId: string;
    author: User;
    message: string;
    content: string;
    language: string;
    branch: string;
    parentCommitId?: string;
    createdAt: string;
    changes: ContractChange[];
}

export interface ContractChange {
    type: 'addition' | 'deletion' | 'modification';
    lineNumber: number;
    content: string;
    originalContent?: string;
}

export interface Branch {
    id: string;
    contractId: string;
    name: string;
    description: string;
    createdBy: string;
    createdByUser: User;
    baseCommitId: string;
    headCommitId: string;
    status: 'active' | 'merged' | 'closed';
    createdAt: string;
    updatedAt: string;
}

// Collaboration Types
export interface Comment {
    id: string;
    contractId: string;
    authorId: string;
    author: User;
    content: string;
    lineNumber?: number;
    parentCommentId?: string;
    replies: Comment[];
    createdAt: string;
    updatedAt: string;
    resolved: boolean;
}

export interface Notification {
    id: string;
    userId: string;
    type: 'contract_shared' | 'comment_added' | 'contract_updated' | 'branch_created' | 'merge_request';
    title: string;
    message: string;
    contractId?: string;
    read: boolean;
    createdAt: string;
}

// AI Integration Types
export interface TranslationResult {
    originalText: string;
    translatedText: string;
    sourceLanguage: string;
    targetLanguage: string;
    confidence: number;
    timestamp?: number;
}

export interface ProofreadingResult {
    originalText: string;
    correctedText: string;
    errors: ProofreadingError[];
    suggestions: ProofreadingSuggestion[];
}

export interface ProofreadingError {
    type: 'grammar' | 'spelling' | 'punctuation' | 'style';
    message: string;
    startIndex: number;
    endIndex: number;
    severity: 'low' | 'medium' | 'high';
}

export interface ProofreadingSuggestion {
    originalText: string;
    suggestedText: string;
    reason: string;
    startIndex: number;
    endIndex: number;
}

export interface RewriteResult {
    originalText: string;
    suggestions: RewriteSuggestion[];
}

export interface RewriteSuggestion {
    text: string;
    tone: 'formal' | 'casual' | 'concise' | 'detailed';
    reason: string;
    confidence: number;
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Form Types
export interface LoginForm {
    email: string;
    password: string;
}

export interface SignupForm {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    preferredLanguage: string;
}

export interface ContractForm {
    title: string;
    description: string;
    content: string;
    language: string;
    parties: string[];
}

export interface CreateContractRequest {
    title: string;
    description?: string;
    content: string;
    originalLanguage: string;
}

export interface CommitForm {
    message: string;
    content: string;
    branch: string;
}

// UI State Types
export interface LoadingState {
    isLoading: boolean;
    error: string | null;
}

export interface ModalState {
    isOpen: boolean;
    type: string | null;
    data: any;
}

// Language Types
export interface Language {
    code: string;
    name: string;
    nativeName: string;
    flag: string;
}

// Settings Types
export interface UserSettings {
    preferredLanguage: string;
    notifications: {
        email: boolean;
        push: boolean;
        contractUpdates: boolean;
        comments: boolean;
        branches: boolean;
    };
    editor: {
        fontSize: number;
        theme: 'light' | 'dark';
        autoSave: boolean;
        showLineNumbers: boolean;
    };
}

// All types are already exported above with their interface declarations
