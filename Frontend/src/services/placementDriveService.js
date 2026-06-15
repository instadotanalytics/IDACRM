import api from './api';

class PlacementDriveService {
    async getDrives(params) {
        const response = await api.get('/placement-drives', { params });
        return response;
    }

    async getDriveStats() {
        const response = await api.get('/placement-drives/stats');
        return response;
    }

    async getDriveById(id) {
        const response = await api.get(`/placement-drives/${id}`);
        return response;
    }

    async createDrive(data) {
        const response = await api.post('/placement-drives', data);
        return response;
    }

    async updateDrive(id, data) {
        const response = await api.put(`/placement-drives/${id}`, data);
        return response;
    }

    async deleteDrive(id) {
        const response = await api.delete(`/placement-drives/${id}`);
        return response;
    }

    async registerStudent(id, studentData) {
        const response = await api.post(`/placement-drives/${id}/register`, studentData);
        return response;
    }
}

export const placementDriveService = new PlacementDriveService();
export default placementDriveService;