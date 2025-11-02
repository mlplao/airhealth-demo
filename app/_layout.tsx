import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { AuthProvider, useAuth } from "./context/authContext";
import { useNotifications } from "./utils/useNotifications";

function RootNavigator() {
    const { user } = useAuth();

    // Setup notifications globally
    useNotifications();

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
            {/* Light Mode */}
            <StatusBar style="dark" />
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
                <Stack.Screen
                    name="reportFunc"
                    options={{
                        headerShown: true,
                        title: "Create Report",
                        headerBackTitle: "Back",
                    }}
                />
            </Stack>
        </AuthProvider>
    );
}
