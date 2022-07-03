import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState } from "react";
import Post from "../../components/Home/Post";
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";

const Posts = ({ route, navigation }) => {
  const { item, posts } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [postsToShow, setPosts] = useState();

  const [postId, setPostId] = useState();
  console.log(modalVisible);

  const stateChange = (status, id) => {
    setModalVisible(status);
    setPostId(id);
  };

  useEffect(() => {
    setPosts(posts);
    console.log(postId);
  }, []);

  const onDelete = async () => {
    const docRef = doc(db, "users", auth.currentUser.uid, "posts", postId);

    await deleteDoc(docRef).then(() => {
      navigation.goBack();
    });
  };

  const toArchive = async () => {
    const archiveRef = doc(
      db,
      "users",
      auth.currentUser.uid,
      "archive",
      postId
    );
    const postRef = doc(db, "users", auth.currentUser.uid, "posts", postId);
    const postData = await getDoc(postRef);
    let data = postData.data();
    await setDoc(archiveRef, {
      ...data,
      deletedOn: serverTimestamp(),
    }).then(async () => {
      await deleteDoc(postRef);
      navigation.goBack();
    });
  };
  return (
    <View
      style={{
        marginTop: "5%",
        borderBottomColor: "grey",
        borderBottomWidth: 0.3,
        paddingBottom: 5,
        flex: 1,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Image
            source={require("../../assets/leftArrow.png")}
            style={{ height: 32, width: 32 }}
          />
        </TouchableOpacity>
        <View style={{ alignItems: "center" }}>
          <Text style={{ color: "grey", fontSize: 16 }}>{item.user}</Text>
          <Text
            style={{ fontWeight: "bold", fontSize: 16 }}
            onPress={() => {
              setModalVisible(true);
            }}
          >
            Posts
          </Text>
        </View>
        <View></View>
      </View>

      <ScrollView contentContainerStyle={{}}>
        {postsToShow?.map((post, index) => (
          <View key={index} style={{ flex: 1 }}>
            <Post
              item={{ ...post, user: item.user }}
              navigation={navigation}
              stateChange={stateChange}
              infos={{ from: "fromProfile", id: null }}
            />
          </View>
        ))}
      </ScrollView>

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
            <TouchableOpacity style={styles.modalContent} onPress={toArchive}>
              <Text style={{ fontSize: 18 }}>Archive</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalContent} onPress={onDelete}>
              <Text style={{ fontSize: 18, color: "red" }}>Delete</Text>
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
    </View>
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
export default Posts;
