import { Redirect, Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
    return (
        <>
            <Redirect href="/(auth)/login" />

            <Stack>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
        </>
    );
}
