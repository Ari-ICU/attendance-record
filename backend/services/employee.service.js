const Employee = require('../models/employee.model');
const {
    employeeCreateSchema,
    employeeUpdateSchema,
    employeeQuerySchema
} = require('../validations/employee.validation');

// Replace old utils with fast-face-api
const { initModels, getDescriptor, cosineSimilarity } = require('../utils/fast-face-api');

class EmployeeService {
    // Load face recognition models
    static async initialize() {
        await initModels();
        console.log('Face recognition models loaded (fast)');
    }

    // Create a new employee
    static async createEmployee(data) {
        const { error, value } = employeeCreateSchema.validate(data);
        if (error) throw new Error(`Validation failed: ${error.details[0].message}`);

        const employee = new Employee(value);
        await employee.save();

        // Extract face descriptor from photoUrl if available
        if (employee.photoUrl) {
            await this.extractFaceDescriptorFromPhoto(employee);
        }

        return employee;
    }

    // Update employee
    static async updateEmployee(id, data) {
        const { error, value } = employeeUpdateSchema.validate(data);
        if (error) throw new Error(`Validation failed: ${error.details[0].message}`);

        const employee = await Employee.findByIdAndUpdate(id, value, { new: true, runValidators: true });
        if (!employee) throw new Error('Employee not found');

        // Update face descriptor if photoUrl or faceDescriptor provided
        if (data.photoUrl || data.faceDescriptor) {
            await this.extractFaceDescriptorFromPhoto(employee);
        }

        return employee;
    }

    // Extract face descriptor from stored photo
    static async extractFaceDescriptorFromPhoto(employee) {
        try {
            const descriptor = await getDescriptor(employee.photoUrl);
            if (!descriptor) throw new Error('No face detected in employee photo');

            employee.faceDescriptor = descriptor;
            employee.faceVerifiedAt = new Date();
            employee.faceVerificationEnabled = true;
            await employee.save();
        } catch (err) {
            console.warn(`Failed to extract face descriptor for employee ${employee._id}: ${err.message}`);
        }
    }

    // Get employee by ID
    static async getEmployeeById(id) {
        const employee = await Employee.findById(id);
        if (!employee) throw new Error('Employee not found');
        return employee;
    }

    // Get all employees with pagination and filters
    static async getAllEmployees(query) {
        const { error, value } = employeeQuerySchema.validate(query);
        if (error) throw new Error(`Validation failed: ${error.details[0].message}`);

        const { page, limit, sortBy, sortOrder, ...filters } = value;
        const skip = (page - 1) * limit;

        const [employees, total] = await Promise.all([
            Employee.find(filters)
                .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
                .skip(skip)
                .limit(limit),
            Employee.countDocuments(filters)
        ]);

        return {
            employees,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        };
    }

    // Delete employee
    static async deleteEmployee(id) {
        const employee = await Employee.findByIdAndDelete(id);
        if (!employee) throw new Error('Employee not found');
        return { message: 'Employee deleted successfully' };
    }

    // Verify face in real-time
    static async verifyFace(employeeId, liveImage) {
        const employee = await Employee.findById(employeeId);
        if (!employee) throw new Error('Employee not found');

        // If faceDescriptor not available, extract from stored photo
        if (!employee.faceDescriptor) {
            if (!employee.photoUrl) throw new Error('Employee has no registered photo for verification');
            await this.extractFaceDescriptorFromPhoto(employee);
        }

        const liveDescriptor = await getDescriptor(liveImage);
        if (!liveDescriptor) throw new Error('No face detected in live image');

        const similarity = cosineSimilarity(employee.faceDescriptor, liveDescriptor);
        const THRESHOLD = parseFloat(process.env.FACE_SIMILARITY_THRESHOLD || '0.8');

        if (similarity < THRESHOLD) {
            throw new Error(`Face verification failed: similarity ${similarity.toFixed(3)} below threshold ${THRESHOLD}`);
        }

        return {
            employeeId: employee._id,
            similarity,
            verifiedAt: new Date()
        };
    }
}

module.exports = EmployeeService;
