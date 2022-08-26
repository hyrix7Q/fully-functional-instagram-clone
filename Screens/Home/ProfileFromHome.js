import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Modal,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";
import { signOut } from "firebase/auth";

const ProfileFromHome = ({ navigation, route }) => {
  const [userInfo, setUserInfos] = useState();
  const [posts, setPosts] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [postStatus, setPostStatus] = useState("Posts");
  const [isFollowed, setIsFollowed] = useState();
  const [isRequested, setIsRequested] = useState();
  const [followInfos, setFollowInfos] = useState();

  const windowWidth = Dimensions.get("window").width;
  const { item } = route.params;
  console.log("HHHHHH", item);

  useEffect(() => {
    const getFollowInfos = async () => {
      const followingRef = await getDocs(
        collection(db, "users", item.userId, "following")
      );
      const followersRef = await getDocs(
        collection(db, "users", item.userId, "followers")
      );

      const followInfos = [];
      var n = 0; // counter for following
      var i = 0; // counter for followers
      followingRef.forEach((doc) => {
        n++;
      });
      followersRef.forEach((doc) => {
        i++;
      });
      followInfos.push({ following: n });
      followInfos.push({ followers: i });

      return followInfos;
    };
    getFollowInfos().then((res) => {
      setFollowInfos(res);
    });
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      let userData;
      const docRef = doc(db, "users", item.userId);
      const snapshot = await getDoc(docRef);
      userData = snapshot.data();

      return userData;
    };
    fetchUser().then((res) => {
      console.log("sxqSQSQ", res);
      setUserInfos(res);
    });
  }, []);
  const tagged = [];

  const tempPosts = [1, 1, 1, 11, 1, 1, 1, 1, 11, 1, 1, 1, 1];

  useEffect(() => {
    const fetchPosts = async () => {
      const Posts = [];

      const docRef = collection(db, "users", item.userId, "posts");
      const snapshot = await getDocs(docRef);

      snapshot.forEach((post) => {
        Posts.push({ postId: post.id, ...post.data() });
      });

      return Posts;
    };
    fetchPosts().then((res) => {
      setPosts(res);
    });
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
      doc(
        db,
        "users",
        item.userId,
        "notifications",
        auth.currentUser.uid + item.userId
      ),
      (doc) => {
        if (doc.exists()) {
          setIsRequested(true);
        } else {
          setIsRequested(false);
        }
      }
    );
    return unsubscribe;
  }, []);

  const fetchCurrentUserInfos = async () => {
    const infos = await getDoc(doc(db, "users", auth.currentUser.uid));
    return infos.data();
  };

  const onFollow = async () => {
    fetchCurrentUserInfos().then((res) => {
      if (userInfo?.private) {
        let notifId = auth.currentUser.uid + item.userId;
        setDoc(doc(db, "users", item.userId, "notifications", notifId), {
          type: "followRequest",
          actionUserId: auth.currentUser.uid,
          timestamp: serverTimestamp(),
          user: auth.currentUser.displayName,
        });
      } else {
        setDoc(
          doc(db, "users", item.userId, "followers", auth.currentUser.uid),
          {
            userId: auth.currentUser.uid,
            username: res?.username,
          }
        )
          .then(() => {
            setDoc(
              doc(db, "users", auth.currentUser.uid, "following", item.userId),
              {
                userId: item.userId,
                username: userInfo?.username,
              }
            );
          })
          .then(() => {
            let notifId = auth.currentUser.uid + item.userId;
            setDoc(doc(db, "users", item.userId, "notifications", notifId), {
              type: "follow",
              actionUserId: auth.currentUser.uid,
              timestamp: serverTimestamp(),
              user: auth.currentUser.displayName,
            });
          });
      }
    });
  };

  const removeRequest = async () => {
    deleteDoc(
      doc(
        db,
        "users",
        item.userId,
        "notifications",
        auth.currentUser.uid + item.userId
      )
    );
  };

  const onUnFollow = async () => {
    deleteDoc(doc(db, "users", auth.currentUser.uid, "following", item.userId))
      .then(() => {
        deleteDoc(
          doc(db, "users", item.userId, "followers", auth.currentUser.uid)
        );
      })
      .then(() => {
        let notifId = auth.currentUser.uid + item.userId;
        deleteDoc(doc(db, "users", item.userId, "notifications", notifId));
      });
  };

  return (
    <View style={{ flex: 1, marginTop: "5%" }}>
      <View
        style={{
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
            source={require("../../assets/leftArrow.png")}
            style={{ height: 25, height: 25 }}
          />
        </TouchableOpacity>
        <TouchableOpacity style={{ justifyContent: "center", marginRight: 60 }}>
          <Text style={{ fontSize: 17.5, fontWeight: "bold" }}>
            {userInfo?.username}
          </Text>
        </TouchableOpacity>
        <View></View>
      </View>

      {/* Profile Pic / following/followers/posts */}
      <View
        style={{ flexDirection: "row", alignItems: "center", marginTop: 20 }}
      >
        <View
          style={{
            position: "relative",
            marginLeft: 10,
            marginRight: 50,
          }}
        >
          <Image
            source={require("../../assets/avatar.jpg")}
            style={{ height: 80, width: 80, borderRadius: 40 }}
          />
          <View style={{ position: "absolute", bottom: -10, right: -5 }}>
            <Image
              source={require("../../assets/plus.png")}
              style={{ height: 30, width: 30 }}
            />
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            width: "60%",
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              {posts?.length}
            </Text>
            <Text>Posts</Text>
          </View>
          <TouchableOpacity
            style={{ alignItems: "center" }}
            onPress={() => {
              navigation.navigate("FollowInfos", {
                id: item.userId,
                profilePic: userInfo?.profilePic,
                username: userInfo?.username,
                infos: "followers",
              });
            }}
          >
            {followInfos ? (
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                {followInfos[1]?.followers}
              </Text>
            ) : (
              <ActivityIndicator size="small" color="grey" />
            )}
            <Text>Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ alignItems: "center" }}
            onPress={() => {
              navigation.navigate("FollowInfos", {
                id: item.userId,
                profilePic: userInfo?.profilePic,
                username: userInfo?.username,
                infos: "following",
              });
            }}
          >
            {followInfos ? (
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                {followInfos[0]?.following}
              </Text>
            ) : (
              <ActivityIndicator size="small" color="grey" />
            )}
            <Text>Following</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/*BIO*/}
      <View
        style={{
          paddingHorizontal: 20,
          marginTop: 20,

          maxHeight: 150,
        }}
      >
        <Text style={{ fontSize: 16 }}>{userInfo?.bio}</Text>
      </View>

      {item.userId != auth.currentUser.uid ? (
        <View style={{ marginTop: 20 }}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-evenly" }}
          >
            {isFollowed ? (
              <TouchableOpacity
                style={{
                  paddingHorizontal: 40,
                  paddingVertical: 5,
                  borderColor: "grey",
                  borderWidth: 0.8,
                  borderRadius: 5,
                  flexDirection: "row",
                  justifyContent: "center",
                }}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <Text
                  style={{ color: "black", fontSize: 16, fontWeight: "bold" }}
                >
                  Following
                </Text>
                <View style={{ alignSelf: "center" }}>
                  <Image source={require("../../assets/arrowDown.png")} />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={{
                  backgroundColor: isRequested ? "white" : "#19A5FF",
                  paddingHorizontal:
                    !isFollowed && userInfo?.private ? 120 : 45,
                  paddingVertical: 5,
                  borderRadius: 5,
                  borderWidth: isRequested ? 0.4 : 0,
                  borderColor: "black",
                }}
                onPress={() => {
                  isRequested ? removeRequest() : onFollow();
                }}
              >
                {isRequested ? (
                  <Text
                    style={{ color: "black", fontSize: 16, fontWeight: "bold" }}
                  >
                    Requested
                  </Text>
                ) : (
                  <Text
                    style={{ color: "white", fontSize: 16, fontWeight: "bold" }}
                  >
                    Follow
                  </Text>
                )}
              </TouchableOpacity>
            )}
            {!isFollowed && userInfo?.private ? null : (
              <TouchableOpacity
                style={{
                  paddingHorizontal: 40,
                  paddingVertical: 5,
                  borderColor: "grey",
                  borderWidth: 0.8,
                  borderRadius: 5,
                }}
                onPress={() => {
                  navigation.navigate("Chat", {
                    item: { userId: item.userId },
                  });
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                  Message
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        <View style={{ width: "100%", marginTop: 20 }}>
          <TouchableOpacity
            style={{
              paddingVertical: 4,
              borderRadius: 5,
              alignSelf: "center",
              width: 350,
              borderColor: "grey",
              borderWidth: 1,
              alignItems: "center",
            }}
            onPress={() => {
              navigation.navigate("EditProfile", {
                userInfos: userInfo,
              });
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <View
        style={{
          flexDirection: "row",
          width: "100%",
          marginTop: 10,
        }}
      >
        {isFollowed ||
        !userInfo?.private ||
        auth.currentUser.uid === item.userId ? (
          <TouchableOpacity
            style={[
              { alignItems: "center", width: "50%", paddingVertical: 6 },
              postStatus === "Posts"
                ? { borderBottomColor: "black", borderBottomWidth: 1 }
                : null,
            ]}
            onPress={() => {
              setPostStatus("Posts");
            }}
          >
            <Image
              source={require("../../assets/matrix.png")}
              style={{ height: 30, width: 30 }}
            />
          </TouchableOpacity>
        ) : null}
        {isFollowed ||
        !userInfo?.private ||
        auth.currentUser.uid === item.userId ? (
          <TouchableOpacity
            style={[
              { alignItems: "center", width: "50%", paddingVertical: 6 },
              postStatus === "Tagged"
                ? { borderBottomColor: "black", borderBottomWidth: 1 }
                : null,
            ]}
            onPress={() => {
              setPostStatus("Tagged");
            }}
          >
            <Image
              source={require("../../assets/tagged.png")}
              style={{ height: 32, width: 32 }}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {/* POSTS*/}
      {!isFollowed &&
      userInfo?.private &&
      auth.currentUser.uid != item.userId ? (
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <Image
            source={require("../../assets/privateAccount.png")}
            style={{ height: 90, width: 90, marginBottom: 20, marginTop: 10 }}
          />
          <Text style={{ fontSize: 19, fontWeight: "bold" }}>
            This Account is Private
          </Text>
          <Text style={{ fontSize: 19 }} numberOfLines={2}>
            Follow to see their photos and videos.
          </Text>
        </View>
      ) : (
        <View style={{ marginTop: 2, flex: 1 }}>
          <FlatList
            data={postStatus === "Posts" ? posts : tagged}
            numColumns={3}
            renderItem={
              postStatus === "Posts" ? (
                (item) => (
                  <TouchableOpacity
                    style={{ marginRight: 2, marginBottom: 2 }}
                    onPress={() => {
                      navigation.navigate("Posts", {
                        index: item.index,
                        posts: posts,
                        item: {
                          ...item.item,
                          user: userInfo?.username,
                          profilePic: auth.currentUser.photoURL,
                        },
                      });
                    }}
                  >
                    <Image
                      source={{ uri: item.item.image }}
                      style={{
                        height: windowWidth / 3.05,
                        width: windowWidth / 3.05,
                      }}
                    />
                  </TouchableOpacity>
                )
              ) : (
                <View>
                  <Text>No Tagged Posts</Text>
                </View>
              )
            }
          />
        </View>
      )}
      <View style={{ marginTop: "auto" }}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert("Modal has been closed.");
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                  {userInfo?.username}
                </Text>
              </View>

              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  marginTop: 15,
                  borderTopColor: "grey",
                  borderTopWidth: 0.3,
                  paddingVertical: 10,
                }}
              >
                <Text style={{ fontSize: 18 }}>Add to Close Friends </Text>
                <Image
                  source={require("../../assets/star.png")}
                  style={{ height: 25, width: 25 }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                  alignItems: "center",
                  paddingHorizontal: 20,

                  borderTopColor: "grey",
                  borderTopWidth: 0.3,
                  paddingVertical: 10,
                  borderBottomColor: "grey",
                  borderBottomWidth: 0.3,
                }}
                onPress={() => {
                  onUnFollow();
                  setModalVisible(false);
                }}
              >
                <Text style={{ fontSize: 18 }}>Unfollow </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    bottom: 0,
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    width: "100%",
    height: "45%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 5,
    paddingHorizontal: 60,
    paddingVertical: 5,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalSubText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 16,
    color: "grey",
    textAlign: "center",
  },
});

export default ProfileFromHome;
