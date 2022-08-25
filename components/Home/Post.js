import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseConfig";
import { useSelector } from "react-redux";

const Post = ({ item, infos, navigation, route, stateChange }) => {
  const [textShown, setTextShown] = useState(false); //To show ur remaining Text
  const [liked, setLiked] = useState();
  const [lengthMore, setLengthMore] = useState(false); //to show the "Read more & Less Line"
  const [comments, setComments] = useState();
  const [likes, setLikes] = useState(0);
  const [index, setIndex] = useState(null);
  const userInfos = useSelector((state) => state.userInfos.infos);
  console.log("HERRERERERE", item);
  console.log("ffffsdsd", infos);

  const toggleNumberOfLines = async () => {
    //To toggle the show text or hide it
    setTextShown(!textShown);
  };

  const onTextLayout = (e) => {
    setLengthMore(e.nativeEvent.lines.length >= 4); //to check the text is more than 4 lines or not
  };
  useEffect(() => {
    const getComments = async () => {
      const docRef = collection(
        db,
        "users",
        item.userId,
        "posts",
        item.postId,
        "comments"
      );
      const snapshot = await getDocs(docRef);
      const comments = [];

      snapshot.forEach((doc) => {
        comments.push({ commentId: doc.id, ...doc.data() });
      });
      return comments;
    };
    getComments().then((res) => {
      console.log("commmms", res);
      setComments(res);
      if (infos.id) {
        const ind = res.findIndex((e) => e.commentId === infos.id);
        console.log("fdssssssssssssssss", ind);
        setIndex(ind);
      }
    });
  }, []);

  //this useEffect is to see if you have already liked this post
  useEffect(() => {
    const isLiked = async () => {
      const docRef = doc(db, "users", item.userId, "posts", item.postId);
      const snapshot = await getDoc(docRef);
      console.log(snapshot.data().likes);

      if (snapshot.data().likes === 0) {
        return false;
      } else {
        const index = snapshot
          .data()
          .likes.findIndex(
            (element) => element.userLikedId === auth.currentUser.uid
          );
        console.log("BUG", index);
        if (index === -1) {
          return false;
        } else if (index === undefined) {
          return false;
        } else {
          return true;
        }
      }
    };
    console.log("HHHHHHHHHHHHHHHHHHHHH");
    isLiked().then((res) => {
      setLiked(res);
      console.log("Res", liked);
    });
  }, []);

  const onLike = async () => {
    const likes = await getDoc(
      doc(db, "users", item.userId, "posts", item.postId)
    );
    if (likes.data().likes === 0) {
      const docRef = doc(db, "users", item.userId, "posts", item.postId);
      updateDoc(docRef, {
        likes: [
          {
            userLiked: auth.currentUser.displayName,
            userLikedId: auth.currentUser.uid,
            userPic: auth.currentUser.photoURL,
          },
        ],
      }).then(() => {
        let notifId = auth.currentUser.uid + item.postId;
        if (item.userId != auth.currentUser.uid) {
          setDoc(doc(db, "users", item.userId, "notifications", notifId), {
            timestamp: serverTimestamp(),
            type: "postLike",
            postImage: item.image,
            actionUserId: auth.currentUser.uid,
            image: item.image,
            postId: item.postId,
            user: item.user,
            userId: item.userId,
          });
        }
      });
    } else {
      const docRef = doc(db, "users", item.userId, "posts", item.postId);
      updateDoc(docRef, {
        likes: [
          ...likes.data().likes,
          {
            userLiked: auth.currentUser.displayName,
            userLikedId: auth.currentUser.uid,
          },
        ],
      }).then(() => {
        let notifId = auth.currentUser.uid + item.postId;
        if (item.userId != auth.currentUser.uid) {
          setDoc(doc(db, "users", item.userId, "notifications", notifId), {
            timestamp: serverTimestamp(),
            type: "postLike",
            postImage: item.image,
            actionUserId: auth.currentUser.uid,
            image: item.image,
            postId: item.postId,
            user: item.user,
            userId: item.userId,
          });
        }
      });
    }
  };

  const getLikes = async () => {
    const likesFromDb = await getDoc(
      doc(db, "users", item.userId, "posts", item.postId)
    );
    const likes = [];
    likes.push(...likesFromDb.data().likes);
    return likes;
  };

  const onDisLike = async () => {
    getLikes().then((res) => {
      const index = res.findIndex(
        (element) => element.userLikedId === auth.currentUser.uid
      );
      res.splice(index, 1);
      if (res.length === 0) {
        const docRef = doc(db, "users", item.userId, "posts", item.postId);
        updateDoc(docRef, {
          likes: 0,
        }).then(() => {
          let notifId = auth.currentUser.uid + item.postId;

          deleteDoc(doc(db, "users", item.userId, "notifications", notifId));
        });
      } else {
        const docRef = doc(db, "users", item.userId, "posts", item.postId);
        updateDoc(docRef, {
          likes: res,
        }).then(() => {
          let notifId = auth.currentUser.uid + item.postId;

          deleteDoc(doc(db, "users", item.userId, "notifications", notifId));
        });
      }
    });
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "users", item.userId, "posts", item.postId),
      (doc) => {
        if (doc.exists()) {
          setLikes(doc.data().likes.length);
        }
      }
    );
    return unsubscribe;
  }, []);

  return (
    <View style={{ marginTop: 18, marginBottom: 10 }}>
      {/* POSTS */}
      {/* POST HEADER*/}
      <View
        style={{
          paddingHorizontal: 15,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            flexGrow: 1,
          }}
        >
          <Image
            source={{ uri: item.profilePic }}
            style={{ height: 35, width: 35, borderRadius: 17.5 }}
          />

          <Text
            style={{
              marginLeft: 10,
              fontSize: 15,
              fontWeight: "600",
            }}
            onPress={() => {
              navigation.navigate("ProfileFromHome", {
                item: item,
              });
            }}
          >
            {item.user}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            stateChange(true, item.postId);
          }}
        >
          <Image
            source={require("../../assets/dots.png")}
            style={{ height: 20, width: 20 }}
          />
        </TouchableOpacity>
      </View>
      {/* POST PIC */}
      <TouchableOpacity style={{ width: "100%", marginTop: 10 }}>
        <Image
          source={{ uri: item.image }}
          style={{ width: "100%", height: 450 }}
        />
      </TouchableOpacity>

      {/* ICONS */}
      <View style={{ marginTop: 9, paddingLeft: 11, flexDirection: "row" }}>
        <View style={{ flexDirection: "row", flexGrow: 1 }}>
          <TouchableOpacity
            onPress={() => {
              liked ? onDisLike() : onLike();
              setLiked(!liked);
            }}
          >
            <Image
              source={
                liked
                  ? require("../../assets/liked.png")
                  : require("../../assets/like.png")
              }
              style={{ height: 30, width: 30, marginRight: 12 }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("Comments", {
                item: item,
              });
            }}
          >
            <Image
              source={require("../../assets/messages.png")}
              style={{ height: 30, width: 30, marginRight: 12 }}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image
              source={require("../../assets/share.png")}
              style={{ height: 30, width: 30, marginRight: 15 }}
            />
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity>
            <Image
              source={require("../../assets/save.png")}
              style={{ height: 35, width: 35, marginRight: 15 }}
            />
          </TouchableOpacity>
        </View>
      </View>
      {/* LIKES */}
      <TouchableOpacity
        style={{ paddingHorizontal: 11 }}
        onPress={() => {
          navigation.navigate("Likes", {
            item,
          });
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: "bold" }}>{likes} Likes</Text>
      </TouchableOpacity>
      {/* STATUS */}
      <View style={{ paddingHorizontal: 11 }}>
        <Text
          onTextLayout={onTextLayout}
          numberOfLines={textShown ? undefined : 4}
          style={{ fontWeight: "600" }}
        >
          <Text
            style={{ fontSize: 16, fontWeight: "bold" }}
            onPress={() => {
              navigation.navigate("ProfileFromHome", {
                item: item,
              });
            }}
          >
            {item.user}{" "}
          </Text>

          {item.caption}
        </Text>

        {lengthMore ? (
          <Text onPress={toggleNumberOfLines} style={{ color: "grey" }}>
            {textShown ? "Read less..." : "Read more..."}
          </Text>
        ) : null}
      </View>

      {/* Comments */}
      <TouchableOpacity
        style={{ paddingHorizontal: 11 }}
        onPress={() => {
          navigation.navigate("Comments", {
            item: item,
          });
        }}
      >
        <Text style={{ color: "grey", fontSize: 15 }}>
          {comments?.length === 0
            ? "No Comments"
            : comments?.length === 1
            ? "View Comment"
            : `View All ${comments?.length} Comments`}
        </Text>
      </TouchableOpacity>
      {infos.id && index != null ? (
        <View style={{ paddingHorizontal: 11, marginTop: 10 }}>
          <View style={{ flexDirection: "row" }}>
            <Text
              numberOfLines={2}
              style={{ fontSize: 15, fontWeight: "bold" }}
              onPress={() => {
                navigation.navigate("ProfileFromHome", {
                  item: { userId: comments[index].userId },
                });
              }}
            >
              {comments[index]?.username}
              <Text style={{ fontWeight: "100" }}>
                {" "}
                {comments[index]?.comment}
              </Text>
            </Text>
          </View>
        </View>
      ) : null}
      {comments?.length != 0 && !infos.id && (
        <View style={{ paddingHorizontal: 11, marginTop: 10 }}>
          {comments?.length >= 1 && (
            <View style={{ flexDirection: "row" }}>
              <Text
                numberOfLines={2}
                style={{ fontSize: 15, fontWeight: "bold" }}
                onPress={() => {
                  navigation.navigate("ProfileFromHome", {
                    item: { userId: comments[0].userId },
                  });
                }}
              >
                {comments[0]?.username}
                <Text style={{ fontWeight: "100" }}>
                  {" "}
                  {comments[0]?.comment}
                </Text>
              </Text>
            </View>
          )}

          {comments?.length > 1 && (
            <View style={{ marginTop: 5 }}>
              <Text
                numberOfLines={2}
                style={{ fontSize: 15, fontWeight: "bold" }}
                onPress={() => {
                  navigation.navigate("ProfileFromHome", {
                    item: { userId: comments[1].userId },
                  });
                }}
              >
                {comments[1]?.username}
                <Text style={{ fontWeight: "100" }}>
                  {" "}
                  {comments[1]?.comment}
                </Text>
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default Post;
