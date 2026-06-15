import api from './api';

class HRDailyReportService {
    async getReports(params) {
        const response = await api.get('/hr-daily-reports', { params });
        return response;
    }

    async getDashboardStats() {
        const response = await api.get('/hr-daily-reports/dashboard-stats');
        return response;
    }

    async getEmployees() {
        const response = await api.get('/hr-daily-reports/employees');
        return response;
    }

    async getReportById(id) {
        const response = await api.get(`/hr-daily-reports/${id}`);
        return response;
    }

    async createReport(data) {
        const response = await api.post('/hr-daily-reports', data);
        return response;
    }

    async updateReport(id, data) {
        const response = await api.put(`/hr-daily-reports/${id}`, data);
        return response;
    }

    async sendToManager(id) {
        const response = await api.post(`/hr-daily-reports/${id}/send-to-manager`);
        return response;
    }

    async markAsViewed(id) {
        const response = await api.put(`/hr-daily-reports/${id}/mark-viewed`);
        return response;
    }

    async deleteReport(id) {
        const response = await api.delete(`/hr-daily-reports/${id}`);
        return response;
    }
}

const hrDailyReportService = new HRDailyReportService();
export default hrDailyReportService;