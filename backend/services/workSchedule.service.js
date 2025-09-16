const WorkSchedule = require('../models/workSchedule.model');
const { createWorkScheduleSchema, updateWorkScheduleSchema } = require('../validations/workSchedule.validaion');

class WorkScheduleService {
    constructor() {
        this.model = WorkSchedule;
        this.createValidator = createWorkScheduleSchema;
        this.updateValidator = updateWorkScheduleSchema;
    }

    async createWorkSchedule(data) {
        const { error } = this.createValidator.validate(data);
        if (error) throw new Error(error.details[0].message);

        const workSchedule = new this.model(data);
        return await workSchedule.save();
    }

    async getWorkScheduleById(id) {
        const workSchedule = await this.model.findById(id);
        if (!workSchedule) throw new Error('Work schedule not found');
        return workSchedule;
    }

    async getAllWorkSchedules(query = {}, { page = 1, limit = 10, shift, date } = {}) {
        const filter = { ...query };

        // Optional filtering
        if (shift) filter.shift = shift;
        if (date) filter.date = new Date(date);

        // Pagination
        const skip = (page - 1) * limit;
        const data = await this.model.find(filter).skip(skip).limit(limit);

        const total = await this.model.countDocuments(filter);

        return {
            data,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async updateWorkSchedule(id, data) {
        const { error } = this.updateValidator.validate(data);
        if (error) throw new Error(error.details[0].message);

        const workSchedule = await this.model.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true
        });
        if (!workSchedule) throw new Error('Work schedule not found');
        return workSchedule;
    }

    async deleteWorkSchedule(id) {
        const workSchedule = await this.model.findByIdAndDelete(id);
        if (!workSchedule) throw new Error('Work schedule not found');
        return { message: 'Work schedule deleted successfully' };
    }
}

module.exports = new WorkScheduleService();
