import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import {
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";
import Modal from "react-native-modal";

const Reply = ({ reply, index, comment, postId }) => {
  const [replyLiked, setReplyLiked] = useState();
  const [replyInfos, setReplyInfos] = useState();
  const [modalVisibility, setModalVisibility] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(
        db,
        "users",
        comment.postUser,
        "posts",
        postId,
        "comments",
        comment.commentId,
        "replies",
        reply.replyId
      ),
      (snapshot) => {
        if (snapshot?.data().likes.length === 0) {
          setReplyLiked(false);
        } else {
          const index = snapshot
            .data()
            .likes.findIndex(
              (element) => element.userLikedId === auth.currentUser.uid
            );
          if (index === -1) {
            setReplyLiked(false);
          } else {
            setReplyLiked(true);
          }
        }
        setReplyInfos(snapshot.data());
      }
    );
    return unsubscribe;
  }, []);

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

  const deleteReply = async () => {
    const docRef = doc(
      db,
      "users",
      comment.postUser,
      "posts",
      postId,
      "comments",
      comment.commentId,
      "replies",
      reply.replyId
    );
    await deleteDoc(docRef);
  };

  return (
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
      <TouchableOpacity
        style={{
          width: "100%",
          maxWidth: "90%",
          flexGrow: 1,
          marginRight: 20,
        }}
        onLongPress={() => {
          setModalVisibility(true);
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>
          {reply?.username}
          <Text style={{ fontWeight: "100", fontSize: 15 }}>
            {" "}
            {reply?.comment}
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
              {reply?.likes.length} likes
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
      </TouchableOpacity>
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
                deleteReply().then(() => {
                  setModalVisibility(false);
                });
              }}
            >
              <Text style={{ color: "black", fontSize: 19 }}>Delete Reply</Text>
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
        style={{ alignSelf: "center", marginBottom: 15 }}
        onPress={() => {
          {
            if (replyLiked) {
              dislikeReplyLike(reply.replyId);
              setReplyLiked(false);
            } else {
              likeReply(reply.replyId);
              setReplyLiked(true);
            }
          }
        }}
      >
        {replyLiked ? (
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
  );
};

export default Reply;
