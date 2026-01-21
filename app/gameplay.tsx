import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Modal, Text, TouchableOpacity, View } from "react-native";
import AudioManager from "./AudioManager";

const FRUITS = [
  "🍎",
  "🍌",
  "🍇",
  "🍊",
  "🍓",
  "🍉",
  "🍒",
  "🥝",
  "🥭",
  "🍑",
  "🍍",
  "🥥",
];

const DIFFICULTIES = {
  easy: { rows: 3, cols: 4 },
  medium: { rows: 4, cols: 4 },
  hard: { rows: 6, cols: 4 },
};

// Card pattern colors - cycling through these
const CARD_PATTERNS = [
  ["#A78BFA", "#C4B5FD"], // Purple shades
  ["#F472B6", "#FBCFE8"], // Pink shades
  ["#60A5FA", "#BFDBFE"], // Blue shades
  ["#34D399", "#A7F3D0"], // Green shades
];

type Card = {
  id: number;
  fruit: string;
  patternIndex: number;
};

const FlipCard = ({
  card,
  isFlipped,
  onPress,
  cardSize,
}: {
  card: Card;
  isFlipped: boolean;
  onPress: () => void;
  cardSize: number;
}) => {
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 180 : 0,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
  }, [isFlipped]);

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [89, 90],
    outputRange: [1, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [89, 90],
    outputRange: [0, 1],
  });

  const pattern = CARD_PATTERNS[card.patternIndex];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{ width: cardSize, height: cardSize, margin: 4 }}
    >
      <View style={{ flex: 1, position: "relative" }}>
        {/* Back of card (pattern) */}
        <Animated.View
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: 16,
            borderWidth: 3,
            borderColor: "#8B5CF6",
            overflow: "hidden",
            transform: [{ rotateY: frontInterpolate }],
            opacity: frontOpacity,
            backfaceVisibility: "hidden",
          }}
        >
          <View style={{ flex: 1, flexDirection: "row" }}>
            <View style={{ flex: 1, backgroundColor: pattern[0] }} />
            <View style={{ flex: 1, backgroundColor: pattern[1] }} />
          </View>
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: pattern[0],
              opacity: 0.3,
            }}
          >
            <View style={{ flex: 1, flexDirection: "column" }}>
              <View style={{ flex: 1, backgroundColor: "transparent" }} />
              <View style={{ flex: 1, backgroundColor: pattern[1] }} />
            </View>
          </View>
        </Animated.View>

        {/* Front of card (fruit) */}
        <Animated.View
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: 16,
            borderWidth: 3,
            borderColor: "#FCD34D",
            backgroundColor: "#FEF3C7",
            justifyContent: "center",
            alignItems: "center",
            transform: [{ rotateY: backInterpolate }],
            opacity: backOpacity,
            backfaceVisibility: "hidden",
          }}
        >
          <Text style={{ fontSize: cardSize / 2 }}>{card.fruit}</Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

