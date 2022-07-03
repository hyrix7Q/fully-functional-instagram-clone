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

const Comment = ({ comment, item, reply, setReply, fun, postId }) => {
  const [showReplies, setShowReplies] = useState(false);
  const userInfos = useSelector((state) => state.userInfos.infos);
  const [liked, setLiked] = useState();
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
          replies.push({ ...com.data() });
        });
        console.log("repliess", replies);
        setReplies(replies);
      }
    );
    return unsubscribe;
  }, []);

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
        <View style={{ width: "100%", maxWidth: "90%" }}>
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
                  <View
                    style={{
                      paddingVertical: 10,
                      flexDirection: "row",
                      maxWidth: "80%",
                      paddingHorizontal: 12,
                    }}
                    key={index}
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
                    <View
                      style={{
                        width: "100%",
                        maxWidth: "90%",
                        flexGrow: 1,
                        marginRight: 20,
                      }}
                    >
                      <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                        {reply.username}
                        <Text style={{ fontWeight: "100", fontSize: 15 }}>
                          {" "}
                          {reply.comment}
                        </Text>
                      </Text>
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
                            {reply.likes.length} likes
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity>
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
                    </View>

                    <TouchableOpacity
                      style={{ alignSelf: "center", marginBottom: 15 }}
                      onPress={() => {
                        {
                          isReplyLiked(reply.replyId).then((res) => {
                            if (res) {
                              dislikeReplyLike(reply.replyId);
                              setReplyLiked(false);
                            } else {
                              likeReply(reply.replyId);
                              setReplyLiked(true);
                            }
                          });
                        }
                      }}
                    >
                      {isReplyLiked(reply.replyId) ? (
                        <Image
                          source={require("../../assets/liked.png")}
                          style={{ height: 20, width: 20 }}
                        />
                      ) : (
                        <Image
                          source={require("../../assets/like.png")}
                          style={{ height: 20, width: 20 }}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
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
        </View>
      </View>
    </View>
  );
};

export default Comment;
