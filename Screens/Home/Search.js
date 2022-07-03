import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";

const Search = ({ navigation }) => {
  const [usernameTyped, setUsernameTyped] = useState("");
  const [userFound, setUserFound] = useState();
  const [usernames, setUsernames] = useState([]);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const fetchUsernames = async () => {
      const Ref = collection(db, "users");
      const q = query(
        Ref,
        where("username", "!=", auth.currentUser.displayName)
      );
      const snapshot = await getDocs(q);
      const usernames = [];
      snapshot.forEach((doc) => {
        usernames.push({
          userId: doc.id,
          user: doc.data().username,
          profilePic: doc.data().profilePic,
        });
      });
      return usernames;
    };

    fetchUsernames().then((res) => {
      if (res.length === 0) {
        setUsernames([]);
      } else setUsernames(res);
    });
  }, []);

  const fetching = async (text) => {
    let users = [];
    if (text === "") {
      return;
    }
    usernames.map((user) => {
      if (user.user.includes(text)) {
        users.push(user);
      }
    });
    return users;
  };
  const final = async (text) => {
    fetching(text).then((res) => {
      setUserFound([]);
      setUserFound(res);
    });
  };
  return (
    <ScrollView style={{ marginTop: "5%" }}>
      <View
        style={{ marginTop: 10, flexDirection: "row", alignItems: "center" }}
      >
        <View
          style={{
            backgroundColor: "#DDDDDD",
            marginLeft: 20,
            width: 310,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 10,
            maxWidth: "100%",
            flexDirection: "row",
          }}
        >
          <Image
            source={require("../../assets/search2.png")}
            style={{ width: 25, height: 25, marginRight: 10 }}
          />
          <TextInput
            placeholder="Search"
            style={{ fontSize: 18, width: 250 }}
            onChangeText={(text) => {
              setUsernameTyped(text);
              final(text);
              setInputValue(text);
            }}
            value={inputValue}
          />
        </View>
        <TouchableOpacity
          style={{ marginLeft: 10 }}
          onPress={() => {
            setUserFound();
            setInputValue("");
          }}
        >
          <Text style={{ fontSize: 18 }}>Cancel</Text>
        </TouchableOpacity>
      </View>
      {userFound ? (
        <View style={{ marginTop: 20 }}>
          {userFound.map((user) => (
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",

                marginBottom: 15,
                paddingVertical: 7,
                marginHorizontal: 20,
              }}
              onPress={() => {
                navigation.navigate("ProfileFromSearch", {
                  item: user,
                });
              }}
            >
              <Image
                source={require("../../assets/avatar.jpg")}
                style={{
                  height: 60,
                  width: 60,
                  borderRadius: 30,
                  marginRight: 15,
                }}
              />
              <Text style={{ fontSize: 17 }}>{user.user}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
};

export default Search;
