import api from './api';

class HRStudentService {
    async getStudents(params) {
        const response = await api.get('/hr-students', { params });
        return response;
    }

    async getPlacementStats() {
        const response = await api.get('/hr-students/placement-stats');
        return response;
    }

    async createStudent(data) {
        const response = await api.post('/hr-students', data);
        return response;
    }

    async updateStudent(id, data) {
        const response = await api.put(`/hr-students/${id}`, data);
        return response;
    }

    async deleteStudent(id) {
        const response = await api.delete(`/hr-students/${id}`);
        return response;
    }

    async markAsPlaced(id, data) {
        const response = await api.post(`/hr-students/${id}/mark-placed`, data);
        return response;
    }
}

export const hrStudentService = new HRStudentService();
export default hrStudentService;