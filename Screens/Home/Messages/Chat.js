import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Keyboard,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React, { useState, useLayoutEffect, useEffect } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../../../firebase/firebaseConfig";
import { Avatar } from "react-native-elements";

const Chat = ({ route, navigation }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState();
  const [userInfos, setUserInfos] = useState();
  const [isSeen, setIsSeen] = useState();
  const [isFollowed, setIsFollowed] = useState();
  const [allowed, setAllowed] = useState();

  const { item } = route.params;

  useEffect(() => {
    const isAllowed = async () => {
      const chatRef = doc(
        db,
        "users",
        auth.currentUser.uid,
        "chats",
        item.userId
      );
      const requestsRef = doc(
        db,
        "users",
        auth.currentUser.uid,
        "chatRequests",
        item.userId
      );
      const chatSnapshot = await getDoc(chatRef);
      const requestsSnapshot = await getDoc(requestsRef);

      if (
        (!chatSnapshot.exists() && !requestsSnapshot.exists()) ||
        chatSnapshot.exists()
      ) {
        setAllowed(true);
      } else {
        setAllowed(false);
      }
    };
    isAllowed();
  });

  {
    /*  useEffect(() => {

    const unsubscribe = onSnapshot(
      doc(db, "users", auth.currentUser.uid, "chats", item.userId),
      (doc) => {
        if (doc.exists()) {
          setAllowed(true);
        } else {
          setAllowed(false);
        }
      }
    );
    return unsubscribe;
  }, []);*/
  }

  useEffect(() => {
    if (allowed != undefined) {
      let unsubscribe = onSnapshot(
        query(
          collection(
            db,
            "users",
            auth.currentUser.uid,
            allowed ? "chats" : "chatRequests",
            item.userId,
            "messages"
          ),
          orderBy("timestamp", "asc")
        ),
        (querySnapshot) => {
          let msg = [];
          querySnapshot.forEach((doc) => {
            msg.push({ id: doc.id, data: doc.data() });
          });

          setMessages(msg);
        }
      );
      return unsubscribe;
    }
  }, [allowed]);

  useEffect(() => {
    const getUserPhotoAndUsername = async () => {
      const docRef = doc(db, "users", item.userId);
      const snapshot = await getDoc(docRef);

      return {
        username: snapshot.data().username,
        profilePic: snapshot.data().profilePic,
        private: snapshot.data().private,
      };
    };
    getUserPhotoAndUsername().then((res) => {
      setUserInfos(res);
    });
  }, []);

  useEffect(() => {
    const seen = async () => {
      const docRef = doc(
        db,
        "users",
        auth.currentUser.uid,
        "chats",
        item.userId
      );
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        updateDoc(docRef, {
          seen: true,
        });
      }
    };
    seen();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "users", item.userId, "followers", auth.currentUser.uid),
      (doc) => {
        if (doc.exists()) {
          setIsFollowed(true);
        } else {
          setIsFollowed(false);
        }
      }
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "users", item.userId, "chats", auth.currentUser.uid),
      (snapshot) => {
        if (snapshot.exists()) {
          if (snapshot.data().seen) {
            setIsSeen(true);
          } else {
            setIsSeen(false);
          }
        }
      }
    );
    return unsubscribe;
  }, []);

  const sendMessage = async () => {
    Keyboard.dismiss();
    if (message != "") {
      if (!isFollowed && userInfos.private) {
        await setDoc(
          doc(db, "users", auth.currentUser.uid, "chats", item.userId),
          {
            userId: item.userId,
          }
        );
        await setDoc(
          doc(db, "users", item.userId, "chatRequests", auth.currentUser.uid),
          {
            userId: auth.currentUser.uid,
          }
        );
        const docRef = collection(
          db,
          "users",
          auth.currentUser.uid,
          "chats",
          item.userId,
          "messages"
        );

        await addDoc(docRef, {
          format: "text",
          message: message,
          timestamp: serverTimestamp(),
          displayName: auth.currentUser.displayName,
          email: auth.currentUser.email,
          photoURL: auth.currentUser.photoURL
            ? auth.currentUser.photoURL
            : "https://www.kindpng.com/picc/m/451-4517876_default-profile-hd-png-download.png",
        })
          .then(async () => {
            const docRefTwo = collection(
              db,
              "users",
              item.userId,
              "chatRequests",
              auth.currentUser.uid,
              "messages"
            );
            await addDoc(docRefTwo, {
              format: "text",
              message: message,
              timestamp: serverTimestamp(),
              displayName: auth.currentUser.displayName,
              email: auth.currentUser.email,
              photoURL: auth.currentUser.photoURL
                ? auth.currentUser.photoURL
                : "https://www.kindpng.com/picc/m/451-4517876_default-profile-hd-png-download.png",
            });
          })
          .then(() => {
            const docRef = doc(
              db,
              "users",
              item.userId,
              "chatRequests",
              auth.currentUser.uid
            );
            updateDoc(docRef, {
              seen: false,
              LastMessageDate: serverTimestamp(),
            });
          })
          .then(() => {
            const docRef = doc(
              db,
              "users",
              auth.currentUser.uid,
              "chats",
              item.userId
            );
            updateDoc(docRef, {
              seen: true,
              LastMessageDate: serverTimestamp(),
            });
          })

          .then(() => {
            setMessage("");
          });
      } else {
        await setDoc(
          doc(db, "users", auth.currentUser.uid, "chats", item.userId),
          {
            userId: item.userId,
          }
        );

        await setDoc(
          doc(db, "users", item.userId, "chats", auth.currentUser.uid),
          {
            userId: auth.currentUser.uid,
          }
        );

        const docRef = collection(
          db,
          "users",
          auth.currentUser.uid,
          "chats",
          item.userId,
          "messages"
        );

        await addDoc(docRef, {
          format: "text",
          message: message,
          timestamp: serverTimestamp(),
          displayName: auth.currentUser.displayName,
          email: auth.currentUser.email,
          photoURL: auth.currentUser.photoURL
            ? auth.currentUser.photoURL
            : "https://www.kindpng.com/picc/m/451-4517876_default-profile-hd-png-download.png",
        })
          .then(async () => {
            const docRefTwo = collection(
              db,
              "users",
              item.userId,
              "chats",
              auth.currentUser.uid,
              "messages"
            );
            await addDoc(docRefTwo, {
              format: "text",
              message: message,
              timestamp: serverTimestamp(),
              displayName: auth.currentUser.displayName,
              email: auth.currentUser.email,
              photoURL: auth.currentUser.photoURL
                ? auth.currentUser.photoURL
                : "https://www.kindpng.com/picc/m/451-4517876_default-profile-hd-png-download.png",
            });
          })
          .then(() => {
            const docRef = doc(
              db,
              "users",
              item.userId,
              "chats",
              auth.currentUser.uid
            );
            updateDoc(docRef, {
              seen: false,
              LastMessageDate: serverTimestamp(),
            });
          })
          .then(() => {
            const docRef = doc(
              db,
              "users",
              auth.currentUser.uid,
              "chats",
              item.userId
            );
            updateDoc(docRef, {
              seen: true,
              LastMessageDate: serverTimestamp(),
            });
          })

          .then(() => {
            setMessage("");
          });
      }
    }
  };

  const requestAccept = async () => {
    setAllowed(true);
    const docRef = doc(
      db,
      "users",
      auth.currentUser.uid,
      "chatRequests",
      item.userId
    );
    const snap = await getDoc(docRef);
    setDoc(doc(db, "users", auth.currentUser.uid, "chats", docRef.id), {
      ...snap.data(),
    });
    const docRefTwo = collection(
      db,
      "users",
      auth.currentUser.uid,
      "chatRequests",
      item.userId,
      "messages"
    );
    const snapshot = await getDocs(docRefTwo);

    await Promise.all(
      snapshot.docs.map(async (mess) => {
        await setDoc(
          doc(
            db,
            "users",
            auth.currentUser.uid,
            "chats",
            snap.id,
            "messages",
            mess.id
          ),
          {
            ...mess.data(),
          }
        ).then(() => {
          deleteDoc(
            doc(
              db,
              "users",
              auth.currentUser.uid,
              "chatRequests",
              item.userId,
              "messages",
              mess.id
            )
          );
        });
      })
    ).then(() => {
      deleteDoc(
        doc(db, "users", auth.currentUser.uid, "chatRequests", item.userId)
      );
    });
  };

  const requestDelete = async () => {
    deleteDoc(
      doc(db, "users", auth.currentUser.uid, "chatRequests", item.userId)
    ).then(() => {
      navigation.goBack();
    });
  };

  return (
    <ScrollView contentContainerStyle={{ marginTop: "6%", flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 25,
          borderBottomColor: "grey",
          borderBottomWidth: 0.3,
          paddingBottom: 10,
        }}
      >
        <TouchableOpacity
          style={{ marginRight: 25 }}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Image
            source={require("../../../assets/leftArrow.png")}
            style={{ height: 30, width: 30 }}
          />
        </TouchableOpacity>
        <View
          style={{ flexDirection: "row", alignItems: "center", flexGrow: 1 }}
        >
          <TouchableOpacity style={{ marginRight: 15 }}>
            <Image
              source={{ uri: userInfos?.profilePic }}
              style={{ height: 40, width: 40, borderRadius: 20 }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              navigation.navigate("ProfileFromHome", {
                item: item,
              });
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: "bold" }}>
              {userInfos?.username}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity style={{ marginRight: 15 }}>
            <Image
              source={require("../../../assets/call.png")}
              style={{ height: 33, width: 33 }}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image
              source={require("../../../assets/videoCall.png")}
              style={{ height: 25, width: 25 }}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingTop: 15 }}>
          {messages ? (
            <>
              {messages?.map((data, index) =>
                data.data.displayName === auth.currentUser.displayName ? (
                  <View
                    key={index}
                    style={
                      data.data.format === "text"
                        ? styles.sender
                        : {
                            alignSelf: "flex-end",

                            marginRight: 15,
                            marginBottom: 20,
                            maxWidth: "80%",
                            position: "relative",
                          }
                    }
                  >
                    <Avatar
                      rounded
                      size={30}
                      right={-5}
                      bottom={-15}
                      position="absolute"
                      source={{ uri: data.data.profilePic }}
                    />
                    {data.data.format === "text" ? (
                      <>
                        <Text style={styles.senderText}>
                          {data.data.message}
                        </Text>
                        {messages[messages.length - 1].data.message ===
                          data.data.message &&
                          isSeen && (
                            <Text
                              style={{
                                color: "grey",
                                position: "absolute",
                                bottom: -20,
                                right: 0,
                              }}
                            >
                              Seen
                            </Text>
                          )}
                      </>
                    ) : (
                      <View>
                        <Image
                          source={{ uri: data.data.message }}
                          style={{ height: 250, width: 150, borderRadius: 20 }}
                        />
                      </View>
                    )}
                  </View>
                ) : (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      paddingHorizontal: 15,

                      marginBottom: 10,
                      alignItems: "center",
                    }}
                  >
                    <Image
                      source={{ uri: userInfos?.profilePic }}
                      style={{ height: 30, width: 30, borderRadius: 15 }}
                    />

                    <View
                      key={index}
                      style={
                        data.data.format === "text"
                          ? styles.receiver
                          : {
                              borderRadius: 20,
                              marginLeft: 5,
                              alignSelf: "center",
                              maxWidth: "80%",
                            }
                      }
                    >
                      {data.data.format === "text" ? (
                        <>
                          <Text style={styles.receiverText}>
                            {data.data.message}
                          </Text>
                        </>
                      ) : (
                        <View>
                          <Image
                            source={{ uri: data.data.message }}
                            style={{
                              height: 250,
                              width: 150,
                              borderRadius: 20,
                            }}
                          />
                        </View>
                      )}
                    </View>
                  </View>
                )
              )}
            </>
          ) : messages.length === 0 ? (
            <View>
              <View style={{ alignItems: "center", marginTop: 20 }}>
                <Image
                  source={{ uri: item.profilePic }}
                  style={{ height: 80, width: 80, borderRadius: 40 }}
                />
              </View>
              <View style={{ marginTop: 15, alignItems: "center" }}>
                <Text style={{ fontSize: 19, fontWeight: "bold" }}>
                  {item.user}
                </Text>
                <Text style={{ color: "grey", fontSize: 16, marginTop: 5 }}>
                  750 followers 12 posts
                </Text>
              </View>
              <TouchableOpacity
                style={{
                  marginTop: 20,
                  borderColor: "grey",
                  borderWidth: 0.5,
                  alignSelf: "center",
                  paddingHorizontal: 5,
                  paddingVertical: 5,
                  borderRadius: 7,
                }}
                onPress={() => {
                  navigation.navigate("ProfileFromHome", {
                    item: item,
                  });
                }}
              >
                <Text
                  style={{ color: "black", fontSize: 16, fontWeight: "bold" }}
                >
                  View Profile
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>
      </View>
      {allowed === undefined
        ? null
        : !allowed && (
            <View
              style={{
                paddingTop: 30,
                alignItems: "center",
                paddingBottom: 30,
                backgroundColor: "#E9E9E9",
              }}
            >
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 17, paddingHorizontal: 30 }}>
                  Accept message request from{" "}
                  <Text style={{ fontSize: 17, fontWeight: "bold" }}>
                    {userInfos?.username} ?
                  </Text>
                </Text>
                <Text
                  style={{
                    fontSize: 15,
                    marginTop: 10,
                    color: "grey",
                    textAlign: "center",
                    paddingHorizontal: 20,
                  }}
                >
                  if you accept they will also be able to video chat with you
                  and see info such as your Activity status and when you've seen
                  messages
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 40,
                  width: "100%",
                  justifyContent: "space-evenly",
                }}
              >
                <TouchableOpacity onPress={requestDelete}>
                  <Text
                    style={{ color: "red", fontSize: 21, fontWeight: "bold" }}
                  >
                    Delete
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={requestAccept}>
                  <Text style={{ fontSize: 21, fontWeight: "bold" }}>
                    Accept
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
      {allowed === undefined ? (
        <ActivityIndicator size="small" color="grey" />
      ) : (
        allowed && (
          <View
            style={{
              paddingHorizontal: 25,
              alignItems: "center",
              flexDirection: "row",
              position: "absolute",
              bottom: 0,
              maxHeight: 200,
              paddingVertical: 10,
              backgroundColor: "#EBEBEB",
              width: "100%",
            }}
          >
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("ChatImage", {
                  infos: {
                    userId: item?.userId,
                    picture: userInfos?.profilePic,
                    private: userInfos?.private,
                    method: "camera",
                  },
                });
              }}
            >
              <Image
                source={require("../../../assets/chatCamera.png")}
                style={{ height: 35, width: 35 }}
              />
            </TouchableOpacity>
            <View style={{ flexGrow: 1, maxWidth: 200, marginHorizontal: 10 }}>
              <TextInput
                placeholder="Message..."
                multiline
                style={{ fontSize: 18 }}
                onChangeText={(text) => {
                  setMessage(text);
                }}
                onSubmitEditing={() => {
                  sendMessage();
                }}
              />
            </View>
            {message === "" ? (
              <View style={{ flexDirection: "row", marginLeft: 20 }}>
                <TouchableOpacity style={{ marginRight: 15 }}>
                  <Image
                    source={require("../../../assets/mic.png")}
                    style={{ height: 35, width: 35 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("ChatImage", {
                      infos: {
                        userId: item?.userId,
                        picture: userInfos?.profilePic,
                        private: userInfos?.private,
                        method: "library",
                      },
                    });
                  }}
                >
                  <Image
                    source={require("../../../assets/imageLibrary.png")}
                    style={{ height: 35, width: 35 }}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={{ marginLeft: 20 }}
                onPress={() => {
                  sendMessage();
                }}
              >
                <Text
                  style={{ color: "#80d3fc", fontSize: 20, fontWeight: "bold" }}
                >
                  Send
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  senderName: {
    left: 10,
    paddingRight: 10,
    fontSize: 10,
    color: "black",
  },
  receiverName: { left: 10, paddingRight: 10, fontSize: 10, color: "white" },
  senderText: {
    color: "black",
    fontWeight: "bold",
    marginLeft: 10,
    paddingVertical: 5,
  },
  receiverText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 5,
    alignSelf: "center",
    paddingVertical: 5,
  },
  receiver: {
    padding: 15,
    backgroundColor: "#2B68E6",
    borderRadius: 40,
    marginLeft: 5,
    alignSelf: "center",
    maxWidth: "80%",
  },
  sender: {
    padding: 10,
    backgroundColor: "#DBDBDB",
    alignSelf: "flex-end",
    borderRadius: 20,
    marginRight: 15,
    marginBottom: 20,
    maxWidth: "80%",
    position: "relative",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 15,
  },
  textInput: {
    bottom: 0,
    height: 40,
    flex: 1,
    marginRight: 15,
    borderColor: "black",
    backgroundColor: "#ECECEC",
    borderWidth: 1,
    padding: 10,
    color: "grey",
    borderRadius: 30,
  },
});

export default Chat;
