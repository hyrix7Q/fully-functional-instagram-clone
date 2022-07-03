import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import InstaStory from "react-native-insta-story";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";

const Storie = ({ route, navigation }) => {
  const { stories, indexOfStory } = route.params;
  console.log("gdsfdsfds", stories);
  const [index, setIndex] = useState(indexOfStory);
  const [indexTwo, setIndexTwo] = useState(
    stories[indexOfStory].indexToStartFrom
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTwoVisible, setModalTwoVisible] = useState(false);
  const [viewers, setViewers] = useState();

  console.log(stories);

  useEffect(() => {
    storyViews();
    getViewers().then((res) => {
      console.log(res);
      setViewers(res);
    });
  }, [index, indexTwo]);

  const storyViews = async () => {
    await setDoc(
      doc(
        db,
        "users",
        stories[index].userId,
        "stories",
        stories[index].stories[indexTwo].storieId,
        "viewers",
        auth.currentUser.uid
      ),
      {
        userId: auth.currentUser.uid,
        username: auth.currentUser.displayName,
        profilePic: auth.currentUser.photoURL,
      }
    );
  };

  const getViewers = async () => {
    const docRef = collection(
      db,
      "users",
      auth.currentUser.uid,
      "stories",
      stories[index].stories[indexTwo].storieId,
      "viewers"
    );
    const snapshot = await getDocs(docRef);
    let viewers = [];
    snapshot.forEach((viewer) => {
      viewers.push(viewer.data());
    });
    return viewers;
  };
  let timer = parseInt(stories[index].stories[indexTwo].timestamp.seconds);
  let time = new Date().getTime() / 1000 - timer;

  const onDelete = async () => {
    const storyRef = doc(
      db,
      "users",
      auth.currentUser.uid,
      "stories",
      stories[index].stories[indexTwo].storieId
    );
    deleteDoc(storyRef).then(() => {
      navigation.goBack();
    });
  };

  return (
    <View style={{ marginTop: "5%", flex: 1 }}>
      <View style={{ position: "relative", justifyContent: "center" }}>
        <Image
          source={{ uri: stories[index].stories[indexTwo].story_image }}
          style={{ height: "100%", width: "100%" }}
        />

        <TouchableOpacity
          onPress={() => {
            if (indexTwo > 0) {
              setIndexTwo((prev) => prev - 1);
            } else {
              if (index != 0) {
                setIndex((prev) => prev - 1);
                setIndexTwo(stories[index - 1].stories.length - 1);
              } else {
                navigation.goBack();
              }
            }
          }}
          style={{
            position: "absolute",

            top: 80,
            bottom: 80,
            left: 0,
            width: "45%",
          }}
        ></TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (indexTwo < stories[index].stories.length - 1) {
              setIndexTwo((prev) => prev + 1);
            } else {
              if (index < stories.length - 1) {
                setIndex((prev) => prev + 1);
                setIndexTwo(stories[index + 1]?.indexToStartFrom);
              } else {
                navigation.goBack();
              }
            }
          }}
          style={{
            position: "absolute",

            top: 80,
            bottom: 80,
            right: 0,
            width: "45%",
          }}
        ></TouchableOpacity>
        <View
          style={{
            position: "absolute",
            top: 10,
            marginLeft: 20,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <TouchableOpacity>
            <Image
              source={{ uri: stories[index].user_image }}
              style={{ height: 40, width: 40, borderRadius: 20 }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              marginLeft: 10,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text
              style={{ fontSize: 16, marginRight: 5 }}
              onPress={() => {
                navigation.navigate("ProfileFromHome", {
                  item: { userId: stories[index].userId },
                });
              }}
            >
              {stories[index].user_name}
            </Text>
            <Text style={{ color: "grey", fontSize: 15 }}>
              {Math.floor(time / 3600)}h
            </Text>
          </TouchableOpacity>
        </View>
        {stories[index].userId === auth.currentUser.uid && (
          <TouchableOpacity
            style={{
              alignSelf: "center",
              position: "absolute",
              right: 55,
              top: 13,
            }}
            onPress={() => {
              setModalVisible(true);
            }}
          >
            <Image
              source={require("../../assets/dots.png")}
              style={{ height: 30, width: 30 }}
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
          style={{
            position: "absolute",
            right: 10,
            top: 10,
          }}
        >
          <Image
            source={require("../../assets/blackCross2.png")}
            style={{ height: 35, width: 35 }}
          />
        </TouchableOpacity>
        {stories[index].userId === auth.currentUser.uid && (
          <TouchableOpacity
            style={{
              position: "absolute",
              bottom: 20,
              left: 15,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => {
              setModalTwoVisible(true);
            }}
          >
            <Image
              source={require("../../assets/avatar.jpg")}
              style={{
                width: 35,
                height: 35,
                borderRadius: 18.5,
                marginRight: 7,
              }}
            />
            <Text style={{ color: "white", fontSize: 16 }}>
              {stories[index].stories[indexTwo].viewers.length} Views
            </Text>
          </TouchableOpacity>
        )}
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
              <TouchableOpacity style={styles.modalContent}>
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
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalTwoVisible}
          onRequestClose={() => {
            Alert.alert("Modal has been closed.");
            setModalTwoVisible(!modalVisible);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <TouchableOpacity
                style={styles.modalContent}
                onPress={() => {
                  setModalTwoVisible(false);
                }}
              >
                <Image
                  source={require("../../assets/blackCross2.png")}
                  style={{ height: 35, width: 35 }}
                />
              </TouchableOpacity>
              <ScrollView>
                {viewers?.map((viewer, index) => (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 5,
                    }}
                  >
                    <Image
                      source={{ uri: viewer.profilePic }}
                      style={{
                        height: 35,
                        width: 35,
                        borderRadius: 18.5,
                        marginRight: 7,
                      }}
                    />
                    <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                      {viewer.username}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
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
    width: "100%",
    maxHeight: 300,
    height: 300,
    paddingHorizontal: 20,
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
    alignSelf: "flex-end",
    marginRight: 5,
    paddingBottom: 10,
    paddingTop: 10,
  },
});
export default Storie;
