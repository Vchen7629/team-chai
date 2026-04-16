import { Alert, Text, TouchableOpacity } from "react-native";
import { AuthService } from "../api/auth";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { NavProp } from "../screens/userSignUp";

const SignUpButton = ({ validateForm, formData, selectedGender, selectedActivity }: any) => {
    const navigation = useNavigation<NavProp>();
    const [isLoading, setIsLoading] = useState<boolean>(false)

    // ===== FORM SUBMISSION =====
    async function handleSubmit(): Promise<void> {
        if (!validateForm() || isLoading) return
        setIsLoading(true)

        if (validateForm()) {
            try {
                await AuthService.signup(
                    formData.name, formData.email, formData.password,
                    formData.age, formData.weight, formData.heightFt, formData.heightIn, 
                    selectedGender, selectedActivity, formData.stepGoal
                )

                Alert.alert('Success!', `Account created! Welcome, ${formData.name}!`);

                navigation.navigate("Login", undefined)
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

export default SignUpButton