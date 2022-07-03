import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { auth, db } from "../../../firebase/firebaseConfig";
import { deleteDoc, doc, serverTimestamp, setDoc } from "firebase/firestore";

const FollowRequests = ({ route, navigation }) => {
  const { requests } = route.params;
  const [Requests, setRequests] = useState();
  useEffect(() => {
    setRequests(requests);
  }, []);
  console.log(requests);

  const onConfirm = async (id, username) => {
    setDoc(doc(db, "users", id, "following", auth.currentUser.uid), {
      userId: auth.currentUser.uid,
      username: auth.currentUser.displayName,
    })
      .then(() => {
        setDoc(doc(db, "users", auth.currentUser.uid, "followers", id), {
          userId: id,
          username: username,
        });
      })
      .then(() => {
        let notifId = auth.currentUser.uid + id;
        setDoc(
          doc(db, "users", auth.currentUser.uid, "notifications", notifId),
          {
            type: "follow",
            actionUserId: id,
            timestamp: serverTimestamp(),
            user: username,
          }
        );
      })
      .then(() => {
        const newRequests = Requests.filter(
          (item) => item.notifId != id + auth.currentUser.uid
        );
        setRequests(newRequests);
      })
      .then(() => {
        let notifId = id + auth.currentUser.uid;
        deleteDoc(
          doc(db, "users", auth.currentUser.uid, "notifications", notifId)
        );
      });
  };

  const onDelete = async (id) => {
    deleteDoc(
      doc(
        db,
        "users",
        auth.currentUser.uid,
        "notifications",
        id + auth.currentUser.uid
      )
    ).then(() => {
      const newRequests = Requests.filter(
        (item) => item.notifId != id + auth.currentUser.uid
      );
      setRequests(newRequests);
    });
  };
  return (
    <View style={{ marginTop: "7%", flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Image
            source={require("../../../assets/leftArrow.png")}
            style={{ height: 30, width: 30 }}
          />
        </TouchableOpacity>
        <Text style={{ fontSize: 19, fontWeight: "bold" }}>
          Follow requests
        </Text>
        <View></View>
      </View>
      <ScrollView contentContainerStyle={{ marginTop: 40 }}>
        {Requests?.map((request, index) => (
          <View key={index} style={{ marginBottom: 20 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 20,
              }}
            >
              <Image
                source={{ uri: request.profilePic }}
                style={{
                  height: 55,
                  width: 55,
                  borderRadius: 27.5,
                  marginRight: 10,
                }}
              />
              <View style={{ flexGrow: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                  {request.user}
                </Text>
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: "#19A5FF",
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  marginRight: 20,
                  borderRadius: 3,
                }}
                onPress={() => {
                  onConfirm(request.actionUserId, request.user);
                }}
              >
                <Text
                  style={{ color: "white", fontSize: 15, fontWeight: "bold" }}
                >
                  Confirm
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: "white",
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  marginRight: 20,
                  borderRadius: 3,
                  borderColor: "black",
                  borderWidth: 0.45,
                }}
                onPress={() => {
                  onDelete(request.actionUserId);
                }}
              >
                <Text
                  style={{ color: "black", fontSize: 15, fontWeight: "bold" }}
                >
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default FollowRequests;
