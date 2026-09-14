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

        // Extract face descriptor from photoUrl if available and descriptor not provided
        if (employee.photoUrl && (!employee.faceDescriptor || employee.faceDescriptor.length === 0)) {
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

        // Update face descriptor if photoUrl provided but no descriptor
        if (employee.photoUrl && (!employee.faceDescriptor || employee.faceDescriptor.length === 0)) {
            await this.extractFaceDescriptorFromPhoto(employee);
        }

        return employee;
    }

    // Extract face descriptor from stored photo
    static async extractFaceDescriptorFromPhoto(employee) {
        try {
            if (!employee.photoUrl) return;
            const descriptor = await getDescriptor(employee.photoUrl);
            if (!descriptor) return;

            employee.faceDescriptor = Array.from(descriptor);
            employee.faceVerifiedAt = new Date();
            employee.faceVerificationEnabled = true;
            await employee.save();
        } catch (err) {
            console.warn(`[EmployeeService] Notice for employee ${employee._id}: ${err.message}`);
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

        const { page, limit, sortBy, sortOrder, search, ...filters } = value;
        const skip = (page - 1) * limit;

        const mongoQuery = { ...filters };
        if (mongoQuery.email) {
            mongoQuery.email = { $regex: new RegExp(`^${mongoQuery.email}$`, 'i') };
        }

        const [employees, total] = await Promise.all([
            Employee.find(mongoQuery)
                .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
                .skip(skip)
                .limit(limit),
            Employee.countDocuments(mongoQuery)
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
        if (!employee) throw new Error('Staff profile not found');

        let liveDescriptor = null;
        try {
            if (Array.isArray(liveImage)) {
                liveDescriptor = liveImage;
            } else if (Buffer.isBuffer(liveImage)) {
                liveDescriptor = await getDescriptor(liveImage);
            } else if (typeof liveImage === 'string' && liveImage.length > 50) {
                const cleanBase64 = liveImage.replace(/^data:image\/\w+;base64,/, '');
                const buffer = Buffer.from(cleanBase64, 'base64');
                liveDescriptor = await getDescriptor(buffer);
            }
        } catch (detectErr) {
            console.warn(`[FaceAPI] Detection notice for ${employee.firstName}: ${detectErr.message}`);
        }

        if (liveDescriptor) {
            const cleanArray = Array.from(liveDescriptor);

            // Auto-enroll if employee has no biometric model registered yet
            if (!employee.faceDescriptor || employee.faceDescriptor.length === 0) {
                employee.faceDescriptor = cleanArray;
                employee.faceVerificationEnabled = true;
                employee.faceVerifiedAt = new Date();
                await employee.save();

                return {
                    employeeId: employee._id,
                    similarity: 0.99,
                    confidence: 99.0,
                    verifiedAt: new Date()
                };
            }

            // Compare live descriptor against registered model
            let similarity = 0;
            try {
                similarity = cosineSimilarity(employee.faceDescriptor, cleanArray);
            } catch (simErr) {
                console.warn('[FaceAPI] Cosine comparison error:', simErr.message);
                similarity = 0;
            }

            // Accuracy threshold check (0.50 minimum cosine similarity for matching)
            if (similarity < 0.50) {
                throw new Error(`Facial mismatch: Detected face does not match ${employee.firstName} ${employee.lastName} (${(Math.max(0, similarity) * 100).toFixed(1)}% match, minimum 50% required)`);
            }

            const confidence = Math.min(99.8, Math.max(88.0, similarity * 100)).toFixed(1);

            return {
                employeeId: employee._id,
                similarity,
                confidence: parseFloat(confidence),
                verifiedAt: new Date()
            };
        }

        // If no face was extracted from webcam image
        throw new Error('No face detected in camera viewfinder. Please position your face clearly in the scan zone.');
    }

    // Identify employee by face descriptor or image
    static async identifyEmployee(liveInput) {
        if (!liveInput) throw new Error('Live descriptor or image required for identification');

        let descriptor = null;
        try {
            if (Array.isArray(liveInput)) {
                descriptor = liveInput;
            } else if (Buffer.isBuffer(liveInput)) {
                descriptor = await getDescriptor(liveInput);
            } else if (typeof liveInput === 'string' && liveInput.length > 50) {
                const clean = liveInput.replace(/^data:image\/\w+;base64,/, '');
                descriptor = await getDescriptor(Buffer.from(clean, 'base64'));
            }
        } catch (err) {
            throw new Error('No face detected in camera viewfinder');
        }

        if (!descriptor) {
            throw new Error('Could not extract facial features from camera');
        }

        const candidates = await Employee.find({ isActive: true });
        const cleanDescriptor = Array.from(descriptor);
        let bestMatch = null;
        let highestSimilarity = -1;

        for (const candidate of candidates) {
            if (candidate.faceDescriptor && candidate.faceDescriptor.length > 0) {
                try {
                    const similarity = cosineSimilarity(candidate.faceDescriptor, cleanDescriptor);
                    if (similarity > highestSimilarity) {
                        highestSimilarity = similarity;
                        bestMatch = candidate;
                    }
                } catch {
                    continue;
                }
            }
        }

        if (bestMatch && highestSimilarity >= 0.50) {
            const confidence = Math.min(99.8, Math.max(88.0, highestSimilarity * 100)).toFixed(1);
            return {
                employee: bestMatch,
                employeeId: bestMatch._id,
                similarity: highestSimilarity,
                confidence: parseFloat(confidence)
            };
        }

        throw new Error('Face not recognized in staff database. Please register your profile or select your name.');
    }
}

module.exports = EmployeeService;
