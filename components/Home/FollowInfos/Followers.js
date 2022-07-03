import { View, Text, useWindowDimensions, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { collection, doc, getDocs } from "firebase/firestore";
import { auth, db } from "../../../firebase/firebaseConfig";
import User from "../User";

const Followers = ({ id, profilePic }) => {
  const [followers, setFollowers] = useState();
  const { width } = useWindowDimensions();

  console.log("fdsdsqdqs", id, profilePic);

  useEffect(() => {
    const getFollowers = async () => {
      const docRef = collection(db, "users", id, "followers");
      const snapshot = await getDocs(docRef);
      let followers = [];

      snapshot.forEach((follower) => {
        followers.push({ followerId: follower.id, ...follower.data() });
      });

      return followers;
    };
    getFollowers().then((res) => {
      console.log("dsdssdds", res);
      setFollowers(res);
    });
  }, []);
  return (
    <View style={{ flex: 1, width: width }}>
      <View style={{ alignSelf: "center" }}>
        <Text>Followers</Text>
      </View>
      <ScrollView>
        {followers?.map((follower, index) => (
          <User
            key={index}
            user={{
              userId: follower.followerId,
              user: follower.username,
              userPic: profilePic,
            }}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default Followers;
