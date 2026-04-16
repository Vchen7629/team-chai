import { Button, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import SignUpButton from "../components/signupButton";

export type NavProp = NativeStackNavigationProp<RootStackParamList, 'UserSignUp'>;

const UserSignUpScreen = () => {
    const navigation = useNavigation<NavProp>();

    // ===== FORM STATE =====
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        age: '',
        weight: '',
        heightFt: '',
        heightIn: '',
        stepGoal: ''
    });

    // ===== UI STATE =====
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [selectedGender, setSelectedGender] = useState<string>('');
    const [selectedActivity, setSelectedActivity] = useState<string>('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    console.log("idk", selectedActivity)
    // ===== SELECTION OPTIONS =====
    const genders: string[] = ['Male', 'Female', 'Other', 'Prefer not to say'];
    const activityLevels: string[] = ['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active'];

    // ===== EVENT HANDLERS =====
    const handleInputChange = (field: string, value: string): void => {
        setFormData(prev => ({ ...prev, [field]: value }));
        clearError(field);
    };

    const selectGender = (gender: string): void => {
        setSelectedGender(gender);
        clearError('gender');
    };

    const selectActivity = (activity: string): void => {
        setSelectedActivity(activity);
        clearError('activity');
    };

    // ===== VALIDATION =====
    const clearError = (field: string): void => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        let isValid: boolean = true;

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
            isValid = false;
        }

        const emailRegex: RegExp = /\S+@\S+\.\S+/;
        if (!formData.email.trim() || !emailRegex.test(formData.email)) {
            newErrors.email = 'Enter a valid email address';
            isValid = false;
        }

        if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
            isValid = false;
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        const age: number = Number(formData.age);
        if (!formData.age || age < 13 || age > 120) {
            newErrors.age = 'Enter a valid age (13–120)';
            isValid = false;
        }

        if (formData.weight && isNaN(Number(formData.weight))) {
            newErrors.weight = 'Enter a valid weight';
            isValid = false;
        }

        if (!selectedGender) {
            newErrors.gender = 'Please select a gender';
            isValid = false;
        }

        if (!selectedActivity) {
            newErrors.activity = 'Please select an activity level';
            isValid = false;
        }

        const steps: number = Number(formData.stepGoal);
        if (!formData.stepGoal || steps < 1000 || steps > 100000) {
            newErrors.steps = 'Enter a step goal between 1,000 and 100,000';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const togglePasswordVisibility = (): void => setShowPassword(!showPassword);

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="p-8 pb-7">
                    
                    {/* Header */}
                    <Text className="text-2xl font-bold text-emerald-900">HealthIQ</Text>
                    <Text className="text-sm text-gray-500 mt-1 mb-6">Create your account</Text>

                    {/* Account Section */}
                    <Text className="text-[10px] font-semibold text-emerald-700 tracking-wide uppercase border-b border-gray-200 pb-1 mt-5 mb-3.5">Account</Text>

                    {/* Full Name */}
                    <View className="mb-3">
                        <Text className="text-xs font-semibold text-gray-700 mb-1">Full name</Text>
                        <TextInput
                            className={`border rounded-lg p-2.5 text-sm text-gray-900 bg-white ${
                                errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Jane Smith"
                            placeholderTextColor="#9CA3AF"
                            value={formData.name}
                            onChangeText={(value: string) => handleInputChange('name', value)}
                        />
                        {errors.name && <Text className="text-[11px] text-red-600 mt-1">{errors.name}</Text>}
                    </View>

                    {/* Email */}
                    <View className="mb-3">
                        <Text className="text-xs font-semibold text-gray-700 mb-1">Email</Text>
                        <TextInput
                            className={`border rounded-lg p-2.5 text-sm text-gray-900 bg-white ${
                                errors.email ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="jane@example.com"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={formData.email}
                            onChangeText={(value: string) => handleInputChange('email', value)}
                        />
                        {errors.email && <Text className="text-[11px] text-red-600 mt-1">{errors.email}</Text>}
                    </View>

                    {/* Password */}
                    <View className="mb-3">
                        <Text className="text-xs font-semibold text-gray-700 mb-1">Password</Text>
                        <View className="flex-row items-center">
                            <TextInput
                                className={`flex-1 border rounded-l-lg p-2.5 text-sm text-gray-900 bg-white ${
                                    errors.password ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Minimum 8 characters"
                                placeholderTextColor="#9CA3AF"
                                secureTextEntry={!showPassword}
                                value={formData.password}
                                onChangeText={(value: string) => handleInputChange('password', value)}
                            />
                            <TouchableOpacity
                                className={`border rounded-r-lg bg-gray-50 p-2.5 px-3 ${
                                    errors.password ? 'border-red-500 border-l-0' : 'border-gray-300 border-l-0'
                                }`}
                                onPress={togglePasswordVisibility}
                            >
                                <Text className="text-xs font-semibold text-emerald-700">{showPassword ? 'Hide' : 'Show'}</Text>
                            </TouchableOpacity>
                        </View>
                        {errors.password && <Text className="text-[11px] text-red-600 mt-1">{errors.password}</Text>}
                    </View>

                    {/* Confirm Password */}
                    <View className="mb-3">
                        <Text className="text-xs font-semibold text-gray-700 mb-1">Confirm password</Text>
                        <TextInput
                            className={`border rounded-lg p-2.5 text-sm text-gray-900 bg-white ${
                                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Re-enter password"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry={!showPassword}
                            value={formData.confirmPassword}
                            onChangeText={(value: string) => handleInputChange('confirmPassword', value)}
                        />
                        {errors.confirmPassword && <Text className="text-[11px] text-red-600 mt-1">{errors.confirmPassword}</Text>}
                    </View>

                    {/* Health Profile Section */}
                    <Text className="text-[10px] font-semibold text-emerald-700 tracking-wide uppercase border-b border-gray-200 pb-1 mt-5 mb-3.5">Health profile</Text>

                    {/* Two Columns for Age and Weight */}
                    <View className="flex-row gap-2.5 mb-3">
                        <View className="flex-1">
                            <Text className="text-xs font-semibold text-gray-700 mb-1">Age</Text>
                            <TextInput
                                className={`border rounded-lg p-2.5 text-sm text-gray-900 bg-white ${
                                    errors.age ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="e.g. 28"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                                value={formData.age}
                                onChangeText={(value: string) => handleInputChange('age', value)}
                            />
                            {errors.age && <Text className="text-[11px] text-red-600 mt-1">{errors.age}</Text>}
                        </View>
                        <View className="flex-1">
                            <Text className="text-xs font-semibold text-gray-700 mb-1">Weight (lbs)</Text>
                            <TextInput
                                className={`border rounded-lg p-2.5 text-sm text-gray-900 bg-white ${
                                    errors.weight ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="e.g. 155"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                                value={formData.weight}
                                onChangeText={(value: string) => handleInputChange('weight', value)}
                            />
                            {errors.weight && <Text className="text-[11px] text-red-600 mt-1">{errors.weight}</Text>}
                        </View>
                    </View>

                    {/* Height */}
                    <View className="mb-3">
                        <Text className="text-xs font-semibold text-gray-700 mb-1">Height</Text>
                        <View className="flex-row items-center gap-1.5">
                            <TextInput
                                className="w-14 border border-gray-300 rounded-lg p-2.5 text-sm text-center text-gray-900 bg-white"
                                placeholder="0"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                                value={formData.heightFt}
                                onChangeText={(value: string) => handleInputChange('heightFt', value)}
                            />
                            <Text className="text-xs text-gray-500">ft</Text>
                            <TextInput
                                className="w-14 border border-gray-300 rounded-lg p-2.5 text-sm text-center text-gray-900 bg-white"
                                placeholder="0"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                                value={formData.heightIn}
                                onChangeText={(value: string) => handleInputChange('heightIn', value)}
                            />
                            <Text className="text-xs text-gray-500">in</Text>
                        </View>
                    </View>

                    {/* Gender */}
                    <View className="mb-3">
                        <Text className="text-xs font-semibold text-gray-700 mb-1">Gender</Text>
                        <View className="flex-row flex-wrap gap-2">
                            {genders.map((gender: string) => (
                                <TouchableOpacity
                                    key={gender}
                                    className={`px-3 py-1.5 rounded-full border ${
                                        selectedGender === gender
                                            ? 'bg-emerald-50 border-emerald-700'
                                            : 'bg-white border-gray-300'
                                    }`}
                                    onPress={() => selectGender(gender)}
                                >
                                    <Text className={`text-[11px] ${
                                        selectedGender === gender
                                            ? 'text-emerald-800 font-semibold'
                                            : 'text-gray-700'
                                    }`}>
                                        {gender}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {errors.gender && <Text className="text-[11px] text-red-600 mt-1">{errors.gender}</Text>}
                    </View>

                    {/* Activity Level */}
                    <View className="mb-3">
                        <Text className="text-xs font-semibold text-gray-700 mb-1">Activity level</Text>
                        <Text className="text-[11px] text-gray-400 mb-1">How active are you on a typical day?</Text>
                        <View className="flex-row flex-wrap gap-2">
                            {activityLevels.map((activity: string) => (
                                <TouchableOpacity
                                    key={activity}
                                    className={`px-3 py-1.5 rounded-full border ${
                                        selectedActivity === activity
                                            ? 'bg-emerald-50 border-emerald-700'
                                            : 'bg-white border-gray-300'
                                    }`}
                                    onPress={() => selectActivity(activity)}
                                >
                                    <Text className={`text-[11px] ${
                                        selectedActivity === activity
                                            ? 'text-emerald-800 font-semibold'
                                            : 'text-gray-700'
                                    }`}>
                                        {activity}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {errors.activity && <Text className="text-[11px] text-red-600 mt-1">{errors.activity}</Text>}
                    </View>

                    {/* Daily Step Goal Section */}
                    <Text className="text-[10px] font-semibold text-emerald-700 tracking-wide uppercase border-b border-gray-200 pb-1 mt-5 mb-3.5">Daily step goal</Text>

                    <View className="mb-3">
                        <Text className="text-xs font-semibold text-gray-700 mb-1">Target steps</Text>
                        <Text className="text-[11px] text-gray-400 mb-1">Set your daily step goal (1,000 - 100,000 steps)</Text>
                        <TextInput
                            className={`border rounded-lg p-2.5 text-sm text-gray-900 bg-white ${
                                errors.steps ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter your daily step goal"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            value={formData.stepGoal}
                            onChangeText={(value: string) => handleInputChange('stepGoal', value)}
                        />
                        {errors.steps && <Text className="text-[11px] text-red-600 mt-1">{errors.steps}</Text>}
                    </View>

                    {/* Action Buttons */}
                    <SignUpButton validateForm={validateForm} formData={formData} selectedGender={selectedGender} selectedActivity={selectedActivity}/>
                    
                    <TouchableOpacity
                        className="py-2 items-center mt-3"
                        onPress={() => navigation.navigate('Home', undefined)}
                    >
                        <Text className="text-emerald-700 text-sm font-medium">Already have an account? Sign in</Text>
                    </TouchableOpacity>
                    
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default UserSignUpScreen