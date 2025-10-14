import { Stack } from "expo-router";
import React from "react";

const _Layout = () => {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="login" options={{ title: "Login" }} />
            <Stack.Screen
                name="register"
                options={{ title: "Register", headerShown: true }}
            />
        </Stack>
    );
};

export default _Layout;
