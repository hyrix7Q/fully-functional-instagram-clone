import { View, Text, Image } from "react-native";
import React, { useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "../Screens/Authentication/Login";
import Signup from "../Screens/Authentication/Signup";
import Home from "../Screens/Home/Home";
import Comments from "../components/Home/Comments";
import AddPost from "../Screens/Home/AddPost";
import FinishAddingPost from "../Screens/Home/FinishAddingPost";
import Profile from "../Screens/Home/Profile";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import ProfileFromHome from "../Screens/Home/ProfileFromHome";
import EditProfile from "../Screens/Home/EditProfile";
import Search from "../Screens/Home/Search";
import AddStory from "../Screens/Home/addStory";
import Storie from "../Screens/Home/Storie";
import Messages from "../Screens/Home/Messages/Messages";
import Chat from "../Screens/Home/Messages/Chat";
import ChatImage from "../Screens/Home/Messages/ChatImage";
import Post from "../components/Home/Post";
import Posts from "../Screens/Home/Posts";
import Notifications from "../Screens/Home/Notifications/Notifications";
import Photo from "../Screens/Home/Notifications/Photo";
import FollowRequests from "../Screens/Home/Notifications/followRequests";
import Requests from "../Screens/Home/Messages/Requests";
import Likes from "../components/Home/Likes";
import FollowInfos from "../components/Home/FollowInfos/FollowInfos";

const AuthStack = createStackNavigator();
const HomeStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const SearchStack = createStackNavigator();

export const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={Login} />
      <AuthStack.Screen name="Signup" component={Signup} />
    </AuthStack.Navigator>
  );
};

export const HomeNavigator = () => {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home1" component={Home} />
      <HomeStack.Screen name="Comments" component={Comments} />
      <HomeStack.Screen name="AddPost" component={AddPost} />
      <HomeStack.Screen name="Finish" component={FinishAddingPost} />
      <HomeStack.Screen name="ProfileFromHome" component={ProfileFromHome} />
      <HomeStack.Screen name="AddStory" component={AddStory} />
      <HomeStack.Screen name="Storie" component={Storie} />
      <HomeStack.Screen name="Messages" component={Messages} />
      <HomeStack.Screen name="Chat" component={Chat} />
      <HomeStack.Screen name="EditProfile" component={EditProfile} />
      <HomeStack.Screen name="ChatImage" component={ChatImage} />
      <HomeStack.Screen name="Posts" component={Posts} />
      <HomeStack.Screen name="Notifications" component={Notifications} />
      <HomeStack.Screen name="Photo" component={Photo} />
      <HomeStack.Screen name="FollowRequests" component={FollowRequests} />
      <HomeStack.Screen name="Requests" component={Requests} />
      <HomeStack.Screen name="Likes" component={Likes} />
      <HomeStack.Screen name="FollowInfos" component={FollowInfos} />
    </HomeStack.Navigator>
  );
};

export const ProfileNavigator = () => {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <ProfileStack.Screen name="Profile" component={Profile} />
      <ProfileStack.Screen name="EditProfile" component={EditProfile} />
      <ProfileStack.Screen name="Posts" component={Posts} />
      <ProfileStack.Screen name="AddStory" component={AddStory} />
    </ProfileStack.Navigator>
  );
};

export const SearchNavigator = () => {
  return (
    <SearchStack.Navigator screenOptions={{ headerShown: false }}>
      <SearchStack.Screen name="Search" component={Search} />
      <SearchStack.Screen
        name="ProfileFromSearch"
        component={ProfileFromHome}
      />
      <SearchStack.Screen name="Chat" component={Chat} />
      <SearchStack.Screen name="ChatImage" component={ChatImage} />
    </SearchStack.Navigator>
  );
};

const Tab = createBottomTabNavigator();

export const BottomTab = () => {
  const [isHome, setIsHome] = useState(false);
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeNavigator}
        options={({ route }) => ({
          tabBarStyle: { display: getTabBarVisibility(route) },
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require("../assets/home1.png")
                  : require("../assets/home.png")
              }
              style={{ height: 30, width: 30 }}
            />
          ),
        })}
      />
      <Tab.Screen
        name="Search"
        component={SearchNavigator}
        options={({ route }) => ({
          tabBarStyle: { display: getTabBarVisibility(route) },

          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require("../assets/search1.png")
                  : require("../assets/search.png")
              }
              style={{ height: 30, width: 30 }}
            />
          ),
        })}
      />
      <Tab.Screen
        name="hhh"
        component={() => <View></View>}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require("../assets/reels1.png")
                  : require("../assets/reels.png")
              }
              style={{ height: 30, width: 30 }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="hhs"
        component={() => <View></View>}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require("../assets/bag1.png")
                  : require("../assets/bag.png")
              }
              style={{ height: 30, width: 30 }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={({ route }) => ({
          tabBarStyle: { display: getTabBarVisibility(route) },
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require("../assets/user1.png")
                  : require("../assets/user.png")
              }
              style={{ height: 30, width: 30 }}
            />
          ),
        })}
      />
    </Tab.Navigator>
  );
};

const getTabBarVisibility = (route) => {
  const routeName = getFocusedRouteNameFromRoute(route);

  if (
    routeName === "AddPost" ||
    routeName === "Messages" ||
    routeName === "Chat" ||
    routeName === "ChatImage" ||
    routeName === "Storie" ||
    routeName === "AddStory" ||
    routeName === "EditProfile" ||
    routeName === "Requests" ||
    routeName === "Likes" ||
    routeName === "FollowInfos"
  ) {
    return "none";
  }

  return "flex";
};
