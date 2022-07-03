import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import React from "react";
import Post from "../../../components/Home/Post";

const Photo = ({ route, navigation }) => {
  const { item } = route.params;
  console.log("fdffffvbbvb", item);
  return (
    <View style={{ flex: 1, marginTop: "7%" }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 5,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Image
            source={require("../../../assets/leftArrow.png")}
            style={{ height: 32, width: 32 }}
          />
        </TouchableOpacity>
        <View>
          <Text style={{ fontWeight: "bold", fontSize: 21 }}>Photo</Text>
        </View>
        <View></View>
      </View>
      <ScrollView style={{}}>
        {item.type === "postLike" ? (
          <Post
            item={item}
            navigation={navigation}
            infos={{ from: "fromNotifications", id: null }}
          />
        ) : item.type === "postComment" || item.type === "commentLike" ? (
          <Post
            item={item}
            navigation={navigation}
            infos={{ from: "fromNotifications", id: item.commentId }}
          />
        ) : null}
      </ScrollView>
    </View>
  );
};

export default Photo;
