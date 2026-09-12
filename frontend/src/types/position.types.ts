export interface PositionItem {
    _id?: string;
    id?: string;
    title: string;
    department: string;
    employeeCount?: number;
    description: string;
    level: string;
    responsibilities?: string[];
    skills?: string[];
    salaryRange?: string;
    employmentType?: string;
    experienceReq?: string;
    workPolicy?: string;
    workingHours?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
