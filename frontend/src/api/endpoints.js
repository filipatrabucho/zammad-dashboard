import apiClient from './client';

export const getMe = () => apiClient.get('/auth/me').then((r) => r.data);

export const getHealth = () => apiClient.get('/health').then((r) => r.data);

export const getTickets = (params) => apiClient.get('/tickets', { params }).then((r) => r.data);

export const getOverview = (days) => apiClient.get('/stats/overview', { params: { days } }).then((r) => r.data);

export const getTimeseries = (days) => apiClient.get('/stats/timeseries', { params: { days } }).then((r) => r.data);

export const getSecondaryOverview = (days) =>
  apiClient.get('/stats/secondary', { params: { days } }).then((r) => r.data);

export const getWallboardSettings = () => apiClient.get('/settings/wallboard').then((r) => r.data);

export const updateWallboardSettings = (payload) =>
  apiClient.put('/settings/wallboard', payload).then((r) => r.data);

export const getServers = () => apiClient.get('/servers').then((r) => r.data);

export const createServer = (payload) => apiClient.post('/servers', payload).then((r) => r.data);

export const updateServer = (id, payload) => apiClient.put(`/servers/${id}`, payload).then((r) => r.data);

export const deleteServer = (id) => apiClient.delete(`/servers/${id}`).then((r) => r.data);

export const getServersStatus = () => apiClient.get('/servers/status').then((r) => r.data);
