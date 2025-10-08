import { useMemo } from "react";
import { useSelector } from "react-redux";
import { getCurrentUser } from "../reducer/authSlice";
import Cookies from "js-cookie";

const useAuth = () => {
  let user = useSelector(getCurrentUser);

  user = user ?? JSON.parse(Cookies.get("self"));

  return useMemo(() => user, [user]);
};

export default useAuth;
