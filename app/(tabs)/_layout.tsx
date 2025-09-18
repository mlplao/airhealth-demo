import { Tabs } from "expo-router";
import React from "react";
import { Animated, Pressable, View } from "react-native";

const CustomTabBar = (props: any) => {
  const animatedValues = React.useRef(
    props.state.routes.map(() => new Animated.Value(0))
  ).current;

  React.useEffect(() => {
    // Animate all tabs
    animatedValues.forEach((animValue: any, index: any) => {
      const isFocused = props.state.index === index;
      Animated.timing(animValue, {
        toValue: isFocused ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });
  }, [props.state.index]);

  return (
    <View
      className="absolute left-4 right-4 bottom-10 bg-white rounded-2xl shadow-lg flex-row justify-between items-center p-4 border border-gray-200"
      style={{ elevation: 10 }}
    >
      {props.state.routes.map((route: any, index: number) => {
        const isFocused = props.state.index === index;
        const animatedValue = animatedValues[index];

        const onPress = () => {
          if (!isFocused) {
            props.navigation.navigate(route.name);
          }
        };

        let label;
        switch (route.name) {
          case "index":
            label = "Home";
            break;
          case "search":
            label = "Search";
            break;
          case "report":
            label = "Report";
            break;
          case "settings":
            label = "Settings";
            break;
        }

        const animatedTextColor = animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: ["rgb(156, 163, 175)", "rgba(33, 144, 13, 1)"],
        });

        const animatedScale = animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.1],
        });

        const animatedBackgroundColor = animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: ["rgba(37, 99, 235, 0)", "rgba(37, 235, 50, 0.1)"],
        });

        return (
          <View key={route.key} className="flex-1 items-center">
            <Pressable
              onPress={onPress}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                },
              ]}
            >
              <Animated.View
                style={{
                  backgroundColor: animatedBackgroundColor,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 10,
                  transform: [{ scale: animatedScale }],
                }}
              >
                <Animated.Text
                  style={{
                    color: animatedTextColor,
                    fontWeight: isFocused ? "bold" : "normal",
                    fontSize: 12,
                    textAlign: "center",
                  }}
                >
                  {label}
                </Animated.Text>
              </Animated.View>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
};

const _Layout = () => {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="search" options={{ title: "Search" }} />
      <Tabs.Screen name="report" options={{ title: "Report" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
};

export default _Layout;
