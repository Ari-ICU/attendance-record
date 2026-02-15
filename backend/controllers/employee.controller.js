const EmployeeService = require('../services/employee.service');
const { getDescriptor } = require('../utils/fast-face-api');
const { ApiResponse } = require('../utils/apiResponse');
const { Types } = require('mongoose');

const { v4: uuidv4 } = require('uuid');

class EmployeeController {
    // Create employee (optional image for face descriptor)
    static async createEmployee(req, res) {
        try {
            const { image, ...data } = req.body;

            // If base64 image is provided, extract face descriptor AND save image
            if (image) {
                const buffer = Buffer.from(image, 'base64');
                const descriptor = await getDescriptor(buffer);
                if (!descriptor) throw new Error('No face detected in the provided image');
                data.faceDescriptor = Array.from(descriptor);
                data.faceVerificationEnabled = true;
                data.faceVerifiedAt = new Date();

                // Store image as Data URI
                data.photoUrl = `data:image/jpeg;base64,${image}`;
            }

            const employee = await EmployeeService.createEmployee(data);
            return res.status(201).json(ApiResponse.success(employee, 'Employee created successfully', 201));
        } catch (err) {
            console.error('Error in createEmployee:', err);

            // Check if it's a validation error (Joi or Mongoose) or face recognition error
            const isValidationError = /validation/i.test(err.message);
            const isFaceError = /(face|descriptor)/i.test(err.message);

            const status = (isValidationError || isFaceError) ? 400 : 500;
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
            return res.status(200).json(ApiResponse.success(employee, 'Employee retrieved successfully', 200));
        } catch (err) {
            const status = err.message.includes('not found') ? 404 : 500;
            return res.status(status).json(ApiResponse.error('Failed to retrieve employee', status, err.message));
        }
    }

    // Get all employees
    static async getAllEmployees(req, res) {
        try {
            const result = await EmployeeService.getAllEmployees(req.query);
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
                const buffer = Buffer.from(image, 'base64');
                const descriptor = await getDescriptor(buffer);
                if (!descriptor) throw new Error('No face detected in the provided image');

                data.faceDescriptor = Array.from(descriptor);
                data.faceVerificationEnabled = true;
                data.faceVerifiedAt = new Date();

                // Store image as Data URI
                data.photoUrl = `data:image/jpeg;base64,${image}`;
            }

            const employee = await EmployeeService.updateEmployee(id, data);
            return res.status(200).json(ApiResponse.success(employee, 'Employee updated successfully', 200));
        } catch (err) {
            const status = err.message.includes('not found') ? 404 : 500;
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
            const { employeeId, image } = req.body;
            if (!Types.ObjectId.isValid(employeeId)) {
                return res.status(400).json(ApiResponse.error('Invalid employee ID', 400));
            }

            if (!image) {
                return res.status(400).json(ApiResponse.error('No image provided for verification', 400));
            }

            const liveImageBuffer = Buffer.from(image, 'base64');

            // Pass buffer directly; EmployeeService handles descriptor extraction
            const result = await EmployeeService.verifyFace(employeeId, liveImageBuffer);

            return res.status(200).json(ApiResponse.success(result, 'Face verification successful', 200));
        } catch (err) {
            const status = err.message.includes('not found') || err.message.includes('failed') ? 400 : 500;
            return res.status(status).json(ApiResponse.error('Face verification failed', status, err.message));
        }
    }

}

module.exports = EmployeeController;
