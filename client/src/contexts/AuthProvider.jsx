import { useEffect, useReducer } from "react";
import axios from "../helpers/axios";
import { authReducer, AuthActionTypes } from "../reducers/authReducer";
import AuthContext from "./AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchUser = async () => {
      dispatch({ type: AuthActionTypes.SET_LOADING });
      try {
        const res = await axios.get("/api/users/me");
        if (res.data) {
          dispatch({ type: AuthActionTypes.LOGIN, payload: res.data });
        } else {
          dispatch({ type: AuthActionTypes.LOGOUT });
        }
      } catch (err) {
        dispatch({
          type: AuthActionTypes.SET_ERROR,
          payload: err?.response?.data?.message || "Failed to fetch user"
        });
        dispatch({ type: AuthActionTypes.LOGOUT });
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {state.loading ?
        <LoadingSpinner />
        : children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;