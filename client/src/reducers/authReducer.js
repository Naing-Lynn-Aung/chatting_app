export const AuthActionTypes = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  UPDATE_USER: "UPDATE_USER"
};

export const authReducer = (state, action) => {
  switch (action.type) {
    case AuthActionTypes.LOGIN:
      return { ...state, user: action.payload, loading: false, error: null };
    case AuthActionTypes.UPDATE_USER:
      return { ...state, user: action.payload, loading: false };
    case AuthActionTypes.LOGOUT:
      return { ...state, user: null, loading: false, error: null };
    case AuthActionTypes.SET_LOADING:
      return { ...state, loading: true };
    case AuthActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};