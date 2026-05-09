import api from './api.js';

export async function getMyRescueReports() {
  const { data } = await api.get('/rescue/me');
  return data.reports;
}

export async function updateRescueReportStatus(reportId, status, adminNote = null) {
  const response = await api.put(`/rescue/${reportId}/status`, {
    status,
    admin_note: adminNote,
  });
  return response.data;
}