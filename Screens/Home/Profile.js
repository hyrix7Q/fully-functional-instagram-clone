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
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";
import { signOut } from "firebase/auth";

const Profile = ({ navigation }) => {
  const [userInfo, setUserInfos] = useState();
  const [posts, setPosts] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [postStatus, setPostStatus] = useState("Posts");
  const [followInfos, setFollowInfos] = useState();
  const windowWidth = Dimensions.get("window").width;
  const user = auth.currentUser.uid;

  const onSignOut = async () => {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
      })
      .catch((error) => {
        // An error happened.
      });
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "users", user), (doc) => {
      let userData;

      userData = doc.data();
      setUserInfos(userData);
    });
    return unsubscribe;
  }, []);

  const tagged = [];

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "users", user, "posts"),
      (snapshot) => {
        let Posts = [];

        snapshot.forEach((post) => {
          Posts.push({ postId: post.id, ...post.data() });
        });
        setPosts(Posts);
      }
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    const getFollowInfos = async () => {
      const followingRef = await getDocs(
        collection(db, "users", auth.currentUser.uid, "following")
      );
      const followersRef = await getDocs(
        collection(db, "users", auth.currentUser.uid, "followers")
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
  return (
    <View style={{ flex: 1, marginTop: "5%" }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity onPress={() => {}}>
          <Image
            source={require("../../assets/leftArrow.png")}
            style={{ height: 25, height: 25 }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ justifyContent: "center", marginRight: 60 }}
          onPress={() => setModalVisible(!modalVisible)}
        >
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
            source={{ uri: userInfo?.profilePic }}
            style={{ height: 80, width: 80, borderRadius: 40 }}
          />
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("AddStory");
            }}
            style={{ position: "absolute", bottom: -10, right: -5 }}
          >
            <Image
              source={require("../../assets/plus.png")}
              style={{ height: 30, width: 30 }}
            />
          </TouchableOpacity>
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
          <View style={{ alignItems: "center" }}>
            {followInfos ? (
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                {followInfos[0]?.following}
              </Text>
            ) : (
              <ActivityIndicator size="small" color="grey" />
            )}
            <Text>Followers</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            {followInfos ? (
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                {followInfos[1]?.followers}
              </Text>
            ) : (
              <ActivityIndicator size="small" color="grey" />
            )}
            <Text>Following</Text>
          </View>
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
        <Text style={{ fontSize: 16 }}>
          Blinded by the light ... fake followers
        </Text>
      </View>
      {user === auth.currentUser.uid && (
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
      </View>
      {/* POSTS*/}
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
                      posts: posts,
                      item: {
                        ...item.item,
                        user: auth.currentUser.displayName,
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
      <View style={{ marginTop: "auto", backgroundColor: "red" }}>
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
              <View style={{ width: "80%" }}>
                <Text style={styles.modalText}>
                  Keep up with a smaller group of friends
                </Text>
                <Text style={styles.modalSubText}>
                  Create another account to stay in touch with group of your
                  friends
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => {
                  setModalVisible(!modalVisible);
                  onSignOut();
                }}
              >
                <Text style={styles.textStyle}>Try a New Account</Text>
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
    borderRadius: 20,
    width: "100%",
    height: "45%",
    alignItems: "center",
    justifyContent: "center",
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

export default Profile;
