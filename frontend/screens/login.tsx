import { useState } from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, Text, TextInput, View } from "react-native";
import { RootStackParamList } from "../App";
import { useNavigation } from "@react-navigation/native";
import { User, Eye, EyeOff, Lock } from "lucide-react-native";
import LoginButton from "../components/loginButton";

export type NavProp = NativeStackNavigationProp<RootStackParamList, "Login">;

const LoginScreen = () => {
    const navigation = useNavigation<NavProp>();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ username: string; password: string; general: string }>({ username: "", password: "", general: "" });

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
                    <View className={`flex-row items-center border rounded-xl h-[48px] bg-gray-50 px-3 
                        ${errors.username ? 'border-red-400' : 'border-gray-200'}`
                    }>
                        <User size={16} color="#9ca3af" />
                        <TextInput
                            className="flex-1 text-gray-900 text-sm"
                            style={{ paddingHorizontal: 8, height: '100%' }}
                            placeholder="Enter your username"
                            placeholderTextColor="#9ca3af"
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={username}
                            onChangeText={(v) => { setUsername(v); setErrors(prev => ({ ...prev, username: "" })); }}
                        />
                    </View>
                    {errors.username ? (
                        <View className="absolute items-center top-[11px] left-0 right-0">
                            <Text className="bg-white px-[6px] text-red-500 text-xs">{errors.username}</Text>
                        </View>
                    ) : null}
                </View>

                {/* Password input field */}
                <View className="mb-6">
                    <Text className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Password</Text>
                    <View className="relative">
                        <View className={`flex-row items-center border rounded-xl h-[48px] bg-gray-50 px-3 
                            ${errors.password ? 'border-red-400' : 'border-gray-200'}`
                        }>
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
                                onChangeText={(v) => { setPassword(v); setErrors(prev => ({ ...prev, password: "" })); }}
                            />
                            <Pressable onPress={() => setShowPassword((prev) => !prev)} hitSlop={8}>
                                {showPassword
                                    ? <EyeOff size={18} color="#9ca3af" />
                                    : <Eye size={18} color="#9ca3af" />
                                }
                            </Pressable>
                        </View>
                        {errors.password ? (
                            <View className="absolute items-center top-[-7px] left-0 right-0">
                                <Text className="bg-white px-[6px] text-red-500 text-xs">
                                    {errors.password}
                                </Text>
                            </View>
                        ) : null}
                    </View>
                </View>
                <View className="flex h-fit">
                    <LoginButton username={username} password={password} setErrors={setErrors} />
                    {errors.general ? (
                        <View className="items-center mt-2">
                            <Text className="px-[6px] text-red-500 text-xs">
                                {errors.general}
                            </Text>
                        </View>
                    ) : null}
                </View>
            </View>
        </View>
    );
};

export default LoginScreen;
