import {
  View,
  Text,
  Alert,
  Button,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from "react-native";
import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../../firebase/firebaseConfig";
import { SafeAreaView } from "react-native-safe-area-context";
import Post from "../../components/Home/Post";
import InstaStory from "react-native-insta-story";

import {
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
  where,
} from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import * as userInfosActions from "../../store/actions/userInfos";
import Profile from "./Profile";

const Home = ({ navigation }) => {
  const screenHeight = Dimensions.get("window").height;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [emptyStory, setEmptyStory] = useState(false);
  const [chosed, setChosed] = useState("Home");
  const [posts, setPosts] = useState();
  const [post, setPost] = useState();
  const userInfos = useSelector((state) => state.userInfos.infos);
  const [id, setId] = useState();
  const [stories, setStories] = useState();
  const [showProfile, setShowProfile] = useState(false);
  const [fromHome, setFromHome] = useState(false);
  const [isTrue, setIsTrue] = useState();
  const [unreadMsgs, setUnreadMsgs] = useState(0);

  const fun = (id) => {
    setId(id);
    setShowProfile(true);
    setFromHome(true);
  };

  const fetchAgain = async () => {
    const ids = [];
    const docRef = collection(db, "users", auth.currentUser.uid, "following");
    const snapshot = await getDocs(docRef);

    snapshot.forEach((doc) => {
      ids.push(doc.id);
    });
    ids.push(auth.currentUser.uid);

    return ids;
  };

  const fetch = async () => {
    fetchAgain().then(async (post) => {
      let POSTS = [];
      await Promise.all(
        post?.map(async (id) => {
          let getUsername = await getDoc(doc(db, "users", id));
          let username = getUsername.data().username;
          let image = getUsername.data().profilePic;

          let docRefTwo = collection(db, "users", id, "posts");
          let snapshotTwo = await getDocs(docRefTwo);

          snapshotTwo.docs.map((post) => {
            POSTS.push({
              postId: post.id,
              ...post.data(),
              user: username,
              profilePic: image,
            });
          });
        })
      );
      POSTS?.sort(function (a, b) {
        return b.timestamp.seconds - a.timestamp.seconds;
      });
      setPosts(POSTS);
    });
  };
  const getStories = async (storie) => {
    let STORIES = [];
    console.log("STORIESS", storie);
    await Promise.all(
      storie?.map(async (id) => {
        let userStories = [];
        let getUsername = await getDoc(doc(db, "users", id));
        let username = getUsername.data().username;
        let profilePic = getUsername.data().profilePic;
        let docRefTwo = collection(db, "users", id, "stories");
        let q = query(docRefTwo, orderBy("timestamp", "asc"));
        let snapshotTwo = await getDocs(q);

        if (!snapshotTwo.empty) {
          let i = 1;

          await Promise.all(
            snapshotTwo.docs.map(async (storiee) => {
              let viewers = [];
              let getViewers = await getDocs(
                collection(db, "users", id, "stories", storiee.id, "viewers")
              );
              getViewers.forEach((doc) => {
                viewers.push({ ...doc.data() });
              });
              let timer = parseInt(storiee.data().timestamp.seconds);
              let timerr = new Date().getTime() / 1000 - timer;
              let time = timerr / 3600;

              if (time < 24) {
                userStories.push({
                  story_id: i,
                  viewers: viewers,
                  storieId: storiee.id,
                  story_image: storiee.data().image,
                  timestamp: storiee.data().timestamp,
                });
              } else {
                await setDoc(
                  doc(db, "users", id, "storiesArchive", storiee.id),
                  {
                    ...storiee.data(),
                  }
                ).then(() => {
                  deleteDoc(doc(db, "users", id, "stories", storiee.id));
                });
              }
              i++;
            })
          );

          STORIES.push({
            userId: id,

            user_name: username,
            stories: userStories,
            user_image: profilePic,
          });
        }
      })
    );

    return STORIES;
  };
  useEffect(() => {
    fetch();
    fetchAgain().then((res) => {
      getStories(res)
        .then((res) => {
          setEmptyStory(false);
          let NewStories = [];
          res?.map((storie, index) => {
            NewStories.push({
              ...storie,
              indexToStartFrom: viewedAllStories(storie.stories).index,
            });
          });
          return NewStories;
        })
        .then((res) => {
          let resOne = res.filter(
            (story) => story.userId != auth.currentUser.uid
          );
          let notSeen = [];

          for (const item of resOne) {
            for (const story of item.stories) {
              let found = false;
              for (const viewer of story.viewers) {
                if (story.viewers.length != 0) {
                  if (viewer.userId === auth.currentUser.uid) {
                    found = true;
                    break;
                  }
                } else {
                  break;
                }
              }
              if (!found) {
                notSeen.push(item);
                break;
              }
            }
          }
          let seen = [];

          for (const story of resOne) {
            let isFound = false;
            for (const storyTwo of notSeen) {
              if (story.userId === storyTwo.userId) {
                isFound = true;
              }
            }
            if (!isFound) {
              seen.push(story);
            }
          }

          let currentUserStory = res.filter(
            (story) => story.userId === auth.currentUser.uid
          );

          if (currentUserStory.length === 0) {
            setEmptyStory(true);
          }

          setStories([...currentUserStory, ...notSeen, ...seen]);
        });
    });
  }, []);

  const array = [
    { name: "testing2" },
    { name: "knfdsjfsdfsd" },
    { name: "Zaki Ken" },
  ];
  const onSignOut = () => {
    signOut(auth).catch((err) => {
      Alert.alert("Signout did not complete ", err, [{ text: "Okay" }]);
    });
  };

  const viewedAllStories = (stories) => {
    let i = 0;

    var index;
    if (stories.length != 0) {
      for (const story of stories) {
        let viewed = false;
        if (story.viewers.length === 0) {
          return { viewed: false, index: i };
        } else {
          for (const viewer of story.viewers) {
            console.log("first", viewer);
            if (viewer.userId === auth.currentUser.uid) {
              viewed = true;
            }
          }
          if (!viewed) {
            return { viewed: false, index: i };
          }
        }
        i++;
      }
      return { viewed: true, index: 0 };
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(
        collection(db, "users", auth.currentUser.uid, "chats"),
        where("seen", "==", false)
      ),
      (chat) => {
        setUnreadMsgs(chat.docs.length);
      }
    );
    return unsubscribe;
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {chosed === "Home" && !fromHome && (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                setIsRefreshing(true);
                setPosts();
                fetch();
                fetchAgain().then((res) => {
                  getStories(res)
                    .then((res) => {
                      setEmptyStory(false);
                      let NewStories = [];
                      res.map((storie, index) => {
                        NewStories.push({
                          ...storie,
                          indexToStartFrom: viewedAllStories(storie.stories)
                            .index,
                        });
                      });
                      return NewStories;
                    })
                    .then((res) => {
                      let resOne = res.filter(
                        (story) => story.userId != auth.currentUser.uid
                      );
                      let notSeen = [];

                      for (const item of resOne) {
                        for (const story of item.stories) {
                          let found = false;
                          for (const viewer of story.viewers) {
                            if (story.viewers.length != 0) {
                              if (viewer.userId === auth.currentUser.uid) {
                                found = true;
                                break;
                              }
                            } else {
                              break;
                            }
                          }
                          if (!found) {
                            notSeen.push(item);
                            break;
                          }
                        }
                      }
                      let seen = [];

                      for (const story of resOne) {
                        let isFound = false;
                        for (const storyTwo of notSeen) {
                          if (story.userId === storyTwo.userId) {
                            isFound = true;
                          }
                        }
                        if (!isFound) {
                          seen.push(story);
                        }
                      }

                      let currentUserStory = res.filter(
                        (story) => story.userId === auth.currentUser.uid
                      );

                      if (currentUserStory.length === 0) {
                        setEmptyStory(true);
                      }

                      setStories([...currentUserStory, ...notSeen, ...seen]);
                    });
                });

                setIsRefreshing(false);
              }}
            />
          }
        >
          <View style={{ flex: 1 }}>
            <View //THE HEADER VIEW
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 10,
                width: "100%",
              }}
            >
              <TouchableOpacity style={{ flexGrow: 1 }}>
                <Image
                  source={require("../../assets/textLogo.png")}
                  style={{ height: 50, width: 160 }}
                />
              </TouchableOpacity>
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("AddPost");
                  }}
                >
                  <Image
                    source={require("../../assets/add.png")}
                    style={{ height: 30, width: 30, marginRight: 15 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("Notifications");
                  }}
                >
                  <Image
                    source={require("../../assets/like.png")}
                    style={{ height: 30, width: 30, marginRight: 15 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ position: "relative" }}
                  onPress={() => {
                    navigation.navigate("Messages");
                  }}
                >
                  <Image
                    source={require("../../assets/messages.png")}
                    style={{ height: 30, width: 30 }}
                  />
                  {unreadMsgs != 0 && (
                    <View
                      style={{
                        backgroundColor: "red",
                        position: "absolute",
                        left: 15,
                        top: -8,
                        width: 20,
                        height: 20,
                        alignItems: "center",
                        borderRadius: 10,
                      }}
                    >
                      <Text style={{ color: "white" }}>{unreadMsgs}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView contentContainerStyle={{}}>
              <View>
                <View
                  style={{
                    paddingHorizontal: 20,
                    marginTop: 10,
                    flexDirection: "row",
                  }}
                >
                  {emptyStory && (
                    <TouchableOpacity
                      style={{
                        alignItems: "center",
                        marginRight: 15,
                      }}
                      onPress={() => {
                        navigation.navigate("AddStory");
                      }}
                    >
                      <View
                        style={{
                          position: "relative",
                        }}
                      >
                        <Image
                          source={{ uri: auth.currentUser.photoURL }}
                          style={{
                            height: 65,
                            width: 65,
                            borderRadius: 32.5,
                            borderWidth: 2,
                            borderColor: "grey",
                          }}
                        />

                        <TouchableOpacity
                          style={{
                            position: "absolute",
                            bottom: -5,
                            right: -2,
                          }}
                          onPress={() => {
                            navigation.navigate("AddStory");
                          }}
                        >
                          <Image
                            source={require("../../assets/plus.png")}
                            style={{ height: 30, width: 30 }}
                          />
                        </TouchableOpacity>
                      </View>

                      <Text style={{ fontSize: 16, color: "grey" }}>
                        Your Story
                      </Text>
                    </TouchableOpacity>
                  )}
                  {stories?.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={{
                        alignItems: "center",
                        marginRight: 15,
                      }}
                      onPress={() => {
                        navigation.navigate("Storie", {
                          stories: stories,
                          indexOfStory: index,
                        });
                      }}
                    >
                      <View
                        style={{
                          position: "relative",
                        }}
                      >
                        <Image
                          source={{ uri: item.user_image }}
                          style={{
                            height: 65,
                            width: 65,
                            borderRadius: 32.5,
                            borderWidth: 2,
                            borderColor: !viewedAllStories(item.stories).viewed
                              ? "#FF0064"
                              : "grey",
                          }}
                        />
                        {item.user_name === auth.currentUser.displayName && (
                          <TouchableOpacity
                            style={{
                              position: "absolute",
                              bottom: -5,
                              right: -2,
                            }}
                            onPress={() => {
                              navigation.navigate("AddStory");
                            }}
                          >
                            <Image
                              source={require("../../assets/plus.png")}
                              style={{ height: 30, width: 30 }}
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                      {item.user_name === auth.currentUser.displayName ? (
                        <Text style={{ fontSize: 16, color: "grey" }}>
                          Your Story
                        </Text>
                      ) : (
                        <Text style={{ fontSize: 16 }}>
                          {item.user_name.length > 10
                            ? item.user_name.slice(0, 10).toLocaleLowerCase() +
                              "..."
                            : item.user_name.toLocaleLowerCase()}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              {posts?.map((item, index) => (
                <Post
                  key={index}
                  item={item}
                  navigation={navigation}
                  fun={fun}
                  infos={{ from: "fromHome", id: null }}
                />
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      )}
      {chosed === "Profile" && <Profile user={auth.currentUser.uid} />}
    </SafeAreaView>
  );
};

export default Home;
