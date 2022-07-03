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
  getStorage,
  ref,
  uploadBytes,
  listAll,
  getDownloadURL,
} from "firebase/storage";
import { storage, db, auth } from "../../firebase/firebaseConfig";
import {
  collection,
  setDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";

const AddPost = ({ navigation }) => {
  const [imagePicked, setImagePicked] = useState();
  const [image, setImage] = useState();

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
        <Image source={require("../../assets/cross.png")} />
        <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
          New post
        </Text>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("Finish", {
              imagePicked: imagePicked,
            });
          }}
        >
          <Text style={{ color: "#64A6FF", fontSize: 18, fontWeight: "bold" }}>
            Next
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <View style={styles.imagePicker}>
          <View style={styles.imagePreview}>
            {!imagePicked ? (
              <Text style={{ color: "white" }}>No Image picked yet</Text>
            ) : (
              <Image style={styles.image} source={{ uri: imagePicked }} />
            )}
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: "#414141",
              paddingHorizontal: 10,
              paddingVertical: 2,
              borderRadius: 10,
            }}
            onPress={takeImageHandler}
          >
            <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
              Take image
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        onPress={pickImageFromLibrary}
      >
        <Image source={require("../../assets/gallery.png")} />
        <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
          Chose from gallery
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  image: { width: "100%", height: "100%" },
  imagePreview: {
    width: "100%",
    height: 300,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePicker: {
    alignItems: "center",
  },
  button: {
    marginBottom: 15,
  },
});

export default AddPost;
