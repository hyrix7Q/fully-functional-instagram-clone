import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import uuid from "react-native-uuid";
import { getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "../../../firebase/firebaseConfig";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

const ChatImage = ({ route, navigation }) => {
  const [imagePicked, setImagePicked] = useState();
  const [isFollowed, setIsFollowed] = useState(false);

  const { infos } = route.params;
  console.log("dddd", infos);

  useEffect(() => {
    const takeImageHandler = async () => {
      const imageRes = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.5,
      });

      if (!imageRes.cancelled) {
        return imageRes.uri;
      }
    };
    const pickImageFromLibrary = async () => {
      // No permissions request is necessary for launching the image library
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      console.log(result);

      if (!result.cancelled) {
        return result.uri;
      }
    };
    infos?.method === "camera"
      ? takeImageHandler().then((res) => {
          setImagePicked(res);
        })
      : pickImageFromLibrary().then((res) => {
          setImagePicked(res);
        });
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "users", infos.userId, "followers", auth.currentUser.uid),
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

  const sendImage = async () => {
    const idGenerated = uuid.v4();

    const img = await fetch(imagePicked);
    const bytes = await img.blob();

    uploadBytes(
      ref(
        storage,
        `${auth.currentUser.uid}/messages/${infos.userId}/images/${idGenerated}.jpg`
      ),
      bytes
    ).then(async () => {
      uploadBytes(
        ref(
          storage,
          `${auth.currentUser.uid}/posts/${idGenerated}/${idGenerated}.jpg`
        ),
        bytes
      )
        .then(async () => {
          listAll(
            ref(storage, `${auth.currentUser.uid}/posts/${idGenerated}`)
          ).then((res) => {
            res.items.forEach((item) => {
              getDownloadURL(item).then(async (url) => {
                if (!isFollowed && infos.private) {
                  await setDoc(
                    doc(
                      db,
                      "users",
                      auth.currentUser.uid,
                      "chats",
                      infos.userId
                    ),
                    {
                      userId: infos.userId,
                    }
                  );
                  await setDoc(
                    doc(
                      db,
                      "users",
                      infos.userId,
                      "chatRequests",
                      auth.currentUser.uid
                    ),
                    {
                      userId: auth.currentUser.uid,
                    }
                  );
                  const docRef = collection(
                    db,
                    "users",
                    auth.currentUser.uid,
                    "chats",
                    infos.userId,
                    "messages"
                  );

                  await addDoc(docRef, {
                    format: "image",
                    message: url,
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
                        infos.userId,
                        "chatRequests",
                        auth.currentUser.uid,
                        "messages"
                      );
                      await addDoc(docRefTwo, {
                        format: "image",
                        message: url,
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
                        infos.userId,
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
                        infos.userId
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
                    doc(
                      db,
                      "users",
                      auth.currentUser.uid,
                      "chats",
                      infos.userId
                    ),
                    {
                      userId: infos.userId,
                    }
                  );

                  await setDoc(
                    doc(
                      db,
                      "users",
                      infos.userId,
                      "chats",
                      auth.currentUser.uid
                    ),
                    {
                      userId: auth.currentUser.uid,
                    }
                  );

                  const docRef = collection(
                    db,
                    "users",
                    auth.currentUser.uid,
                    "chats",
                    infos.userId,
                    "messages"
                  );
                  await addDoc(docRef, {
                    format: "picture",
                    message: url,
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
                        infos.userId,
                        "chats",
                        auth.currentUser.uid,
                        "messages"
                      );
                      await addDoc(docRefTwo, {
                        format: "picture",
                        message: url,
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
                        infos.userId,
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
                        infos.userId
                      );
                      updateDoc(docRef, {
                        seen: true,
                        LastMessageDate: serverTimestamp(),
                      });
                    });
                }
              });
            });
          });
        })
        .then(() => {
          navigation.goBack();
        });
    });
  };
  return (
    <View style={{ flex: 1, marginTop: "5%" }}>
      {imagePicked && (
        <View
          style={{
            position: "relative",
            height: "100%",
            width: "100%",
          }}
        >
          <Image
            source={{
              uri: imagePicked,
            }}
            style={{ height: "100%", width: "100%" }}
          />
          <TouchableOpacity
            style={{
              position: "absolute",
              bottom: 20,
              right: 20,
              backgroundColor: "white",
              paddingVertical: 9,
              paddingHorizontal: 15,
              flexDirection: "row",
              alignItems: "center",
              borderRadius: 20,
            }}
            onPress={sendImage}
          >
            <Image
              source={{ uri: infos.picture }}
              style={{
                height: 30,
                width: 30,
                borderRadius: 15,
                marginRight: 5,
              }}
            />
            <Text style={{ color: "black", fontSize: 16, fontWeight: "bold" }}>
              Send
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ position: "absolute" }}
            onPress={() => {
              setImagePicked();
              navigation.goBack();
            }}
          >
            <Image source={require("../../../assets/cross.png")} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ChatImage;
