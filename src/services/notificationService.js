import api from "../utils/axios";

const notificationService = {
  registerDeviceToken: async (body) => {
    try {
      console.log("Registering device token with backend:", body);
      const response = await api.put(
        `/notification/register/deviceToken`,
        body
      );
      console.log("Device token registration successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to register device token:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
      throw error;
    }
  },

  sendNotification: async (body) => {
    try {
      const response = await api.put(`/notification/send`, body);
      return response.data;
    } catch (error) {
      console.error("something wrong", error);
      throw error;
    }
  },
  fetchNotifications: async () => {
    try {
      const response = await api.get(`/notification/byReceiver`);
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },

  markAsRead: async (type, id) => {
    try {
      const body = {
        type,
        id,
      };

      const response = await api.put(`/notification/markAsRead`, body);
      return response.data;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  deleteNotification: async (type, id) => {
    try {
      const body = {
        type,
        id,
      };
      const response = await api.put(`/notification/delete`, body);
      return response.data;
    } catch (error) {
      console.error("Error deleting notifications:", error);
      throw error;
    }
  },
};

export default notificationService;
