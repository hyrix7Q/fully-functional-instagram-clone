import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, LogBox } from "react-native";
import { applyMiddleware, combineReducers, createStore } from "redux";
import NavContainer from "./navigation/navigationContainer";
import Login from "./Screens/Authentication/Login";
import Signup from "./Screens/Authentication/Signup";
import ReduxThunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import { Provider, useDispatch } from "react-redux";
import userInfosReducer from "./store/reducers/userInfos";
import { useEffect } from "react";
import * as userInfosActions from "./store/actions/userInfos";

LogBox.ignoreLogs(["Setting a timer"]);
export default function App() {
  const rootReducer = combineReducers({
    userInfos: userInfosReducer,
  });

  const store = createStore(
    rootReducer,
    applyMiddleware(ReduxThunk),
    composeWithDevTools()
  );

  return (
    <Provider store={store}>
      <NavContainer />
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
