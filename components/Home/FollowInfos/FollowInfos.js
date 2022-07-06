import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Animated,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import User from "../User";
import Followers from "./Followers";
import Following from "./Following";

const FollowInfos = ({ route, navigation }) => {
  const { id, profilePic, infos, username } = route.params;
  const [info, setInfo] = useState(infos);
  const scrollX = useRef(new Animated.Value(0)).current;
  const followingRef = useRef();
  const [index, setIndex] = useState(infos === "following" ? 1 : 0);

  const slides = [
    {
      id: "1",
      type: "followers",
    },
    {
      id: "2",
      type: "following",
    },
  ];

  return (
    <View style={{ marginTop: "6%" }}>
      <View
        style={{
          paddingBottom: 7,
          marginBottom: 20,
          borderBottomColor: "grey",
          borderBottomWidth: 0.35,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
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
          <Text style={{ fontSize: 19, fontWeight: "bold" }}>{username}</Text>
          <View></View>
        </View>
      </View>

      {/* <View>
        {infos === "followers" ? (
          <Followers id={id} profilePic={profilePic} />
        ) : (
          <Following id={id} profilePic={profilePic} />
        )}
        </View>*/}
      <View>
        <FlatList
          data={slides}
          renderItem={({ item }) =>
            item.type === "followers" ? (
              <Followers id={id} profilePic={profilePic} />
            ) : (
              <Following id={id} profilePic={profilePic} />
            )
          }
          showsHorizontalScrollIndicator={false}
          horizontal
          initialScrollIndex={index}
          pagingEnabled
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            {
              useNativeDriver: false,
            }
          )}
        />
      </View>
    </View>
  );
};

export default FollowInfos;
