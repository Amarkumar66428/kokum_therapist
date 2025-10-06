import api from "../utils/axios";

const signIn = async (payload) => {
  const response = await api.post("/users/login", payload);
  return response.data;
};

const authService = { signIn };

export default authService;
