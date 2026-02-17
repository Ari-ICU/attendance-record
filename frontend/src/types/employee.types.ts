// src/types/employee.types.ts

// Employee data structure based on MongoDB schema
export interface BankDetails {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
}

export interface Employee {
    _id: string;
    firstName: string;
    lastName: string;
    fullName: string; // Virtual field (firstName + lastName)
    email: string;
    phone: string;
    position: string;
    department: string;
    type: 'employee' | 'student';
    dateOfJoining: string; // ISO date string (e.g., "2025-09-15")
    photoUrl?: string | null; // URL of employee photo
    faceDescriptor?: number[]; // Optional 128-length array for face recognition
    faceVerifiedAt?: string; // Optional ISO date string
    faceVerificationEnabled: boolean;
    baseSalary: number;
    hourlyRate: number;
    currency: string;
    bankDetails?: BankDetails;
    isActive: boolean;

    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
}

// Data for creating an employee
export interface EmployeeCreateData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    position: string;
    department: string;
    type?: 'employee' | 'student';
    dateOfJoining?: string;
    image?: string; // Optional base64-encoded image for face descriptor
    photoUrl?: string; // Optional photo URL (if already uploaded)
    baseSalary?: number;
    hourlyRate?: number;
    currency?: string;
    bankDetails?: BankDetails;
}


// Data for updating an employee
export interface EmployeeUpdateData {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    position?: string;
    department?: string;
    type?: 'employee' | 'student';
    dateOfJoining?: string; // ISO date string
    image?: string; // Optional base64-encoded image for face descriptor
    photoUrl?: string; // Optional photo URL (if already uploaded)
    baseSalary?: number;
    hourlyRate?: number;
    currency?: string;
    bankDetails?: BankDetails;
    isActive?: boolean;
}


// Data for face verification request
export interface VerifyFaceData {
    employeeId?: string;
    faceDescriptor: number[]; // required for sending face embeddings
}

// Result of face verification
export interface VerifyFaceResult {
    employeeId?: string;
    employee?: Employee;
    similarity: number;
    verifiedAt: string; // ISO date string
}

// Paginated response for getAllEmployees
export interface EmployeeListResponse {
    employees: Employee[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
}

// Generic API response structure
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    status: number;
    error?: string;
}
