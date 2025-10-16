import api from "../utils/axios";

const patientService = {
  getAllPatients: async (search, page, limit) => {
    let params = {};
    if (search) params.search = search;
    if (page) params.page = page;
    if (limit) params.limit = limit;

    const response = await api.get(`/users/therapist/caretakers/full`, {
      params,
    });
    return response.data;
  },

  getJourneyEntries: async (childId, date = null) => {
    let url = `/users/journey/${childId}`;
    if (date) {
      url += `?date=${date}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  getActivitiesByDate: async (id, date) => {
    const params = { id, date };
    const response = await api.get(`/activities/by-date`, { params });
    return response.data;
  },

  getRoutines: async (id) => {
    const params = { id };
    const response = await api.get("/routines", { params });
    return response.data;
  },

  getAppointmentsByPatient: async (patientId) => {
    const response = await api.get(`/appointments/patient/${patientId}`);
    return response.data;
  },

  getTherapyPlanById: async (patientId, { date, all = false, planId } = {}) => {
    console.log('planId: ', planId);
    try {
      const params = {};

      if (date != null && date !== "") {
        params.date = date;
      }

      if (all) {
        params.all = true;
      }

      if (planId) {
        params.planId = planId;
      }

      const response = await api.get(`/therapy-plan/patient/${patientId}`, {
        params: Object.keys(params).length ? params : undefined,
      });

      return response.data;
    } catch (error) {
      console.error("error:", error);
      throw error;
    }
  },
};

export default patientService;
