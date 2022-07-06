import { View, Text, useWindowDimensions, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import User from "../User";

const Following = ({ id, profilePic }) => {
  const [following, setFollowing] = useState();

  const { width } = useWindowDimensions();

  useEffect(() => {
    const getFollowing = async () => {
      const docRef = collection(db, "users", id, "following");
      const snapshot = await getDocs(docRef);
      let Following = [];

      snapshot.forEach((following) => {
        Following.push({ followingId: following.id, ...following.data() });
      });

      return Following;
    };
    getFollowing().then((res) => {
      console.log("dsqdsssssss", res);
      setFollowing(res);
    });
  }, []);
  return (
    <View style={{ flex: 1, width }}>
      <View style={{ alignSelf: "center" }}>
        <Text>Following</Text>
      </View>
      <ScrollView >
        {following?.map((following, index) => (
          <User
            key={index}
            user={{
              userId: following.followingId,
              user: following.username,
              userPic: profilePic,
            }}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default Following;
