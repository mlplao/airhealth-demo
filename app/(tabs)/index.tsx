import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Platform, ScrollView, StatusBar, Text, View } from "react-native";
import CircularProgress from "../components/circleProgress";
import "../global.css";
import Header from "../header";

export default function Index() {
  // Anticipate the padding for iOS devices
  const paddingTop = Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0;

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{
        alignItems: "center",
        paddingTop,
        paddingBottom: 150,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Header />
      <Text className="text-5xl font-bold text-black shadow-lg shadow-black/15 mb-4">
        Pampanga
      </Text>

      <View
        className="w-[80%] h-[200px] mb-4 items-center justify-center"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 6,
        }}
      >
        <CircularProgress percentage={32} size={180} strokeWidth={25} />
      </View>

      <View className="mb-8 flex flex-row items-center justify-between w-[100px]">
        <Text className="font-bold text-2xl">Good</Text>

        <Ionicons
          className="shadow-md"
          name="help-circle-outline"
          size={28}
          color="#8f8f8fff"
        />
      </View>

      {/* Map Display */}
      <View
        className="w-[80%] mb-8 p-4 rounded-[10px] flex items-center justify-center bg-white"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 6,
        }}
      >
        <Link href={"/airmap"} className="font-bold text-lg">
          View Map
        </Link>
      </View>

      {[
        { label: "PM2.5", value: "2.09 au" },
        { label: "PM10", value: "3.62 au" },
        { label: "O₂", value: "0.11 au" },
        { label: "CO₂", value: "2.29 au" },
      ].map((item, index) => (
        <View
          key={index}
          className="w-[80%] h-[70px] bg-white rounded-[20px] mb-8 items-center justify-center flex flex-row p-6"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 6,
          }}
        >
          <Text className="w-[60%] font-bold text-lg">{item.label}</Text>
          <Text className="w-[40%] font-bold text-lg">{item.value}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
