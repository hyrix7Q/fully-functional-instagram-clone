import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { auth, db } from "../../../firebase/firebaseConfig";

const Requests = ({ navigation }) => {
  const [dms, setDms] = useState();

  const fetchChatsIds = async () => {
    const docRef = collection(
      db,
      "users",
      auth.currentUser.uid,
      "chatRequests"
    );
    const q = query(docRef, orderBy("LastMessageDate", "desc"));
    const snapshot = await getDocs(q);
    const ids = [];
    snapshot.forEach((doc) => {
      ids.push(doc.id);
    });
    console.log("fffdfdfdfd", ids);
    return ids;
  };

  const getDms = async () => {
    fetchChatsIds().then(async (snapshot) => {
      console.log("ffdfdfdfdf", snapshot);
      let tempDms = [];

      await Promise.all(
        snapshot?.map(async (snap) => {
          let LastMessage = [];
          const snapshot = await getDoc(doc(db, "users", snap));
          const docRefInside = collection(
            db,
            "users",
            auth.currentUser.uid,
            "chatRequests",
            snap,
            "messages"
          );
          const q = query(docRefInside, orderBy("timestamp", "desc"), limit(1));
          const isSeenSanp = await getDoc(
            doc(db, "users", auth.currentUser.uid, "chatRequests", snap)
          );
          const isSeen = isSeenSanp.data().seen;
          const LastMessageSnapshot = await getDocs(q);
          LastMessageSnapshot.forEach((doc) => {
            LastMessage.push(doc.data().message);
          });

          const username = snapshot.data().username;
          const profilePic = snapshot.data().profilePic;

          tempDms.push({
            username: username,
            profilePic: profilePic,
            seen: isSeen,
            lastMessage: LastMessage[0],
            userId: snap,
          });
        })
      );
      console.log("fffddd", tempDms);
      setDms(tempDms);
    });
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "users", auth.currentUser.uid, "chatRequests"),
      (snap) => {
        getDms();
      }
    );
    return unsubscribe;
  }, []);

  return (
    <View style={{ marginTop: "5%" }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderBottomColor: "grey",
          borderBottomWidth: 0.5,
          paddingVertical: 10,
          paddingHorizontal: 15,
        }}
      >
        {/*Header */}
        <View
          style={{
            flexGrow: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
          >
            <Image
              source={require("../../../assets/leftArrow.png")}
              style={{ width: 30, height: 30 }}
            />
          </TouchableOpacity>

          <View>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              Message Requests
            </Text>
          </View>
          <TouchableOpacity>
            <Text style={{ fontSize: 20 }}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={{
          paddingHorizontal: 30,

          borderBottomColor: "grey",
          borderBottomWidth: 0.45,
        }}
      >
        <Text
          style={{
            color: "grey",
            fontSize: 16,
            textAlign: "center",
            marginVertical: 20,
          }}
        >
          These messages are from people you don't follow. They'll only know
          you've seen their request if you choose Allow.
        </Text>
      </View>
      <View style={{ marginTop: 20 }}>
        {/*Messages*/}
        {dms?.map((user, index) => (
          <View
            key={index}
            style={{
              paddingHorizontal: 20,
              marginBottom: 20,
              flexDirection: "row",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                flexGrow: 1,
              }}
            >
              <TouchableOpacity>
                <Image
                  source={{ uri: user.profilePic }}
                  style={{ height: 59, width: 59, borderRadius: 32.5 }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ marginLeft: 17.5, maxWidth: 200 }}
                onPress={() => {
                  navigation.navigate("Chat", {
                    item: { userId: user.userId },
                  });
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: user.seen ? null : "bold",
                  }}
                >
                  {user.username}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: user.seen ? "grey" : "black",
                  }}
                >
                  {user?.lastMessage.length > 15
                    ? user?.lastMessage.slice(0, 15) + "..."
                    : user?.lastMessage}
                </Text>
              </TouchableOpacity>
            </View>
            {!user.seen && (
              <Image
                source={require("../../../assets/notSeen.png")}
                style={{
                  height: 15,
                  width: 15,
                  alignSelf: "center",
                  marginRight: 12,
                }}
              />
            )}
            <TouchableOpacity style={{ alignSelf: "center" }}>
              <Image
                source={require("../../../assets/camera.png")}
                style={{ height: 30, width: 30 }}
              />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

export default Requests;
