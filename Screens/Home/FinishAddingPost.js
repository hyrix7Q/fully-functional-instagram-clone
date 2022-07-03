import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Switch,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import { doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { auth, db, storage } from "../../firebase/firebaseConfig";
import { getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage";
import uuid from "react-native-uuid";

const FinishAddingPost = ({ navigation, route }) => {
  const idGenerated = uuid.v4();
  const { imagePicked } = route.params;
  const [image, setImage] = useState();
  const [facebook, setFacebook] = useState(false);
  const [twitter, setTwitter] = useState(false);
  const [tumblr, setTumblr] = useState(false);
  const [caption, setCaption] = useState("");
  const imageRef = ref(storage, `${auth.currentUser.uid}/posts/${idGenerated}`);

  const postIMG = async () => {
    const img = await fetch(imagePicked);
    const bytes = await img.blob();

    const docRef = doc(db, "users", auth.currentUser.uid, "posts", idGenerated);
    await setDoc(docRef, {
      timestamp: serverTimestamp(),
      userId: auth.currentUser.uid,
      caption: caption,
      postId: idGenerated,
      likes: 0,
    }).then(() => {
      uploadBytes(
        ref(
          storage,
          `${auth.currentUser.uid}/posts/${idGenerated}/${idGenerated}.jpg`
        ),
        bytes
      )
        .then(() => {
          listAll(imageRef).then((res) => {
            res.items.forEach((item) => {
              getDownloadURL(item).then((url) => {
                updateDoc(
                  doc(db, "users", auth.currentUser.uid, "posts", idGenerated),
                  {
                    image: url,
                  }
                );
              });
            });
          });
        })
        .then(() => {
          navigation.navigate("Home1");
        });
    });
  };
  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: "white",
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
          paddingVertical: 5,
          paddingHorizontal: 5,
        }}
      >
        <Image
          source={require("../../assets/leftArrow.png")}
          style={{ height: 30, width: 30 }}
        />
        <Text style={{ color: "black", fontSize: 18, fontWeight: "bold" }}>
          New post
        </Text>
        <TouchableOpacity onPress={postIMG}>
          <Text style={{ color: "#64A6FF", fontSize: 18, fontWeight: "bold" }}>
            Share
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          height: 120,
          flexDirection: "row",
          borderColor: "grey",
          borderBottomWidth: 0.5,
        }}
      >
        <View style={{ margin: 10 }}>
          <Image
            source={{ uri: imagePicked }}
            style={{ height: 95, width: 95 }}
          />
        </View>
        <ScrollView style={{ marginVertical: 10 }}>
          <TextInput
            placeholder="Write a caption..."
            style={{ fontSize: 18 }}
            multiline
            onChangeText={(text) => {
              setCaption(text);
            }}
          />
        </ScrollView>
      </View>
      <View
        style={{
          paddingHorizontal: 10,
          borderColor: "grey",
          borderBottomWidth: 0.5,
        }}
      >
        <View style={styles.social}>
          <Text style={styles.socialText}>Facebook</Text>
          <Switch
            trackColor={{ false: "grey", true: "green" }}
            thumbColor={facebook ? "white" : "white"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => {
              setFacebook(!facebook);
            }}
            value={facebook}
          />
        </View>
        <View style={styles.social}>
          <Text style={styles.socialText}>Twitter</Text>
          <Switch
            trackColor={{ false: "grey", true: "green" }}
            thumbColor={twitter ? "white" : "white"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => {
              setTwitter(!twitter);
            }}
            value={twitter}
          />
        </View>
        <View style={styles.social}>
          <Text style={styles.socialText}>Tumblr</Text>
          <Switch
            trackColor={{ false: "grey", true: "green" }}
            thumbColor={tumblr ? "white" : "white"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => {
              setTumblr(!tumblr);
            }}
            value={tumblr}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  social: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  socialText: {
    fontSize: 17,
  },
});

export default FinishAddingPost;
