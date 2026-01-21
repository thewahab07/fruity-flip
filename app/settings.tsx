import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AudioManager from "./AudioManager";

const DIFFICULTIES = {
  easy: { name: "Easy", emoji: "😊" },
  medium: { name: "Medium", emoji: "😐" },
  hard: { name: "Hard", emoji: "😎" },
};

export default function SettingsScreen() {
  const [difficulty, setDifficulty] = useState("medium");
  const [soundEffects, setSoundEffects] = useState(true);
  const [backgroundMusic, setBackgroundMusic] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const diff = await AsyncStorage.getItem("difficulty");
    const sound = await AsyncStorage.getItem("soundEffects");
    const music = await AsyncStorage.getItem("backgroundMusic");

    if (diff) setDifficulty(diff);
    if (sound !== null) setSoundEffects(sound === "true");
    if (music !== null) setBackgroundMusic(music === "true");
  };

  const saveDifficulty = async (value: string) => {
    setDifficulty(value);
    await AsyncStorage.setItem("difficulty", value);
  };

  const toggleSound = async () => {
    const newValue = !soundEffects;
    setSoundEffects(newValue);
    await AudioManager.toggleSoundEffects(newValue);
  };

  const toggleMusic = async () => {
    const newValue = !backgroundMusic;
    setBackgroundMusic(newValue);
    await AsyncStorage.setItem("backgroundMusic", newValue.toString());

    // Toggle the background music
    await AudioManager.toggleMusic(newValue);
  };

  const resetBestTime = async () => {
    await AsyncStorage.removeItem("bestTime");
  };

  const rateApp = () => {
    // Replace with your actual app store URL
    Linking.openURL("https://example.com/rate");
  };

  return (
    <ScrollView className="flex-1 bg-sky-100">
      <View className="p-6">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()} className="mt-1">
            <Text className="text-2xl">⬅️</Text>
          </TouchableOpacity>
          <Text className="text-3xl font-heading text-purple-600 ml-4">
            Settings ⚙️
          </Text>
        </View>

        <View className="bg-white rounded-3xl p-6 mb-4 shadow-md">
          <Text className="text-xl font-heading text-purple-600 mb-4">
            🔊 Sound & Music
          </Text>

          <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-gray-200">
            <View>
              <Text className="text-lg text-gray-700 font-primary">
                🎵 Sound Effects
              </Text>
            </View>
            <TouchableOpacity
              onPress={toggleSound}
              className={`w-14 h-8 rounded-full justify-center ${soundEffects ? "bg-green-400" : "bg-gray-300"}`}
            >
              <View
                className="w-6 h-6 bg-white rounded-full shadow-md"
                style={{
                  marginLeft: soundEffects ? 28 : 4,
                  alignSelf: "flex-start",
                }}
              />
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-lg text-gray-700 font-primary">
                🎶 Background Music
              </Text>
            </View>
            <TouchableOpacity
              onPress={toggleMusic}
              className={`w-14 h-8 rounded-full justify-center ${backgroundMusic ? "bg-green-400" : "bg-gray-300"}`}
            >
              <View
                className="w-6 h-6 bg-white rounded-full shadow-md"
                style={{
                  marginLeft: backgroundMusic ? 28 : 4,
                  alignSelf: "flex-start",
                }}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View className="bg-white rounded-3xl p-6 mb-4 shadow-md">
          <Text className="text-xl font-heading text-purple-600 mb-4">
            🎯 Difficulty
          </Text>

          {Object.entries(DIFFICULTIES).map(([key, config]) => (
            <TouchableOpacity
              key={key}
              onPress={() => saveDifficulty(key)}
              className="rounded-2xl p-4 mb-2"
              style={{
                backgroundColor: difficulty === key ? "#FCD34D" : "#F3F4F6",
              }}
            >
              <Text
                className="text-lg font-primary"
                style={{
                  color: difficulty === key ? "#FFFFFF" : "#374151",
                }}
              >
                {config.emoji} {config.name} {difficulty === key ? "✓" : ""}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="bg-white rounded-3xl p-6 mb-4 shadow-md">
          <Text className="text-xl font-heading text-purple-600 mb-4">
            ℹ️ About
          </Text>
          <View className="flex-row justify-between mb-2 pb-2 border-b border-gray-200">
            <Text className="text-gray-700 font-primary">Version</Text>
            <Text className="text-gray-600 font-primary">1.0.0</Text>
          </View>
          <View className="flex-row justify-between mb-4">
            <Text className="text-gray-700 font-primary">Game Type</Text>
            <Text className="text-gray-600 font-primary">Memory Match</Text>
          </View>
          <TouchableOpacity
            onPress={rateApp}
            className="bg-blue-400 rounded-2xl p-3 mb-2 active:bg-blue-500"
          >
            <Text className="text-white text-center font-primary">
              ⭐ Rate This App
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={resetBestTime}
            className="bg-red-400 rounded-2xl p-3 active:bg-red-500"
          >
            <Text className="text-white text-center font-primary">
              🔄 Reset Best Time
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
