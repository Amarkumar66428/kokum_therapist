import api from "../utils/axios";

const suggestionService = {
  getAllAiSuggestion: async (page = 1, limit = 10, type = "daily", date) => {
    try {
      const params = { page, limit, type, date };

      const response = await api.get("/ai/suggestions/all", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("error:", error);
      throw error;
    }
  },

  getDailyPatientAiSuggestion: async (
    caretakerId = null,
    selectedDate = null,
    page = 1,
    limit = 10,
    filter = ""
  ) => {
    try {
      const params = { caretakerId, page, limit };

      if (filter) {
        params.status = filter;
      }

      if (selectedDate) {
        params.date = selectedDate;
      }

      const response = await api.get("/ai/patient/suggestions", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("error:", error);
      throw error;
    }
  },

  getSpecificAiSuggestion: async (
    caretakerId,
    date,
    page = 1,
    limit = 10,
    status
  ) => {
    try {
      let params = { caretakerId, page, limit };

      if (date) {
        params.date = date;
      }

      if (status) {
        params.status = status;
      }

      const response = await api.get("/ai/specific/suggestions", {
        params,
      });

      return response.data;
    } catch (error) {
      console.error("error:", error);
      throw error;
    }
  },

  addFeedback: async (suggestionId, feedback, type) => {
    try {
      const response = await api.put(
        `/ai/suggestions/${suggestionId}/feedback`,
        { feedback, type }
      );
      return response.data;
    } catch (error) {
      console.error("error:", error);
      throw error;
    }
  },

  approveSuggestion: async (suggestionId, status, type) => {
    try {
      const response = await api.put(`/ai/suggestions/${suggestionId}/status`, {
        status,
        type,
      });
      return response.data;
    } catch (error) {
      console.error("error:", error);
      throw error;
    }
  },
};

export default suggestionService;
