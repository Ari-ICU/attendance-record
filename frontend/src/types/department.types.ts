import { Employee } from "./employee.types";

export interface Department {
    _id: string;
    name: string;
    description?: string;
    head?: Employee;
    memberCount?: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface DepartmentCreateData {
    name: string;
    description?: string;
    head?: string; // Employee ID
}

export interface DepartmentUpdateData {
    name?: string;
    description?: string;
    head?: string; // Employee ID
    isActive?: boolean;
}
