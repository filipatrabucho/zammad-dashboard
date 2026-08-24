import apiClient from './client';

export const getMe = () => apiClient.get('/auth/me').then((r) => r.data);

export const getHealth = () => apiClient.get('/health').then((r) => r.data);

export const getTickets = (params) => apiClient.get('/tickets', { params }).then((r) => r.data);

export const getTicket = (id) => apiClient.get(`/tickets/${id}`).then((r) => r.data);

export const getGroups = () => apiClient.get('/groups').then((r) => r.data);

export const getStates = () => apiClient.get('/states').then((r) => r.data);

export const getUsers = () => apiClient.get('/users').then((r) => r.data);

export const getOverview = (days) => apiClient.get('/stats/overview', { params: { days } }).then((r) => r.data);

export const getTimeseries = (days) => apiClient.get('/stats/timeseries', { params: { days } }).then((r) => r.data);

export const getLogContainers = () => apiClient.get('/logs').then((r) => r.data);

export const getLogs = (container, tail) =>
  apiClient.get(`/logs/${encodeURIComponent(container)}`, { params: { tail } }).then((r) => r.data);

export const getWallboardSettings = () => apiClient.get('/settings/wallboard').then((r) => r.data);

export const updateWallboardSettings = (payload) =>
  apiClient.put('/settings/wallboard', payload).then((r) => r.data);
