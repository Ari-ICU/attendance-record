const EmployeeService = require('../services/employee.service');
const { getDescriptor } = require('../utils/fast-face-api');
const { ApiResponse } = require('../utils/apiResponse');
const { Types } = require('mongoose');

const { v4: uuidv4 } = require('uuid');

class EmployeeController {
    // Create employee (optional image for face descriptor)
    // Create employee (optional image for face descriptor)
    static async createEmployee(req, res) {
        try {
            const { image, ...data } = req.body;

            // If base64 image is provided, extract face descriptor AND save image
            if (image) {
                try {
                    const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, '');
                    const buffer = Buffer.from(cleanBase64, 'base64');
                    const descriptor = await getDescriptor(buffer);
                    if (descriptor) {
                        data.faceDescriptor = Array.from(descriptor);
                        data.faceVerificationEnabled = true;
                        data.faceVerifiedAt = new Date();
                    }
                } catch (faceErr) {
                    console.warn('[EmployeeController] Face descriptor warning:', faceErr.message);
                }

                // Store image as Data URI
                data.photoUrl = image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`;
            }

            const employee = await EmployeeService.createEmployee(data);
            return res.status(201).json(ApiResponse.success(employee, 'Employee created successfully', 201));
        } catch (err) {
            console.error('Error in createEmployee:', err);
            const isValidationError = /validation/i.test(err.message);
            const status = isValidationError ? 400 : 500;
            return res.status(status).json(ApiResponse.error(err.message || 'Failed to create employee', status));
        }
    }

    // Get employee by ID
    static async getEmployee(req, res) {
        try {
            const { id } = req.params;
            if (!Types.ObjectId.isValid(id)) {
                return res.status(400).json(ApiResponse.error('Invalid employee ID', 400));
            }

            const employee = await EmployeeService.getEmployeeById(id);

            // Permission check: Non-admin/non-manager can ONLY view their own profile/salary
            if (req.user && !['admin', 'manager', 'superadmin'].includes(req.user.role)) {
                const userEmail = (req.user.email || '').toLowerCase().trim();
                const empEmail = (employee.email || '').toLowerCase().trim();
                if (userEmail !== empEmail) {
                    return res.status(403).json(ApiResponse.error('Forbidden: You are only permitted to view your own profile, department, position, and compensation details', 403));
                }
            }

            return res.status(200).json(ApiResponse.success(employee, 'Employee retrieved successfully', 200));
        } catch (err) {
            const status = err.message.includes('not found') ? 404 : 500;
            return res.status(status).json(ApiResponse.error('Failed to retrieve employee', status, err.message));
        }
    }

    // Get all employees
    static async getAllEmployees(req, res) {
        try {
            const query = { ...req.query };

            // Permission check: Non-admin/non-manager can only see their own employee record
            if (req.user && !['admin', 'manager', 'superadmin'].includes(req.user.role)) {
                query.email = req.user.email;
            }

            const result = await EmployeeService.getAllEmployees(query);

            // If public/unauthenticated (kiosk scan), sanitize sensitive compensation fields
            if (!req.user && result?.employees) {
                result.employees = result.employees.map(emp => {
                    const doc = emp.toObject ? emp.toObject() : { ...emp };
                    delete doc.baseSalary;
                    delete doc.hourlyRate;
                    delete doc.bankDetails;
                    return doc;
                });
            }

            return res.status(200).json(ApiResponse.success(result, 'Employees retrieved successfully', 200));
        } catch (err) {
            const status = err.message.includes('Validation failed') ? 400 : 500;
            return res.status(status).json(ApiResponse.error('Failed to get employees', status, err.message));
        }
    }

    // Update employee (optional image for face descriptor)
    static async updateEmployee(req, res) {
        try {
            const { id } = req.params;
            if (!Types.ObjectId.isValid(id)) {
                return res.status(400).json(ApiResponse.error('Invalid employee ID', 400));
            }

            const { image, ...data } = req.body;
            if (image) {
                try {
                    const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, '');
                    const buffer = Buffer.from(cleanBase64, 'base64');
                    const descriptor = await getDescriptor(buffer);
                    if (descriptor) {
                        data.faceDescriptor = Array.from(descriptor);
                        data.faceVerificationEnabled = true;
                        data.faceVerifiedAt = new Date();
                    }
                } catch (faceErr) {
                    console.warn('[EmployeeController] Face descriptor warning:', faceErr.message);
                }

                // Store image as Data URI
                data.photoUrl = image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`;
            }

            const employee = await EmployeeService.updateEmployee(id, data);
            return res.status(200).json(ApiResponse.success(employee, 'Employee updated successfully', 200));
        } catch (err) {
            console.error('Error in updateEmployee:', err);
            const status = err.message.includes('not found') ? 404 : (err.message.includes('Validation') ? 400 : 500);
            return res.status(status).json(ApiResponse.error('Failed to update employee', status, err.message));
        }
    }

    // Delete employee
    static async deleteEmployee(req, res) {
        try {
            const { id } = req.params;
            if (!Types.ObjectId.isValid(id)) {
                return res.status(400).json(ApiResponse.error('Invalid employee ID', 400));
            }

            const result = await EmployeeService.deleteEmployee(id);
            return res.status(200).json(ApiResponse.success(result, 'Employee deleted successfully', 200));
        } catch (err) {
            const status = err.message.includes('not found') ? 404 : 500;
            return res.status(status).json(ApiResponse.error('Failed to delete employee', status, err.message));
        }
    }

    // Verify face in real-time using live image or optional stored photo
    static async verifyFace(req, res) {
        try {
            const { employeeId, image, faceDescriptor } = req.body;
            let result;

            if (employeeId) {
                if (!Types.ObjectId.isValid(employeeId)) {
                    return res.status(400).json(ApiResponse.error('Invalid employee ID', 400));
                }

                if (!image && !faceDescriptor) {
                    return res.status(400).json(ApiResponse.error('No image or descriptor provided for verification', 400));
                }

                const liveInput = faceDescriptor || Buffer.from(image, 'base64');
                result = await EmployeeService.verifyFace(employeeId, liveInput);
            } else if (faceDescriptor || image) {
                // Identity find
                console.log('[Employee] Attempting automatic identification...');
                const liveInput = faceDescriptor || Buffer.from(image, 'base64');
                result = await EmployeeService.identifyEmployee(liveInput);
            } else {
                return res.status(400).json(ApiResponse.error('Employee ID or identity input required', 400));
            }

            return res.status(200).json(ApiResponse.success(result, 'Face verification successful', 200));
        } catch (err) {
            const status = err.message.includes('not found') || err.message.includes('failed') ? 400 : 500;
            return res.status(status).json(ApiResponse.error('Face verification failed', status, err.message));
        }
    }

}

module.exports = EmployeeController;
