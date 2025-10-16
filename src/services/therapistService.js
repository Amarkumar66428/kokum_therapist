import api from "../utils/axios";

const therapistService = {
  createChildDetails: async (data) => {
    try {
      const response = await api.post("/child-details", data);
      return response.data;
    } catch (error) {
      console.error("error:", error);
      throw error;
    }
  },
  
  getTherapistDetails: async (therapistId) => {
    try {
      const response = await api.get(`/users/therapist/${therapistId}/full`);
      return response.data;
    } catch (error) {
      console.error("error:", error);
      throw error;
    }
  },
  getTherapistPatients: async () => {
    try {
      const response = await api.get("/child-profiles/therapist/patients");
      return response.data;
    } catch (error) {
      console.error("error:", error);
      throw error;
    }
  },

  createAppointment: async (data) => {
    try {
      const response = await api.post("/appointments", data);
      return response.data;
    } catch (error) {
      console.error("error:", error);
      throw error;
    }
  },

  getAppointments: async () => {
    try {
      const response = await api.get("/appointments");
      return response.data;
    } catch (error) {
      console.error("error:", error);
      throw error;
    }
  },
};

export default therapistService;
