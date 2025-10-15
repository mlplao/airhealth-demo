// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBEm_ZL2SWadqjml6XJdatwtTBePNG1pQ4",
    authDomain: "air-health-41da6.firebaseapp.com",
    projectId: "air-health-41da6",
    storageBucket: "air-health-41da6.firebasestorage.app",
    messagingSenderId: "989846886681",
    appId: "1:989846886681:web:31dcd7b76b188489fd8d88",
    measurementId: "G-K23BRGX4TG",
};

// Initialize Firebase
// Using export - So the user wont have to login again when the app reloads
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
