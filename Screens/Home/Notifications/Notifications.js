import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { auth, db } from "../../../firebase/firebaseConfig";

const Notifications = ({ navigation }) => {
  const [notifs, setNotifs] = useState();
  const [infos, setInfos] = useState();
  const [requests, setRequests] = useState();

  const fetchNotifs = async () => {
    const docRef = collection(
      db,
      "users",
      auth.currentUser.uid,
      "notifications"
    );
    const q = query(docRef, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    let notifications = [];

    await Promise.all(
      snapshot.docs.map(async (notif) => {
        let docRefTwo = doc(db, "users", notif.data().actionUserId);
        let snapshotTwo = await getDoc(docRefTwo);

        notifications.push({
          notifId: notif.id,
          ...notif.data(),
          username: snapshotTwo.data().username,
          profilePic: snapshotTwo.data().profilePic,
        });
      })
    );

    return notifications;
  };

  useEffect(() => {
    fetchNotifs().then((res) => {
      let request = res.filter((item) => item.type === "followRequest");
      console.log(request);

      setRequests(request);
      setNotifs(res);
    });
  }, []);

  return (
    <View style={{ marginTop: "7%" }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 10,
          paddingBottom: 13,
          borderBottomColor: "grey",
          borderBottomWidth: 0.3,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Image
            source={require("../../../assets/leftArrow.png")}
            style={{ height: 35, width: 35, marginRight: 15 }}
          />
        </TouchableOpacity>
        <Text style={{ fontSize: 28, fontWeight: "bold" }}>Activity</Text>
      </View>
      <ScrollView style={{ marginVertical: 20 }}>
        {requests ? (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("FollowRequests", {
                requests,
              });
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 25,
              paddingHorizontal: 20,
              paddingBottom: 15,
              borderBottomColor: "grey",
              borderBottomWidth: 0.4,
            }}
          >
            <Image
              source={{ uri: requests[0]?.profilePic }}
              style={{
                height: 55,
                width: 55,
                borderRadius: 27.5,
                marginRight: 10,
              }}
            />
            <View style={{ flexGrow: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                Follow requests
              </Text>
              <Text style={{ color: "grey" }}>
                {requests[0]?.user}
                <Text>
                  {requests.length - 1 <= 0
                    ? null
                    : ` and ${requests.length - 1} more`}
                </Text>
              </Text>
            </View>
            <Image
              source={require("../../../assets/notSeen.png")}
              style={{ width: 15, height: 15 }}
            />
            <Image
              source={require("../../../assets/rightArrow.png")}
              style={{ width: 20, height: 20, marginLeft: 10 }}
            />
          </TouchableOpacity>
        ) : null}
        {notifs?.map((notif, index) =>
          notif.type === "follow" ? (
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 20,
                marginBottom: 20,
              }}
              onPress={() => {
                navigation.navigate("ProfileFromHome", {
                  item: { userId: notif.actionUserId, user: notif.user },
                });
              }}
            >
              <Image
                source={{ uri: notif.profilePic }}
                style={{
                  height: 55,
                  width: 55,
                  borderRadius: 27.5,
                  marginRight: 10,
                }}
              />
              <View style={{ maxWidth: 230 }}>
                <Text style={{ fontSize: 16 }}>
                  <Text style={{ fontWeight: "bold" }}>{notif.username}</Text>{" "}
                  started following you.{" "}
                </Text>
                <Text></Text>
              </View>
            </TouchableOpacity>
          ) : notif.type === "postLike" ? (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("Photo", {
                  item: notif,
                });
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  marginBottom: 20,
                }}
              >
                <Image
                  source={{ uri: notif.profilePic }}
                  style={{
                    height: 55,
                    width: 55,
                    borderRadius: 27.5,
                    marginRight: 10,
                  }}
                />
                <View style={{ maxWidth: 230 }}>
                  <Text style={{ fontSize: 16 }}>
                    <Text style={{ fontWeight: "bold" }}>
                      {" "}
                      {notif.username}
                    </Text>{" "}
                    liked your photo.{" "}
                  </Text>
                </View>
                <View style={{ marginLeft: "auto" }}>
                  <Image
                    source={{ uri: notif.postImage }}
                    style={{ height: 55, width: 55 }}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ) : notif.type === "postComment" ? (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("Photo", {
                  item: notif,
                });
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  marginBottom: 20,
                }}
              >
                <Image
                  source={{ uri: notif.profilePic }}
                  style={{
                    height: 55,
                    width: 55,
                    borderRadius: 27.5,
                    marginRight: 10,
                  }}
                />
                <View style={{ maxWidth: 230 }}>
                  <Text style={{ fontSize: 16 }} numberOfLines={2}>
                    <Text style={{ fontWeight: "bold" }}>
                      {" "}
                      {notif.username}
                    </Text>{" "}
                    commented: {notif.comment}
                  </Text>
                </View>
                <View style={{ marginLeft: "auto" }}>
                  <Image
                    source={{ uri: notif.image }}
                    style={{ height: 55, width: 55 }}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ) : notif.type === "commentLike" ? (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("Photo", {
                  item: notif,
                });
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  marginBottom: 20,
                }}
              >
                <Image
                  source={{ uri: notif.profilePic }}
                  style={{
                    height: 55,
                    width: 55,
                    borderRadius: 27.5,
                    marginRight: 10,
                  }}
                />
                <View style={{ maxWidth: 230 }}>
                  <Text style={{ fontSize: 16 }} numberOfLines={2}>
                    <Text style={{ fontWeight: "bold" }}>
                      {" "}
                      {notif.username}
                    </Text>{" "}
                    liked your comment : {notif.comment}
                  </Text>
                </View>
                <View style={{ marginLeft: "auto" }}>
                  <Image
                    source={{ uri: notif.image }}
                    style={{ height: 55, width: 55 }}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ) : null
        )}
      </ScrollView>
    </View>
  );
};

export default Notifications;