export default function GameplayScreen() {
  const [difficulty, setDifficulty] = useState("medium");
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  useEffect(() => {
    loadDifficulty();
  }, []);

  const loadDifficulty = async () => {
    const saved = await AsyncStorage.getItem("difficulty");
    if (saved) setDifficulty(saved);
    initGame(saved || "medium");
  };

  const initGame = (diff: string) => {
    const config = DIFFICULTIES[diff as keyof typeof DIFFICULTIES];
    const totalCards = config.rows * config.cols;
    const pairsNeeded = totalCards / 2;

    const selectedFruits = FRUITS.slice(0, pairsNeeded);
    const gameCards = [...selectedFruits, ...selectedFruits]
      .sort(() => Math.random() - 0.5)
      .map((fruit, index) => ({
        id: index,
        fruit,
        patternIndex: index % CARD_PATTERNS.length,
      }));

    setCards(gameCards);
    setFlipped([]);
    setMatched([]);
    setTimer(0);
    setIsRunning(true);
    setPaused(false);
    setGameWon(false);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isRunning && !paused && !gameWon) {
      interval = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, paused, gameWon]);

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      if (cards[first].fruit === cards[second].fruit) {
        setMatched([...matched, first, second]);
        setFlipped([]);
      } else {
        setTimeout(() => {
          setFlipped([]);
        }, 500);
      }
    }
  }, [flipped]);

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      setIsRunning(false);
      setGameWon(true);
      saveBestTime();
    }
  }, [matched, cards]);

  const saveBestTime = async () => {
    const best = await AsyncStorage.getItem("bestTime");
    if (!best || timer < parseInt(best)) {
      await AsyncStorage.setItem("bestTime", timer.toString());
    }
  };

  const handleCardPress = (index: number) => {
    if (
      flipped.length === 2 ||
      flipped.includes(index) ||
      matched.includes(index) ||
      paused
    ) {
      return;
    }

    // Play flip sound
    AudioManager.playFlipSound();

    setFlipped([...flipped, index]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const config = DIFFICULTIES[difficulty as keyof typeof DIFFICULTIES];

  return (
    <View className="flex-1 bg-sky-100 p-4">
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-white rounded-full p-3 shadow-md active:bg-gray-100"
        >
          <Text className="text-xl">🏠</Text>
        </TouchableOpacity>

        <View className="bg-white rounded-full flex-row px-6 py-3 shadow-md">
          <Text className="text-xl">⏱️ </Text>
          <Text className="text-xl font-heading text-purple-600">
            {formatTime(timer)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setPaused(true)}
          className="bg-white rounded-full p-3 shadow-md active:bg-gray-100"
        >
          <Text className="text-xl">⏸️</Text>
        </TouchableOpacity>
      </View>

      <View className="bg-yellow-400 rounded-3xl px-4 py-2 mb-4 shadow-md self-end">
        <Text className="text-white text-lg font-heading">
          🌟 {matched.length / 2}/{cards.length / 2}
        </Text>
      </View>

      <View className="flex-1 justify-center items-center">
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            width: "100%",
          }}
        >
          {cards.map((card, index) => {
            const isFlipped =
              flipped.includes(index) || matched.includes(index);
            const cardSize = 320 / config.cols - 12;

            return (
              <FlipCard
                key={card.id}
                card={card}
                isFlipped={isFlipped}
                onPress={() => handleCardPress(index)}
                cardSize={cardSize}
              />
            );
          })}
        </View>
      </View>

      {/* Win Modal */}
      <Modal visible={gameWon} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center p-6">
          <View className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-xl">
            <Text className="text-5xl text-center mb-4 leading-normal">🎉</Text>
            <Text className="text-3xl font-heading text-green-500 text-center mb-2">
              You Won!
            </Text>
            <View className="flex-row items-center justify-center">
              <Text className="text-xl font-primary text-gray-600 text-center mb-6">
                Time:
              </Text>
              <Text className="text-xl font-heading text-gray-600 text-center mb-6">
                {formatTime(timer)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => initGame(difficulty)}
              className="bg-green-400 rounded-full py-3 px-6 mb-2 active:bg-green-500"
            >
              <Text className="text-white text-lg font-primary text-center">
                🔄 Play Again
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-purple-400 rounded-full py-3 px-6 active:bg-purple-500"
            >
              <Text className="text-white text-lg font-primary text-center">
                🏠 Home
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Pause Menu */}
      <Modal visible={paused} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center p-6">
          <View className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-xl">
            <Text className="text-3xl font-heading text-purple-600 text-center mb-6">
              ⏸️ Paused
            </Text>
            <TouchableOpacity
              onPress={() => setPaused(false)}
              className="bg-green-400 rounded-full py-3 px-6 mb-3 active:bg-green-500"
            >
              <Text className="text-white text-lg font-primary text-center">
                ▶️ Continue
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                initGame(difficulty);
                setPaused(false);
              }}
              className="bg-blue-400 rounded-full py-3 px-6 mb-3 active:bg-blue-500"
            >
              <Text className="text-white text-lg font-primary text-center">
                🔄 Replay
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setPaused(false);
                router.back();
              }}
              className="bg-purple-400 rounded-full py-3 px-6 active:bg-purple-500"
            >
              <Text className="text-white text-lg font-primary text-center">
                🏠 Home
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
