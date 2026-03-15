import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = axios.create({ baseURL: API_URL });

// Attach Clerk token to every request
export function setAuthToken(token: string | null) {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
}

// ─── Hackathons ──────────────────────────────────────────────────────────────
export const getHackathons = () => api.get('/hackathons').then(r => r.data);
export const getAllHackathons = () => api.get('/hackathons/all').then(r => r.data);
export const getHackathon = (id: number) => api.get(`/hackathons/${id}`).then(r => r.data);
export const createHackathon = (data: unknown) => api.post('/hackathons', data).then(r => r.data);
export const updateHackathon = (id: number, data: unknown) => api.put(`/hackathons/${id}`, data).then(r => r.data);
export const deleteHackathon = (id: number) => api.delete(`/hackathons/${id}`).then(r => r.data);
export const approveHackathon = (id: number) => api.patch(`/hackathons/${id}/approve`).then(r => r.data);
export const rejectHackathon = (id: number) => api.patch(`/hackathons/${id}/reject`).then(r => r.data);
export const getPendingHackathons = () => api.get('/admin/pending-hackathons').then(r => r.data);

// ─── User / Profile ──────────────────────────────────────────────────────────
export const getMyProfile = () => api.get('/users/me').then(r => r.data);
export const completeProfile = (data: unknown) => api.post('/users/profile', data).then(r => r.data);

// ─── Enrollments ─────────────────────────────────────────────────────────────
export const enroll = (data: unknown) => api.post('/enrollments', data).then(r => r.data);
export const getMyEnrollments = () => api.get('/enrollments/me').then(r => r.data);
export const getHackathonParticipants = (id: number) => api.get(`/enrollments/hackathon/${id}`).then(res => res.data);

export const exportParticipants = async (id: number) => {
    const response = await api.get(`/enrollments/hackathon/${id}/export`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `participants_${id}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
};

// ─── Reminders ───────────────────────────────────────────────────────────────
export const setReminder = (data: unknown) => api.post('/reminders', data).then(r => r.data);
export const getMyReminders = () => api.get('/reminders/me').then(r => r.data);
export const deleteReminder = (id: number) => api.delete(`/reminders/${id}`).then(r => r.data);

// ─── Faculty ─────────────────────────────────────────────────────────────────
export const getMyHackathons = () => api.get('/faculty/hackathons').then(r => r.data);

// ─── Admin ───────────────────────────────────────────────────────────────────
export const getAdminStats = () => api.get('/admin/stats').then(r => r.data);
export const getAdminUsers = () => api.get('/admin/users').then(r => r.data);
export const deleteUser = (id: string) => api.delete(`/admin/users/${id}`).then(r => r.data);
export const updateUserRole = (id: string, role: string) => api.patch(`/admin/users/${id}/role`, { role }).then(r => r.data);
