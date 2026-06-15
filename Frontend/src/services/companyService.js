import api from './api';

class CompanyService {
    async getCompanies(params) {
        const response = await api.get('/companies', { params });
        return response;
    }

    async getCompanyStats() {
        const response = await api.get('/companies/stats');
        return response;
    }

    async getHRPerformance() {
        const response = await api.get('/companies/hr-performance');
        return response;
    }

    async getCompanyById(id) {
        const response = await api.get(`/companies/${id}`);
        return response;
    }

    async getCompanyActivities(id) {
        const response = await api.get(`/companies/${id}/activities`);
        return response;
    }

    async createCompany(data) {
        const response = await api.post('/companies', data);
        return response;
    }

    async updateCompany(id, data) {
        const response = await api.put(`/companies/${id}`, data);
        return response;
    }

    async deleteCompany(id, reason = '') {
        const response = await api.delete(`/companies/${id}`, { data: { reason } });
        return response;
    }
}

export const companyService = new CompanyService();
export default companyService;  