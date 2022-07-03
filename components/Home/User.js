import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { useEffect, useState } from "react";
import {
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";

const User = ({ user }) => {
  const [isFollowed, setIsFollowed] = useState(false);
  const [userInfo, setUserInfos] = useState();

  const fetchUser = async () => {
    let userData;
    const docRef = doc(db, "users", user.userId);
    const snapshot = await getDoc(docRef);
    userData = snapshot.data();

    return userData;
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "users", user.userId, "followers", auth.currentUser.uid),
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

  const onFollow = async () => {
    fetchUser().then((res) => {
      if (res?.private) {
        let notifId = auth.currentUser.uid + user.userId;
        setDoc(doc(db, "users", user.userId, "notifications", notifId), {
          type: "followRequest",
          actionUserId: auth.currentUser.uid,
          timestamp: serverTimestamp(),
          user: auth.currentUser.displayName,
        });
      } else {
        setDoc(
          doc(db, "users", user.userId, "followers", auth.currentUser.uid),
          {
            userId: auth.currentUser.uid,
            username: auth.currentUser.displayName,
          }
        )
          .then(() => {
            setDoc(
              doc(db, "users", auth.currentUser.uid, "following", user.userId),
              {
                userId: user.userId,
                username: user.user,
              }
            );
          })
          .then(() => {
            let notifId = auth.currentUser.uid + user.userId;
            setDoc(doc(db, "users", user.userId, "notifications", notifId), {
              type: "follow",
              actionUserId: auth.currentUser.uid,
              timestamp: serverTimestamp(),
              user: auth.currentUser.displayName,
            });
            id;
          })
          .then(() => {
            setIsFollowed(true);
          });
      }
    });
  };

  const onUnFollow = async () => {
    deleteDoc(doc(db, "users", auth.currentUser.uid, "following", user.userId))
      .then(() => {
        deleteDoc(
          doc(db, "users", user.userId, "followers", auth.currentUser.uid)
        );
      })
      .then(() => {
        let notifId = auth.currentUser.uid + user.userId;
        deleteDoc(doc(db, "users", user.userId, "notifications", notifId));
      })
      .then(() => {
        setIsFollowed(false);
      });
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 20,
      }}
    >
      <TouchableOpacity
        style={{ flexDirection: "row", alignItems: "center", flexGrow: 1 }}
        onPress={() => {
          navigation.navigate("ProfileFromHome", {
            item: { userId: user.userId },
          });
        }}
      >
        <Image
          source={{ uri: user.userPic }}
          style={{ height: 55, width: 55, borderRadius: 27.5, marginRight: 15 }}
        />
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>{user.user}</Text>
      </TouchableOpacity>
      {isFollowed && auth.currentUser.uid != user.userId ? (
        <TouchableOpacity
          onPress={() => {
            onUnFollow();
          }}
          style={{
            borderColor: "black",
            borderWidth: 0.5,
            borderRadius: 5,
            width: 100,
            alignItems: "center",
            paddingVertical: 5,
          }}
        >
          <Text style={{ color: "black", fontSize: 16, fontWeight: "bold" }}>
            Following
          </Text>
        </TouchableOpacity>
      ) : auth.currentUser.uid != user.userId ? (
        <TouchableOpacity
          style={{
            backgroundColor: "#19A5FF",
            width: 100,
            paddingVertical: 5,
            alignItems: "center",
            borderRadius: 5,
          }}
          onPress={() => {
            onFollow();
          }}
        >
          <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
            Follow
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default User;
