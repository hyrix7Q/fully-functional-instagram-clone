import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import React, { useEffect } from "react";
import * as Yup from "yup";
import Validator from "email-validator";
import { Formik } from "formik";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

const Login = ({ navigation }) => {
  //The validation schema
  const LoginFormSchema = Yup.object().shape({
    email: Yup.string().email().required("And email is required !"),
    password: Yup.string()
      .required()
      .min(8, "Your password has to be atleast 8 caracters"),
  });

  const onLoginHandler = (email, password) => {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        console.log("Logined ");
      })
      .catch((err) => {
        Alert.alert("An error has occurred !", err.message, [{ text: "Okay" }]);
      });
  };

  return (
    <ScrollView contentContainerStyle={{ marginTop: "5%", maxHeight: "100%" }}>
      <Formik
        initialValues={{ email: "", password: "" }}
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
                  placeholder="Email address or Username"
                  style={styles.input}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  autoFocus={true}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  value={values.email}
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
            <View style={{ paddingHorizontal: 40 }}>
              <TouchableOpacity style={{ alignItems: "flex-end" }}>
                <Text style={{ fontSize: 15, color: "#0093C2" }}>
                  Forgot password?
                </Text>
              </TouchableOpacity>
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
              onPress={() => onLoginHandler(values.email, values.password)}
            >
              {/*Login Button */}
              <Text
                style={{ color: "white", fontSize: 16, fontWeight: "bold" }}
              >
                Log in
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
            >
              <Image
                source={require("../../assets/facebook.png")}
                style={{ height: 30, width: 30, marginRight: 10 }}
              />
              <Text style={{ fontSize: 14, color: "#0093C2" }}>
                {" "}
                Continue with your facebook account
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
                Dont have an account?
              </Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("Signup");
                }}
              >
                <Text style={{ fontSize: 16, color: "#0093C2" }}> Sign up</Text>
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
export default Login;
