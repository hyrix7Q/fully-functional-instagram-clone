import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  TextInput,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import Comment from "./Comment";
import { useSelector } from "react-redux";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  QuerySnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";

const Comments = ({ route, navigation }) => {
  const [userComment, setUserComment] = useState("");
  const [Comments, setComments] = useState();
  const [reply, setReply] = useState(false);
  const [replyTo, setReplyTo] = useState("");
  const [fetch, setFetch] = useState();
  const userInfos = useSelector((state) => state.userInfos.infos);
  const [commentId, setCommentId] = useState("");
  const { item } = route.params;
  const windowWidt = Dimensions.get("window").width;

  const func = (x, username, id) => {
    setReply(x);
    setReplyTo(username);
    setCommentId(id);
  };

  const publishComment = async () => {
    const commentAdded = addDoc(
      collection(db, "users", item.userId, "posts", item.postId, "comments"),
      {
        profilePic: require("../../assets/avatar.jpg"),
        username: auth.currentUser.displayName,
        userId: auth.currentUser.uid,
        comment: userComment,
        likes: [],
        replies: [],
        timestamp: serverTimestamp(),
      }
    );
    return commentAdded;
  };

  const publishReply = async () => {
    const docRef = collection(
      db,
      "users",
      item.userId,
      "posts",
      item.postId,
      "comments",
      commentId,
      "replies"
    );
    const addedReply = await addDoc(docRef, {
      profilePic: require("../../assets/avatar.jpg"),
      username: auth.currentUser.displayName,
      userId: auth.currentUser.uid,
      comment: userComment,
      likes: [],
    });

    updateDoc(
      doc(
        db,
        "users",
        item.userId,
        "posts",
        item.postId,
        "comments",
        commentId,
        "replies",
        addedReply.id
      ),
      {
        replyId: addedReply.id,
      }
    ).then(() => {
      setReply(false);
    });
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(
        collection(db, "users", item.userId, "posts", item.postId, "comments"),
        orderBy("timestamp", "asc")
      ),
      (doc) => {
        let comments = [];
        doc.forEach((com) => {
          comments.push({
            commentId: com.id,
            ...com.data(),
            postUser: item.userId,
          });
        });
        setComments(comments);
      }
    );

    return unsubscribe;
  }, []);
  return (
    <View
      style={{
        marginTop: "5%",
        flex: 1,
        width: "100%",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 10,
          borderBottomColor: "grey",
          borderBottomWidth: 0.3,
          paddingHorizontal: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Image
            source={require("../../assets/leftArrow.png")}
            style={{ height: 30, width: 30 }}
          />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>Comments</Text>
        <Image
          source={require("../../assets/share.png")}
          style={{ height: 30, width: 30 }}
        />
      </View>
      <View
        style={{
          paddingVertical: 10,
          flexDirection: "row",

          paddingHorizontal: 12,
          paddingBottom: 10,
          borderBottomColor: "grey",
          borderBottomWidth: 0.3,
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
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>
            {item.user}
            <Text style={{ fontWeight: "100", fontSize: 15 }}>
              {" "}
              dreqsfd khqsfojs hqgjfhqs dbjfhbdsjj jjjjjjjjfssss sss fds
              kfkdsnfks dnfsdk nfsdkfd skfn sdknkkk
            </Text>
          </Text>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView>
          {Comments?.map((comment, index) => (
            <Comment
              comment={comment}
              item={item}
              key={index}
              fetch={fetch}
              setFetch={setFetch}
              fun={func}
              postId={item.postId}
            />
          ))}
        </ScrollView>
      </View>
      <View>
        {reply && (
          <View
            style={{
              backgroundColor: "#EAEAEA",
              paddingVertical: 15,
              paddingHorizontal: 15,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ color: "#929292", fontSize: 16 }}>
              Replying to {replyTo}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setReply(false);
                setReplyTo("");
              }}
            >
              <Image source={require("../../assets/blackCross.png")} />
            </TouchableOpacity>
          </View>
        )}
        <View
          style={{
            flexDirection: "row",
            paddingVertical: 10,
            marginTop: "auto",
          }}
        >
          <Image
            source={require("../../assets/avatar.jpg")}
            style={{
              width: 50,
              height: 50,
              borderRadius: 30,
              marginHorizontal: 10,
            }}
          />
          <View
            style={{
              width: 300,
              borderColor: "grey",
              borderWidth: 0.5,
              borderRadius: 30,
              paddingVertical: 7,
              alignItems: "center",
              flexDirection: "row",
              paddingHorizontal: 15,
            }}
          >
            <TextInput
              style={{
                fontSize: 16,
                flexGrow: 1,
              }}
              multiline
              placeholder={reply ? `reply to ${replyTo}` : "Add a comment.."}
              onChangeText={(text) => {
                setUserComment(text);
              }}
            />
            <TouchableOpacity
              onPress={() => {
                reply
                  ? publishReply()
                  : publishComment().then((res) => {
                      if (item.userId != auth.currentUser.uid) {
                        console.log("hghfdgfdgfed", res.id);
                        const notifId = auth.currentUser.uid + res.id;

                        setDoc(
                          doc(
                            db,
                            "users",
                            item.userId,
                            "notifications",
                            notifId
                          ),
                          {
                            comment: userComment,
                            timestamp: serverTimestamp(),
                            image: item.image,
                            type: "postComment",
                            actionUserId: auth.currentUser.uid,
                            image: item.image,
                            postId: item.postId,
                            postUserId: item.userId,
                            user: item.user,
                            commentId: res.id,
                            userId: item.userId,
                          }
                        ).then(() => {
                          setUserComment("");
                        });
                      }

                      setFetch(new Date());
                    });
              }}
            >
              <Text
                style={{ color: "#0093C2", fontSize: 16, fontWeight: "bold" }}
              >
                Post
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Comments;
