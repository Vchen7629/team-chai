import { useState } from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, Text, TextInput, View } from "react-native";
import { RootStackParamList } from "../App";
import { useNavigation } from "@react-navigation/native";
import { User, Eye, EyeOff, Lock } from "lucide-react-native";

type NavProp = NativeStackNavigationProp<RootStackParamList, "Login">;

const LoginScreen = () => {
    const navigation = useNavigation<NavProp>();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View className="flex-1 items-center justify-center bg-gray-50 px-6">
            <View className="w-full max-w-sm bg-white rounded-2xl shadow-md px-8 py-10">
                {/* The header */}
                <Text className="text-2xl font-bold text-gray-900 text-center mb-1">Welcome back</Text>
                <View className="flex-row justify-center mb-4">
                    <Text className="text-sm text-gray-500">Don't have an account? </Text>
                    <Pressable onPress={() => navigation.navigate('UserSignUp', undefined)}>
                        <Text className="text-sm text-blue-600 font-semibold">Sign up</Text>
                    </Pressable>
                </View>

                {/* Username input field */}
                <View className="mb-4">
                    <Text className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Username</Text>
                    <View className="flex-row items-center border border-gray-200 rounded-xl bg-gray-50 px-3" style={{ height: 48 }}>
                        <User size={16} color="#9ca3af" />
                        <TextInput
                            className="flex-1 text-gray-900 text-sm"
                            style={{ paddingHorizontal: 8, height: '100%' }}
                            placeholder="Enter your username"
                            placeholderTextColor="#9ca3af"
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={username}
                            onChangeText={setUsername}
                        />
                    </View>
                </View>

                {/* Username input field */}
                <View className="mb-6">
                    <Text className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Password</Text>
                    <View className="flex-row items-center border border-gray-200 rounded-xl bg-gray-50 px-3" style={{ height: 48 }}>
                        <Lock size={16} color="#9ca3af" />
                        <TextInput
                            className="flex-1 text-gray-900 text-sm"
                            style={{ paddingHorizontal: 8 }}
                            placeholder="Enter your password"
                            placeholderTextColor="#9ca3af"
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <Pressable onPress={() => setShowPassword((prev) => !prev)} hitSlop={8}>
                            {showPassword
                                ? <EyeOff size={18} color="#9ca3af" />
                                : <Eye size={18} color="#9ca3af" />
                            }
                        </Pressable>
                    </View>
                </View>

                {/* Button to confirm login */}
                <Pressable
                    className="bg-blue-600 rounded-xl py-3.5 items-center active:opacity-80"
                    onPress={() => navigation.navigate("Home", undefined)}
                >
                    <Text className="text-white font-semibold text-base">Sign in</Text>
                </Pressable>
            </View>
        </View>
    );
};

export default LoginScreen;
