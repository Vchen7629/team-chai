import { Alert, Pressable, Text, TouchableOpacity } from "react-native"
import * as SecureStore from 'expo-secure-store'
import { AuthService } from "../api/auth";
import { useState } from "react";
import { useAuth } from "../context/authContext";
import { useNav } from "../context/navContext";
import { StepsService } from "../api/steps";
import { generateTodayDate } from "../utils/datetime";

interface LoginButtonProps {
    username: string
    password: string
    setErrors: (errors: { username: string; password: string; general: string }) => void
}

/**Used in the login screen */
const LoginButton = ({ username, password, setErrors }: LoginButtonProps) => {
    const { navigate } = useNav();
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const { setLoggedIn, setUsername } = useAuth()

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
            await SecureStore.setItemAsync('username', username)
            setUsername(username)
            setLoggedIn(true)
            
            navigate("UserProfile")
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

/**Used in the signup screen */
const SignUpButton = ({ validateForm, formData, selectedGender, selectedActivity }: any) => {
    const { navigate } = useNav();
    const [isLoading, setIsLoading] = useState<boolean>(false)

    async function handleSubmit(): Promise<void> {
        if (!validateForm() || isLoading) return
        setIsLoading(true)

        if (validateForm()) {
            try {
                await AuthService.signup(
                    formData.name, formData.email, formData.password,
                    formData.age, formData.weight, formData.heightFt, formData.heightIn,
                    selectedGender, selectedActivity
                )

                const new_step_goal = await StepsService.create_new_step_goal(
                    formData.age, formData.weight, formData.heightFt, formData.heightIn,
                    selectedGender, selectedActivity, 0.0, 0.0
                )

                const today = generateTodayDate()
                await StepsService.add_new_step_goal(formData.name, new_step_goal, today)

                Alert.alert('Success!', `Account created! Welcome, ${formData.name}!`);

                navigate("Login")
            } catch (err: any) {
                const msg = err.response?.data?.detail ?? "Something went wrong";
                Alert.alert('Error', msg)
            } finally {
                setIsLoading(false)
            }
        }
    };

    return (
        <TouchableOpacity
            className="bg-emerald-700 rounded-xl py-3.5 items-center mt-6"
            onPress={handleSubmit}
        >
            <Text className="text-white text-base font-bold tracking-wide">Create account</Text>
        </TouchableOpacity>
    )
}

export { LoginButton, SignUpButton}
