import api from "../utils/axios";

const getPatients = async (payload) => {
  const response = await api.get("/chat/caretaker", payload);
  return response.data;
};

const getChatHistory = async (roomId, page) => {
  const response = await api.get(
    `/chat/sos-chat?sessionId=${roomId}&page=${page}`
  );
  return response.data;
};

const sosChatService = { getPatients, getChatHistory };

export default sosChatService;
