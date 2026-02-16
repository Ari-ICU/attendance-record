export interface User {
    _id: string;
    email: string;
    username?: string; // Changed from employeeId to match backend
    role?: string;
    firstName?: string;
    lastName?: string;
    photoUrl?: string | null;
    isLocked?: boolean;
    createdAt?: string;
    updatedAt?: string;
    department?: string;
}

export interface Permission {
    name: string;
    displayName: string;
    description?: string;
    category?: string;
    type?: string;
}

export interface AuthResponse {
    user: User;
    token: string;
    refreshToken?: string;
}

export interface LoginPayload {
    identifier: string; // email or username
    password: string;
}

export interface RegisterPayload {
    email: string;
    password: string;
    username: string; // Changed from employeeId
    role?: string;
    firstName?: string;
    lastName?: string;
}

export interface UpdateProfilePayload {
    email?: string;
    username?: string; // Changed from employeeId
    firstName?: string;
    lastName?: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
}