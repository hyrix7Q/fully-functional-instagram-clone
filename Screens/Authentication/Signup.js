import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import * as Facebook from "expo-facebook";

import React, { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  FacebookAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "../../firebase/firebaseConfig";
import * as Yup from "yup";
import Validator from "email-validator";
import { Formik } from "formik";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

const Signup = ({ navigation }) => {
  const LoginFormSchema = Yup.object().shape({
    email: Yup.string().email().required("And email is required !"),
    password: Yup.string()
      .required()
      .min(8, "Your password has to be atleast 8 caracters"),
    username: Yup.string()
      .required()
      .min(8, "Must be at least 8 characters")
      .max(15, "Must be less  than 15 characters")
      .test("Username already taken", function (username) {
        // if the function returns TRUE then username is not Taken
        if (usernames.length === 0) {
          return true;
        } else if (usernames.includes(username)) {
          return false;
        } else {
          return true;
        }
      }),
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [usernames, setUsernames] = useState([]);
  const [usernameAvailable, setUsernameAvailable] = useState();

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

    fetchUsernames().then((res) => {
      console.log("Usernames", res);
      if (res.length === 0) {
        setUsernames([]);
      } else setUsernames(res);
    });
  }, []);

  const onSignup = (email, password, username) => {
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        setDoc(doc(db, "users", auth.currentUser.uid), {
          createdIn: serverTimestamp(),
          username: username,
          profilePic:
            "https://www.business2community.com/wp-content/uploads/2017/08/blank-profile-picture-973460_640.png",
          private: false,
        });
      })
      .then(() => {
        updateProfile(auth.currentUser, {
          displayName: username,
          photoURL:
            "https://www.business2community.com/wp-content/uploads/2017/08/blank-profile-picture-973460_640.png",
        });
      })
      .catch((err) => {
        Alert.alert("An Error has occurred !", err.message, [{ text: "Okay" }]);
      });
  };

  async function logIn() {
    try {
      await Facebook.initializeAsync({
        appId: "<APP_ID>",
      });
      const { type, token, expirationDate, permissions, declinedPermissions } =
        await Facebook.logInWithReadPermissionsAsync({
          permissions: ["public_profile"],
        });
      if (type === "success") {
        // Get the user's name using Facebook's Graph API
        const response = await fetch(
          `https://graph.facebook.com/me?access_token=${token}`
        );
        Alert.alert("Logged in!", `Hi ${(await response.json()).name}!`);
      } else {
        // type === 'cancel'
      }
    } catch ({ message }) {
      alert(`Facebook Login Error: ${message}`);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ marginTop: "5%", maxHeight: "100%" }}>
      <Formik
        initialValues={{ email: "", password: "", username: "" }}
        onSubmit={() => {
          console.log(values);
        }}
        validationSchema={LoginFormSchema}
        validateOnMount={true}
      >
        {({ handleBlur, handleChange, handleSubmit, values, errors }) => (
          <>
            <View style={styles.logo}>
              <Image
                source={require("../../assets/logo.png")}
                style={{ height: 80, width: 80 }}
              />
            </View>
            {/*Inputs*/}
            <View style={styles.inputs}>
              <View
                style={[
                  styles.inputField,
                  errors.email && values.email.length >= 1
                    ? { borderColor: "red", borderWidth: 1.5 }
                    : null,
                ]}
              >
                <TextInput
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  value={values.email}
                  placeholder="Email Address "
                  style={styles.input}
                />
              </View>
              <View
                style={[
                  styles.inputField,
                  errors.username && values.username.length >= 1
                    ? { borderColor: "red", borderWidth: 1.5 }
                    : null,
                ]}
              >
                <TextInput
                  placeholder="Username"
                  style={styles.input}
                  onChangeText={handleChange("username")}
                  onBlur={handleBlur("username")}
                  value={values.username}
                />
              </View>
              <View
                style={[
                  styles.inputField,
                  errors.password && values.password.length >= 1
                    ? { borderColor: "red", borderWidth: 1.5 }
                    : null,
                ]}
              >
                <TextInput
                  placeholder="Password"
                  secureTextEntry={true}
                  style={styles.input}
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  value={values.password}
                />
              </View>
            </View>

            <TouchableOpacity
              style={{
                marginTop: "8%",
                marginHorizontal: 40,
                paddingVertical: 10,
                borderRadius: 5,
                alignItems: "center",
                backgroundColor: "#0093C2",
              }}
              onPress={() => {
                setEmail(values.email);
                setPassword(values.password);
                setUsername(values.username);
                onSignup(values.email, values.password, values.username);
              }}
            >
              {/*Login Button */}
              <Text
                style={{ color: "white", fontSize: 16, fontWeight: "bold" }}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                marginHorizontal: 55,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 20,
              }}
              onPress={logIn}
            >
              <Image
                source={require("../../assets/facebook.png")}
                style={{ height: 30, width: 30, marginRight: 10 }}
              />
              <Text style={{ fontSize: 14, color: "#0093C2" }}>
                {" "}
                Continue with your Facebook account
              </Text>
            </TouchableOpacity>
            <View
              style={{
                marginVertical: "5%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text>OR</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "grey", fontSize: 16 }}>
                Already have an account ?
              </Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.goBack();
                }}
              >
                <Text style={{ fontSize: 16, color: "#0093C2" }}> Login</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Formik>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  logo: {
    alignItems: "center",
    marginTop: "20%",
  },
  inputs: {
    paddingHorizontal: 40,
    marginTop: "15%",
  },
  inputField: {
    borderWidth: 1,
    borderColor: "grey",
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  input: {
    paddingVertical: 5,
    fontSize: 16,
  },
});
export default Signup;
