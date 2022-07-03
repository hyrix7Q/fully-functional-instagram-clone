import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";
import User from "./User";

const Likes = ({ route, navigation }) => {
  const { item } = route.params;
  const [isFollowed, setIsFollowed] = useState(false);
  const [userInfo, setUserInfos] = useState();

  console.log(item.likes);

  const fetchUser = async (id) => {
    let userData;
    const docRef = doc(db, "users", id);
    const snapshot = await getDoc(docRef);
    userData = snapshot.data();

    setUserInfos(userData);
  };

  const fetchCurrentUserInfos = async () => {
    const infos = await getDoc(doc(db, "users", auth.currentUser.uid));
    return infos.data();
  };

  return (
    <View style={{ marginTop: "6%" }}>
      <View
        style={{
          paddingBottom: 7,
          borderBottomColor: "grey",
          borderBottomWidth: 0.35,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
          >
            <Image
              source={require("../../assets/leftArrow.png")}
              style={{ height: 32, width: 32 }}
            />
          </TouchableOpacity>
          <Text style={{ fontSize: 19, fontWeight: "bold" }}>Likes</Text>
          <View></View>
        </View>
      </View>
      <View
        style={{
          marginTop: 20,
          paddingHorizontal: 10,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>Liked by</Text>
        <Text style={{ color: "grey" }}>{item.likes.length} likes</Text>
      </View>
      <View style={{ marginTop: 20 }}>
        {item?.likes.map((like, index) => (
          <User
            key={index}
            user={{
              userId: like.userLikedId,
              user: like.userLiked,
              userPic: like.userPic,
            }}
          />
        ))}
      </View>
    </View>
  );
};
export default Likes;
