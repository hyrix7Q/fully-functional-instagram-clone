import { auth } from "../../firebase/firebaseConfig";

export const GET_USER_INFOS = "GET_USER_INFOS";

export const getUserInfos = () => {
  return async (dispatch) => {
    const userInfos = auth.currentUser;

    dispatch({
      type: GET_USER_INFOS,
      userInfos: userInfos,
    });
  };
};
