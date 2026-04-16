import { Pressable, Text } from "react-native"
import { AuthService } from "../api/auth";
import { useNavigation } from "@react-navigation/native";
import { NavProp } from "../screens/login";
import * as SecureStore from 'expo-secure-store'
import { useState } from "react";

interface LoginButtonProps {
    username: string
    password: string
    setErrors: (errors: { username: string; password: string; general: string }) => void
}

const LoginButton = ({ username, password, setErrors }: LoginButtonProps) => {
    const navigation = useNavigation<NavProp>();
    const [isLoading, setIsLoading] = useState<boolean>(false)

    function validateInput(): boolean {
        const newErrors = { username: "", password: "", general: "" }

        if (!username.trim()) newErrors.username = "Username is required"
        if (!password.trim()) newErrors.password = "Password is required"

        if (newErrors.username || newErrors.password) {
            setErrors(newErrors)
            return false
        }

        return true
    }

    async function handleLogin() {
        if (isLoading) return
        if (!validateInput()) return

        setIsLoading(true)

        try {
            await AuthService.login(username, password)
            navigation.navigate("UserProfile", undefined)
        } catch (err: any) {
            const status = err.response?.status;
            if (status === 401 || status === 404) {
                setErrors({ username: "", password: "", general: "invalid username or password"});
            } else {
                setErrors({ username: "", password: "", general: "Something went wrong"});
            }
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
