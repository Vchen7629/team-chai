import { Pressable, Text } from "react-native"
import { AuthService } from "../api/auth";
import { useNavigation } from "@react-navigation/native";
import { NavProp } from "../screens/login";
import * as SecureStore from 'expo-secure-store'
import { useState } from "react";

interface LoginButtonProps {
    username: string
    password: string
}

const LoginButton = ({ username, password }: LoginButtonProps) => {
    const navigation = useNavigation<NavProp>();
    const [isLoading, setIsLoading] = useState<boolean>(false)

    async function handleLogin() {
        if (isLoading) return
        setIsLoading(true)

        try {
            await AuthService.login(username, password)
            navigation.navigate("UserProfile", undefined)

            // these are for debugging, can remove later
            const token = await SecureStore.getItemAsync('session_token')
            console.log('token in storage:', token)
        } catch (err: any) {
            // these are for debugging, can remove later and update with actual error handling
            console.log("status:", err.response?.status);
            console.log("detail:", err.response?.data);
            const msg = err.response?.data?.detail ?? "Something went wrong";
            console.log(`error logging in ${msg}`)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Pressable
            className="bg-blue-600 rounded-xl py-3.5 items-center active:opacity-80"
            onPress={handleLogin}
            disabled={isLoading}
        >
            <Text className="text-white font-semibold text-base">
                {isLoading ? "Signing in..." : "Sign in"}
            </Text>
        </Pressable>
    )
}

export default LoginButton