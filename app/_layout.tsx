import { Redirect, Stack } from "expo-router";
import React from "react";
import { AuthProvider, useAuth } from "./context/authContext";

function RootNavigator() {
    const { user } = useAuth();

    // Redirect depending on login status
    if (user === null) {
        return <Redirect href="/(auth)/login" />;
    } else {
        return <Redirect href="/(tabs)/home" />;
    }
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <RootNavigator />

            <Stack>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                    name="airmap"
                    options={{
                        title: "Air-Health Map",
                        headerShown: true,
                        headerBackTitle: "Back",
                    }}
                />
                <Stack.Screen
                    name="selectedPlace"
                    options={{
                        headerShown: true,
                        title: "Search",
                        headerBackTitle: "Back",
                    }}
                />
            </Stack>
        </AuthProvider>
    );
}
