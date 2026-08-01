import apiClient from './apiClient';

// Punch In / Mark Present
export const punchInAttendance = async (data) => {
  try {
    const response = await apiClient.post('/api/attendance/punch-in', data);
    return response.data;
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Punch in failed. Please try again.' 
    };
  }
};

// Punch Out / End Shift
export const punchOutAttendance = async (data) => {
  try {
    const response = await apiClient.post('/api/attendance/punch-out', data);
    return response.data;
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Punch out failed. Please try again.' 
    };
  }
};

// Send Heartbeat Active Time Ping (Every 60s while active)
export const sendAttendanceHeartbeat = async (data) => {
  try {
    const response = await apiClient.post('/api/attendance/heartbeat', data);
    return response.data;
  } catch (error) {
    console.error('Heartbeat ping error:', error);
    return { success: false };
  }
};

// Get Employee's Own Attendance History & Today Status
export const getMyAttendanceRecords = async (email) => {
  try {
    const response = await apiClient.get('/api/attendance/my-attendance', {
      params: { email }
    });
    return response.data;
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch attendance history.' 
    };
  }
};

// Admin: Get Attendance Report for All Employees
export const getAdminAttendanceReport = async (date) => {
  try {
    const response = await apiClient.get('/api/attendance/admin/today-report', {
      params: { date }
    });
    return response.data;
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch attendance report.' 
    };
  }
};

// Admin: Get Specific Employee History & Active Time Dossier
export const getEmployeeAttendanceDossier = async (email) => {
  try {
    const response = await apiClient.get(`/api/attendance/admin/employee-history/${encodeURIComponent(email)}`);
    return response.data;
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch employee dossier.' 
    };
  }
};
