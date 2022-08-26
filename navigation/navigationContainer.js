import { View, Text } from "react-native";
import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthNavigator, BottomTab, HomeNavigator } from "./navigationApp";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

const NavContainer = () => {
  const [user, setUser] = useState();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      console.log(user);
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
  }, []);
  return (
    <NavigationContainer>
      {!user && <AuthNavigator />}
      {user && <BottomTab />}
    </NavigationContainer>
  );
};

export default NavContainer;
