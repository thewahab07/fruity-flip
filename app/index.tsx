import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, Modal, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const [showBestTime, setShowBestTime] = useState(false);
  const [bestTime, setBestTime] = useState<number | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      loadBestTime();
    }, []),
  );

  const loadBestTime = async () => {
    //console.log("loaded");

    const time = await AsyncStorage.getItem("bestTime");
    //console.log(time);

    if (time) {
      //console.log("time is");

      setBestTime(parseInt(time));
    } else {
      //console.log("time not");
      setBestTime(null);
    }
    //console.log(bestTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View className="flex-1 bg-sky-100 items-center justify-center p-6">
      <View className="mb-8 w-full">
        <View className="items-center justify-center mb-8">
          <Image
            source={require("../assets/images/splash-icon.png")}
            className="w-32 h-32 absolute"
            resizeMode="contain"
          />
        </View>
        <Text className="text-7xl leading-normal font-heading text-purple-600 text-center">
          Fruity Flip
        </Text>
        <Text className="text-xl text-gray-600 text-center font-primary">
          Match the Fruits! 🎮
        </Text>
      </View>

      <View className="w-full max-w-md">
        <TouchableOpacity
          onPress={() => router.push("/gameplay")}
          className="bg-green-400 rounded-full py-5 px-8 mb-5 shadow-lg active:bg-green-500"
        >
          <Text className="text-white text-3xl font-primary text-center">
            🎮 PLAY!
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowBestTime(true)}
          className="bg-yellow-400 rounded-full py-5 px-8 mb-5 shadow-lg active:bg-yellow-500"
        >
          <Text className="text-white text-2xl font-primary text-center">
            🏆 Best Time
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/settings")}
          className="bg-purple-400 rounded-full py-5 px-8 shadow-lg active:bg-purple-500"
        >
          <Text className="text-white text-2xl font-primary text-center">
            ⚙️ Settings
          </Text>
        </TouchableOpacity>
      </View>

      <Text className="text-center mt-10 text-gray-500 text-lg font-primary">
        Ready to have fun? 😊
      </Text>

      <Modal visible={showBestTime} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center p-6">
          <View className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-xl">
            <Text className="text-3xl font-heading text-purple-600 text-center mb-4">
              🏆 Best Time
            </Text>
            <View className="bg-yellow-100 rounded-2xl p-6 mb-6">
              <Text className="text-5xl font-heading text-yellow-600 text-center">
                {bestTime ? formatTime(bestTime) : "--:--"}
              </Text>
              <Text className="text-gray-600 font-primary text-center mt-2">
                Your fastest time!
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowBestTime(false)}
              className="bg-purple-400 rounded-full py-3 px-6 active:bg-purple-500"
            >
              <Text className="text-white text-lg font-heading text-center">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
