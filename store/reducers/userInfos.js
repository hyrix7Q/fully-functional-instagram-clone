import { GET_USER_INFOS } from "../actions/userInfos";

const initialState = {
  infos: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_USER_INFOS:
      return {
        infos: action.userInfos,
      };
  }
  return state;
};
