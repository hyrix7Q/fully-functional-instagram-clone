import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";
import { useSelector } from "react-redux";
import Reply from "./reply";
import Modal from "react-native-modal";

const Comment = ({ comment, fetch, item, reply, setReply, fun, postId }) => {
  const [showReplies, setShowReplies] = useState(false);
  const userInfos = useSelector((state) => state.userInfos.infos);
  const [liked, setLiked] = useState();
  const [repliesLength, setRepliesLength] = useState();
  const [modalVisibility, setModalVisibility] = useState(false);
  const [replies, setReplies] = useState();
  const [replyLiked, setReplyLiked] = useState();
  const [replyLikesFetched, setReplyLikesFetched] = useState(false);
  console.log("fdffdfdfdfd", item);

  const change = (username, id) => {
    fun(true, username, id);
  };

  const isReplyLiked = async (id) => {
    const docRef = doc(
      db,
      "users",
      comment.postUser,
      "posts",
      postId,
      "comments",
      comment.commentId,
      "replies",
      id
    );
    const snapshot = await getDoc(docRef);

    if (snapshot?.data().likes.length === 0) {
      setReplyLiked(false);
      return false;
    } else {
      const index = snapshot
        .data()
        .likes.findIndex(
          (element) => element.userLikedId === auth.currentUser.uid
        );
      if (index === -1) {
        setReplyLiked(false);
        return false;
      } else {
        setReplyLiked(true);
        return true;
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(
        db,
        "users",
        comment.postUser,
        "posts",
        postId,
        "comments",
        comment.commentId,
        "replies"
      ),
      (doc) => {
        let replies = [];
        doc.forEach((com) => {
          replies.push({ commntId: comment.commentId, ...com.data() });
        });
        console.log("repliess", replies);
        setReplies(replies);
      }
    );
    return unsubscribe;
  }, [fetch]);

  const likeComment = async () => {
    console.log(comment.userId, postId, comment.commentId);
    const likesRef = doc(
      db,
      "users",
      comment.postUser,
      "posts",
      postId,
      "comments",
      comment.commentId
    );

    let likesSnapshop = await getDoc(likesRef);
    console.log("DATAss", likesSnapshop.data());
    let likes = likesSnapshop.data().likes;

    const docRef = doc(
      db,
      "users",
      comment.postUser,
      "posts",
      postId,
      "comments",
      comment.commentId
    );
    if (likes.length != 0) {
      updateDoc(docRef, {
        likes: [
          ...likes,
          {
            userLikedName: auth.currentUser.displayName,
            userLikedId: auth.currentUser.uid,
          },
        ],
      }).then(() => {
        let notifId = auth.currentUser.uid + comment.commentId;
        setDoc(doc(db, "users", comment.userId, "notifications", notifId), {
          actionUserId: auth.currentUser.uid,
          comment: comment.comment,
          timestamp: serverTimestamp(),
          type: "commentLike",
          image: item.image,
          postId: postId,
          commentId: comment.commentId,
          user: item.user,
          userId: item.userId,
        });
      });
    } else {
      updateDoc(docRef, {
        likes: [
          {
            userLikedName: auth.currentUser.displayName,
            userLikedId: auth.currentUser.uid,
          },
        ],
      }).then(() => {
        let notifId = auth.currentUser.uid + comment.commentId;
        setDoc(doc(db, "users", comment.userId, "notifications", notifId), {
          actionUserId: auth.currentUser.uid,
          comment: comment.comment,
          timestamp: serverTimestamp(),
          type: "commentLike",
          image: item.image,
          postId: postId,
          commentId: comment.commentId,
          user: item.user,
          userId: item.userId,
        });
      });
    }
  };

  const getLikes = async () => {
    const likesRef = doc(
      db,
      "users",
      comment.postUser,
      "posts",
      postId,
      "comments",
      comment.commentId
    );
    const likesSnapshop = await getDoc(likesRef);
    const likes = likesSnapshop.data().likes;

    return likes;
  };

  const dislikeComment = async () => {
    getLikes()
      .then((res) => {
        const docRef = doc(
          db,
          "users",
          comment.postUser,
          "posts",
          postId,
          "comments",
          comment.commentId
        );
        const index = res.findIndex(
          (element) => element.userLikedId === auth.currentUser.uid
        );
        res.splice(index, 1);
        updateDoc(docRef, {
          likes: res,
        });
      })
      .then(() => {
        let notifId = auth.currentUser.uid + comment.commentId;
        deleteDoc(doc(db, "users", comment.userId, "notifications", notifId));
      });
  };

  const likeReply = async (id) => {
    const likesRef = doc(
      db,
      "users",
      comment.postUser,
      "posts",
      postId,
      "comments",
      comment.commentId,
      "replies",
      id
    );
    const likesSnapshot = await getDoc(likesRef);

    const likes = likesSnapshot.data().likes;

    const docRef = doc(
      db,
      "users",
      comment.postUser,
      "posts",
      postId,
      "comments",
      comment.commentId,
      "replies",
      id
    );
    if (likes.length != 0) {
      updateDoc(docRef, {
        likes: [
          ...likes,
          {
            userLikedName: auth.currentUser.displayName,
            userLikedId: auth.currentUser.uid,
          },
        ],
      });
    } else {
      updateDoc(docRef, {
        likes: [
          {
            userLikedName: auth.currentUser.displayName,
            userLikedId: auth.currentUser.uid,
          },
        ],
      });
    }
  };

  const getRepliesLikes = async (id) => {
    const likesRef = doc(
      db,
      "users",
      comment.postUser,
      "posts",
      postId,
      "comments",
      comment.commentId,
      "replies",
      id
    );
    const likesSnapshot = await getDoc(likesRef);
    const likes = likesSnapshot.data().likes;

    return likes;
  };

  const dislikeReplyLike = async (id) => {
    getRepliesLikes(id).then((res) => {
      const docRef = doc(
        db,
        "users",
        comment.postUser,
        "posts",
        postId,
        "comments",
        comment.commentId,
        "replies",
        id
      );
      const index = res.findIndex(
        (element) => element.userLikedId === auth.currentUser.uid
      );
      res.splice(index, 1);
      updateDoc(docRef, {
        likes: res,
      });
    });
  };

  useEffect(() => {
    const isLiked = async () => {
      const docRef = doc(
        db,
        "users",
        comment.postUser,
        "posts",
        postId,
        "comments",
        comment.commentId
      );
      const snapshot = await getDoc(docRef);
      if (snapshot?.data().likes.length === 0) {
        return false;
      } else {
        const index = snapshot
          .data()
          .likes.findIndex(
            (element) => element.userLikedId === auth.currentUser.uid
          );
        if (index === -1) {
          return false;
        } else {
          return true;
        }
      }
    };
    isLiked().then((res) => {
      setLiked(res);
    });
  }, []);

  const deleteComment = async () => {
    const docRef = doc(
      db,
      "users",
      comment.postUser,
      "posts",
      postId,
      "comments",
      comment.commentId
    );
    await deleteDoc(docRef);
  };

  return (
    <View>
      <View
        style={{
          paddingVertical: 10,
          flexDirection: "row",

          paddingHorizontal: 12,
        }}
      >
        <View style={{}}>
          <Image
            source={require("../../assets/avatar.jpg")}
            style={{
              height: 35,
              width: 35,
              marginRight: 15,
              borderRadius: 18.5,
            }}
          />
        </View>
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <Modal
            isVisible={modalVisibility}
            backdropColor="black"
            backdropOpacity={0.6}
            onBackdropPress={() => {
              setModalVisibility(false);
            }}
            style={{ alignSelf: "center" }}
          >
            <View
              style={{
                width: 200,

                backgroundColor: "white",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                style={{
                  paddingBottom: 10,
                  paddingTop: 5,
                  borderBottomColor: "grey",
                  borderBottomWidth: 0.4,
                }}
                onPress={() => {
                  deleteComment().then(() => {
                    setModalVisibility(false);
                  });
                }}
              >
                <Text style={{ color: "black", fontSize: 19 }}>
                  Delete Comment
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ paddingTop: 10, paddingBottom: 5 }}
                onPress={() => {
                  setModalVisibility(false);
                }}
              >
                <Text style={{ color: "red", fontSize: 19 }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
        <TouchableOpacity
          style={{ width: "100%", maxWidth: "90%" }}
          onLongPress={() => {
            if (comment.userId === auth.currentUser.uid) {
              setModalVisibility(true);
            }
          }}
        >
          <View style={{ flexDirection: "row", maxWidth: 280 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold", flexGrow: 1 }}>
              {comment.username}
              <Text style={{ fontWeight: "100", fontSize: 15 }}>
                {" "}
                {comment.comment}
              </Text>
            </Text>
            <TouchableOpacity
              style={{ alignSelf: "center", marginTop: 15, marginRight: 20 }}
              onPress={() => {
                liked ? dislikeComment() : likeComment();
                setLiked(!liked);
              }}
            >
              <Image
                source={
                  liked
                    ? require("../../assets/liked.png")
                    : require("../../assets/like.png")
                }
                style={{ height: 20, width: 20 }}
              />
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 5, flexDirection: "row" }}>
            <TouchableOpacity>
              <Text
                style={{
                  color: "grey",
                  fontSize: 14,
                  fontWeight: "bold",
                  marginRight: 15,
                }}
              >
                {comment.likes.length} likes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                change(comment.username, comment.commentId);
              }}
            >
              <Text
                style={{
                  color: "grey",
                  fontWeight: "bold",
                  fontSize: 14,
                }}
              >
                Reply
              </Text>
            </TouchableOpacity>
          </View>

          {replies?.length != 0 && (
            <View style={{ marginTop: 15 }}>
              {!showReplies && (
                <TouchableOpacity
                  onPress={() => {
                    setShowReplies(!showReplies);
                  }}
                >
                  <Text style={{ color: "grey", fontSize: 12 }}>
                    ---------{"  "}
                    <Text style={{ fontSize: 15, fontWeight: "bold" }}>
                      View {replies?.length} more replies
                    </Text>
                  </Text>
                </TouchableOpacity>
              )}
              {showReplies &&
                replies?.map((reply, index) => (
                  <Reply
                    reply={reply}
                    index={index}
                    comment={comment}
                    postId={postId}
                  />
                ))}
              {showReplies && (
                <TouchableOpacity
                  onPress={() => {
                    setShowReplies(!showReplies);
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "bold",
                      color: "grey",
                      marginLeft: 40,
                    }}
                  >
                    Hide replies
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Comment;
