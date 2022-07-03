import {
  View,
  Text,
  StyleSheet,
  Button,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db, storage } from "../../firebase/firebaseConfig";
import { getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage";
import uuid from "react-native-uuid";

const AddStory = ({ navigation }) => {
  const [imagePicked, setImagePicked] = useState();
  const idGenerated = uuid.v4();

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
      setImagePicked(result.uri);
    }
  };

  const shareStory = async () => {
    const img = await fetch(imagePicked);
    const bytes = await img.blob();
    setDoc(doc(db, "users", auth.currentUser.uid, "stories", idGenerated), {
      timestamp: serverTimestamp(),
    }).then(() => {
      uploadBytes(
        ref(
          storage,
          `${auth.currentUser.uid}/stories/${idGenerated}/${idGenerated}.jpg`
        ),
        bytes
      )
        .then(() => {
          listAll(
            ref(storage, `${auth.currentUser.uid}/stories/${idGenerated}`)
          ).then((res) => {
            res.items.forEach((item) => {
              getDownloadURL(item).then((url) => {
                updateDoc(
                  doc(
                    db,
                    "users",
                    auth.currentUser.uid,
                    "stories",
                    idGenerated
                  ),
                  {
                    image: url,
                  }
                );
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
    <View
      style={{
        flex: 1,
        backgroundColor: "black",
        paddingHorizontal: 5,
        marginTop: "5%",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottomWidth: 0.4,
          borderColor: "grey",
        }}
      >
        <TouchableOpacity
          onPress={() => {
            setImagePicked();
            navigation.goBack();
          }}
        >
          <Image source={require("../../assets/cross.png")} />
        </TouchableOpacity>
        <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
          New Story
        </Text>
        <TouchableOpacity disabled={!imagePicked} onPress={shareStory}>
          <Text style={{ color: "#64A6FF", fontSize: 18, fontWeight: "bold" }}>
            Next
          </Text>
        </TouchableOpacity>
      </View>
      {!imagePicked ? (
        <View
          style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
        >
          <TouchableOpacity onPress={takeImageHandler}>
            <Text style={{ color: "white", fontSize: 19 }}>Take Image</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <Image
            style={{ width: "100%", height: "100%" }}
            source={{ uri: imagePicked }}
          />
        </View>
      )}
      <TouchableOpacity
        style={{ marginTop: "auto", marginBottom: 10, alignItems: "center" }}
        onPress={pickImageFromLibrary}
      >
        <Image source={require("../../assets/gallery.png")} />
        <Text style={{ color: "white" }}>Pick from gallery</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddStory;
