import api from "../utils/axios";

const getAllPatients = async (search, page, limit) => {
  let params = {};
  if (search) params.search = search;
  if (page) params.page = page;
  if (limit) params.limit = limit;

  const response = await api.get(`/users/therapist/caretakers/full`, {
    params,
  });
  return response.data;
};

const getJourneyEntries = async (childId, date = null) => {
  let url = `/users/journey/${childId}`;
  if (date) {
    url += `?date=${date}`;
  }
  const response = await api.get(url);
  return response.data;
};

const getActivitiesByDate = async (id, date) => {
  const params = { id, date };
  const response = await api.get(`/activities/by-date`, { params });
  return response.data;
};

const getRoutines = async (id) => {
  const params = { id };
  const response = await api.get("/routines", { params });
  return response.data;
};

const getAppointmentsByPatient = async (patientId) => {
  const response = await api.get(`/appointments/patient/${patientId}`);
  return response.data;
};

const patientService = {
  getAllPatients,
  getJourneyEntries,
  getActivitiesByDate,
  getRoutines,
  getAppointmentsByPatient,
};

export default patientService;
