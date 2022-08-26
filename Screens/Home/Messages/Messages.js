import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useState, useEffect } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../../../firebase/firebaseConfig";

const Messages = ({ navigation }) => {
  const [dms, setDms] = useState();
  const [onSearch, setOnSearch] = useState(false);
  const [usernameTyped, setUsernameTyped] = useState("");
  const [userFound, setUserFound] = useState();
  const [usernames, setUsernames] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const fetchChatsIds = async () => {
    const docRef = collection(db, "users", auth.currentUser.uid, "chats");
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
      let tempDms = [];

      await Promise.all(
        snapshot?.map(async (snap) => {
          let LastMessage = [];
          const snapshot = await getDoc(doc(db, "users", snap));
          const docRefInside = collection(
            db,
            "users",
            auth.currentUser.uid,
            "chats",
            snap,
            "messages"
          );
          const q = query(docRefInside, orderBy("timestamp", "desc"), limit(1));
          const isSeenSanp = await getDoc(
            doc(db, "users", auth.currentUser.uid, "chats", snap)
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
      console.log("fdsfdsfds", tempDms);
      setDms(tempDms);
    });
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "users", auth.currentUser.uid, "chats"),
      (snap) => {
        getDms();
      }
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchUsernames = async () => {
      const Ref = collection(db, "users");
      const q = query(
        Ref,
        where("username", "!=", auth.currentUser.displayName)
      );
      const snapshot = await getDocs(q);
      const usernames = [];
      snapshot.forEach((doc) => {
        usernames.push({
          userId: doc.id,
          user: doc.data().username,
          profilePic: doc.data().profilePic,
        });
      });
      return usernames;
    };

    fetchUsernames().then((res) => {
      if (res.length === 0) {
        setUsernames([]);
      } else setUsernames(res);
    });
  }, []);

  const fetching = async (text) => {
    let users = [];
    if (text === "") {
      return;
    }
    usernames.map((user) => {
      if (user.user.includes(text)) {
        users.push(user);
      }
    });
    return users;
  };
  const final = async (text) => {
    fetching(text).then((res) => {
      setUserFound([]);
      setUserFound(res);
    });
  };

  return (
    <View style={{ marginTop: "5%", flex: 1 }}>
      {!onSearch && (
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
          <TouchableOpacity
            style={{
              flexGrow: 1,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => {
              navigation.goBack();
            }}
          >
            <Image
              source={require("../../../assets/leftArrow.png")}
              style={{ width: 30, height: 30, marginRight: 20 }}
            />
            <Text style={{ fontSize: 20 }}>Direct</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Image
              source={require("../../../assets/add.png")}
              style={{ width: 30, height: 30 }}
            />
          </TouchableOpacity>
        </View>
      )}
      <ScrollView>
        <View
          style={{
            marginTop: 20,
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
          }}
        >
          <View
            style={{
              backgroundColor: "#DDDDDD",
              marginLeft: 20,
              width: "75%",
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 10,
              maxWidth: "100%",
              flexDirection: "row",
            }}
          >
            <Image
              source={require("../../../assets/search2.png")}
              style={{ width: 25, height: 25, marginRight: 10 }}
            />
            <TextInput
              onFocus={() => setOnSearch(true)}
              placeholder="Search"
              style={{ fontSize: 18, width: 250 }}
              onChangeText={(text) => {
                setUsernameTyped(text);
                final(text);
                setInputValue(text);
              }}
            />
          </View>
          <TouchableOpacity
            style={{ marginLeft: 10, width: "25%" }}
            onPress={() => {
              setOnSearch(false);
            }}
          >
            <Text style={{ fontSize: 18 }}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {!onSearch && (
          <View
            style={{ paddingHorizontal: 20, marginTop: 20, marginBottom: 20 }}
          >
            <Text style={{ fontSize: 18, fontWeight: "600" }}>Messages</Text>
          </View>
        )}
        {!onSearch && (
          <TouchableOpacity
            style={{ alignSelf: "flex-end", marginRight: 15 }}
            onPress={() => {
              navigation.navigate("Requests");
            }}
          >
            <Text style={{ fontSize: 16, color: "#008DCA" }}>Requests</Text>
          </TouchableOpacity>
        )}
        {!onSearch && (
          <View>
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
                      {user.lastMessage.length > 15
                        ? user.lastMessage.slice(0, 15) + "..."
                        : user.lastMessage}
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
        )}
        {onSearch ? (
          <View style={{ marginTop: 20 }}>
            {userFound?.map((user, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  flexDirection: "row",
                  alignItems: "center",

                  marginBottom: 15,
                  paddingVertical: 7,
                  marginHorizontal: 20,
                }}
                onPress={() => {
                  navigation.navigate("Chat", {
                    item: { userId: user.userId },
                  });
                }}
              >
                <Image
                  source={require("../../../assets/avatar.jpg")}
                  style={{
                    height: 60,
                    width: 60,
                    borderRadius: 30,
                    marginRight: 15,
                  }}
                />
                <Text style={{ fontSize: 17 }}>{user.user}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

export default Messages;
