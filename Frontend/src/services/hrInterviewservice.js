import api from './api';

class HRInterviewService {
    async getInterviews(params) {
        const response = await api.get('/hr-interviews', { params });
        return response;
    }

    async createInterview(data) {
        const response = await api.post('/hr-interviews', data);
        return response;
    }

    async updateStatus(id, data) {
        const response = await api.put(`/hr-interviews/${id}/status`, data);
        return response;
    }

    async deleteInterview(id) {
        const response = await api.delete(`/hr-interviews/${id}`);
        return response;
    }
}

export const hrInterviewService = new HRInterviewService();
export default hrInterviewService;