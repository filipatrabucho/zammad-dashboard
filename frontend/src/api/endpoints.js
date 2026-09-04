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
