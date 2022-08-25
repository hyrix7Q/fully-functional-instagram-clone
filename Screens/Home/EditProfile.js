import {
  View,
  Text,
  Image,
  Modal,
  TextInput,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useEffect } from "react";
import { useState } from "react";
import { auth, db, storage } from "../../firebase/firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import * as ImagePicker from "expo-image-picker";
import uuid from "react-native-uuid";
import { getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage";

const EditProfile = ({ route, navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [privacy, setPrivacy] = useState();
  const [username, setUsername] = useState("");
  const [usernames, setUsernames] = useState([]);
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [bio, setBio] = useState("");
  const [bioBefore, setBioBefore] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const idGenerated = uuid.v4();
  const [imagePicked, setImagePicked] = useState();
  const [picUrl, setPicUrl] = useState();

  const pickImageFromLibrary = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImagePicked(result.uri);
    }
  };

  const takeImageHandler = async () => {
    const imageRes = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
    });

    if (!imageRes.cancelled) {
      setImagePicked(imageRes.uri);
    }
  };

  //Using this useEffect to fetch all the usernames to check if the username that the current user is entering already exists
  useEffect(() => {
    const fetchUsernames = async () => {
      const Ref = collection(db, "users");
      const snapshot = await getDocs(Ref);
      const usernames = [];
      snapshot.forEach((doc) => {
        usernames.push(doc.data().username);
      });
      return usernames;
    };

    fetchUsernames()
      .then((res) => {
        console.log("Usernames", res);
        if (res.length === 0) {
          setUsernames([]);
        } else {
          setUsernames(res);
        }

        setUsername(auth.currentUser.displayName);
      })
      .then(async () => {
        const docRef = doc(db, "users", auth.currentUser.uid);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setBio(snapshot.data().bio);
          setBioBefore(snapshot.data().bio);
        }
      });
  }, []);

  const changeUsername = async () => {
    const docRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(docRef, {
      username: username,
    });
    await updateProfile(auth.currentUser, {
      displayName: username,
    });
  };

  const postProfilePic = async () => {
    if (imagePicked) {
      const img = await fetch(imagePicked);
      const bytes = await img.blob();

      uploadBytes(
        ref(storage, `${auth.currentUser.uid}/profilePic/${idGenerated}.jpg`),
        bytes
      ).then(() => {
        listAll(ref(storage, `${auth.currentUser.uid}/profilePic`)).then(
          (res) => {
            res.items.forEach((item) => {
              getDownloadURL(item).then((url) => {
                setPicUrl(url);
                updateDoc(doc(db, "users", auth.currentUser.uid), {
                  profilePic: url,
                }).then(() => {
                  updateProfile(auth.currentUser, {
                    photoURL: url,
                  });
                });
              });
            });
          }
        );
      });
    }
  };

  useEffect(() => {
    const fetchInfos = async () => {
      const docRef = doc(db, "users", auth.currentUser.uid);
      const snapshot = await getDoc(docRef);

      return snapshot.data().private;
    };
    fetchInfos().then((res) => {
      setPrivacy(res);
    });
  }, []);

  const toggleSwitch = async () => {
    const docRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(docRef, {
      private: !privacy,
    });
    if (privacy) {
      const docRef = collection(
        db,
        "users",
        auth.currentUser.uid,
        "chatRequests"
      );
      const snapshot = await getDocs(docRef);
      await Promise.all(
        snapshot.docs.map(async (doc) => {
          const docRef = doc(
            db,
            "users",
            auth.currentUser.uid,
            "chatRequests",
            doc.id
          );
          const snap = await getDoc(docRef);
          setDoc(doc(db, "users", auth.currentUser.uid, "chats", docRef.id), {
            ...snap.data(),
          });
          const docRefTwo = collection(
            db,
            "users",
            auth.currentUser.uid,
            "chatRequests",
            doc.id,
            "messages"
          );
          const snapshot = await getDocs(docRefTwo);

          await Promise.all(
            snapshot.docs.map(async (mess) => {
              await setDoc(
                doc(
                  db,
                  "users",
                  auth.currentUser.uid,
                  "chats",
                  snap.id,
                  "messages",
                  mess.id
                ),
                {
                  ...mess.data(),
                }
              ).then(() => {
                deleteDoc(
                  doc(
                    db,
                    "users",
                    auth.currentUser.uid,
                    "chatRequests",
                    doc.id,
                    "messages",
                    mess.id
                  )
                );
              });
            })
          ).then(() => {
            deleteDoc(
              doc(db, "users", auth.currentUser.uid, "chatRequests", doc.id)
            );
          });
        })
      );
    }
    setPrivacy(!privacy);
  };
  return (
    <ScrollView style={{ marginTop: "5%" }}>
      <View
        style={{
          paddingHorizontal: 15,
          flexDirection: "row",
          justifyContent: "space-between",
          borderBottomColor: "grey",
          paddingBottom: 10,
          borderBottomWidth: 0.3,
        }}
      >
        <Text
          style={{ fontSize: 18 }}
          onPress={() => {
            navigation.goBack();
          }}
        >
          Cancel
        </Text>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>Edit Profile</Text>
        {!isLoading ? (
          <Text
            style={{
              color: usernameAvailable ? "#64A6FF" : "black",
              fontSize: 18,
              fontWeight: "bold",
            }}
            onPress={async () => {
              // to check if something has changed
              if (
                (usernameAvailable && imagePicked) ||
                (usernameAvailable && bio != bioBefore)
              ) {
                setIsLoading(true);
                await postProfilePic();
                if (username != auth.currentUser.displayName) {
                  await changeUsername();
                }
                if (bio != bioBefore) {
                  await updateDoc(doc(db, "users", auth.currentUser.uid), {
                    bio: bio,
                  });
                }
                navigation.goBack();
                setIsLoading(false);
              }
            }}
          >
            Done
          </Text>
        ) : (
          <ActivityIndicator size="small" color="#64A6FF" />
        )}
      </View>
      <View
        style={{
          marginTop: 20,
          alignItems: "center",
          justifyContent: "center",
          borderBottomColor: "grey",
          borderBottomWidth: 0.45,
          paddingBottom: 13,
        }}
      >
        <Image
          source={
            !imagePicked
              ? { uri: auth.currentUser.photoURL }
              : { uri: imagePicked }
          }
          style={{ height: 100, width: 100, borderRadius: 50 }}
        />

        <Text
          style={{
            marginTop: 10,
            color: "#64A6FF",
            fontSize: 16,
            fontWeight: "bold",
          }}
          onPress={() => {
            setModalVisible(true);
          }}
        >
          Change profile photo
        </Text>
      </View>

      <View
        style={{
          marginTop: 12,
          paddingHorizontal: 10,
          paddingBottom: 20,
          borderBottomColor: "grey",
          borderBottomWidth: 0.45,
        }}
      >
        <View style={{ flexDirection: "row", marginBottom: 12 }}>
          <View style={{ maxWidth: 100, width: 100, marginRight: 7 }}>
            <Text style={{ fontSize: 20 }}>Name</Text>
          </View>
          <View
            style={{
              flexGrow: 1,
              borderBottomColor: "grey",
              borderBottomWidth: 0.45,
              paddingBottom: 7,
            }}
          >
            <TextInput
              placeholder="Name"
              style={{
                fontSize: 20,
              }}
            />
          </View>
        </View>
        <View style={{ flexDirection: "row", marginBottom: 12 }}>
          <View style={{ maxWidth: 100, width: 100, marginRight: 7 }}>
            <Text style={{ fontSize: 20 }}>Username</Text>
          </View>
          <View
            style={{
              flexGrow: 1,
              borderBottomColor: "grey",
              borderBottomWidth: 0.45,
              paddingBottom: 7,
            }}
          >
            <TextInput
              placeholder="Username"
              style={{
                fontSize: 20,
              }}
              onChangeText={(username) => {
                setUsername(username);
                // if the function returns TRUE then username is not Taken
                if (usernames.length === 0) {
                  setUsernameAvailable(true);
                } else if (usernames.includes(username)) {
                  setUsernameAvailable(false);
                } else {
                  setUsernameAvailable(true);
                }
              }}
              value={username}
            />
            {!usernameAvailable && username != auth.currentUser.displayName && (
              <Text style={{ color: "red" }}>
                Username already taken , try another one!
              </Text>
            )}
          </View>
        </View>

        <View style={{ flexDirection: "row", marginBottom: 12 }}>
          <View style={{ maxWidth: "25.5%", width: "30%", marginRight: 7 }}>
            <Text style={{ fontSize: 20 }}>Bio</Text>
          </View>
          <View
            style={{
              flexGrow: 1,
              borderBottomColor: "grey",
              borderBottomWidth: 0.45,
              paddingBottom: 7,

              maxWidth: "70%",
              maxHeight: 100,
            }}
          >
            <TextInput
              placeholder="Bio"
              style={{
                fontSize: 20,
                maxWidth: "100%",
              }}
              maxLength={300}
              multiline
              value={bio}
              onChangeText={(text) => {
                setBio(text);
              }}
            />
          </View>
        </View>
      </View>

      <View>
        <View style={{ paddingHorizontal: 10, paddingTop: 10 }}>
          <Text style={{ fontSize: 21, fontWeight: "bold" }}>
            Account privacy
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 19,
            alignItems: "center",
            marginTop: 15,
          }}
        >
          <Image
            source={require("../../assets/lock.png")}
            style={{ width: 30, height: 30, marginRight: 20 }}
          />
          <Text style={{ fontSize: 18, flexGrow: 1 }}>Private account</Text>
          <Switch
            trackColor={{ false: "#E6E6E6", true: "#0091BB" }}
            thumbColor={privacy ? "white" : "white"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={privacy}
          />
        </View>
      </View>

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
            <TouchableOpacity
              style={styles.modalContent}
              onPress={() => {
                updateDoc(doc(db, "users", auth.currentUser.uid), {
                  profilePic:
                    "https://www.business2community.com/wp-content/uploads/2017/08/blank-profile-picture-973460_640.png",
                }).then(() => {
                  updateProfile(auth.currentUser, {
                    photoURL:
                      "https://www.business2community.com/wp-content/uploads/2017/08/blank-profile-picture-973460_640.png",
                  });
                });
              }}
            >
              <Text style={{ fontSize: 18 }}>Remove current photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalContent}
              onPress={() => {
                takeImageHandler().then(() => {
                  setModalVisible(false);
                });
              }}
            >
              <Text style={{ fontSize: 18 }}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalContent}
              onPress={() => {
                pickImageFromLibrary().then(() => {
                  setModalVisible(false);
                });
              }}
            >
              <Text style={{ fontSize: 18 }}>Chose from library</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalContent}
              onPress={() => {
                setModalVisible(false);
              }}
            >
              <Text style={{ fontSize: 18 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
    width: "90%",

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
  modalContent: {
    alignItems: "center",
    borderBottomColor: "grey",
    borderBottomWidth: 0.4,
    paddingBottom: 10,
    paddingTop: 10,
  },
});

export default EditProfile;
