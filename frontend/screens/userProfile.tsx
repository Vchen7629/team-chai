import React, { useState } from "react";
import { Text, View, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useNav } from "../context/navContext";

const UserSignUpScreen = () => {
    const { navigate } = useNav();

    // State to hold your form data
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        age: '',
        height: '',
        weight: ''
    });

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-slate-900">
            <View className="flex-1 px-8 pt-20 pb-10">
                {/* Header Section */}
                <Text className="text-white text-3xl font-bold mb-2">Welcome to [Health App]</Text>
                <Text className="text-emerald-400 text-lg mb-8"> Please fill out the required info </Text>

                <View className="space-y-4">
                    {/* Name Row */}
                    <View className="flex-row space-x-4">
                        <View className="flex-1">
                            <Text className="text-gray-400 mb-1">First Name</Text>
                            <TextInput 
                                className="bg-slate-800 p-4 rounded-xl text-white border border-slate-700"
                                placeholder="John"
                                placeholderTextColor="#475569"
                                onChangeText={(val: string) => setForm({...form, firstName: val})}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-400 mb-1">Last Name</Text>
                            <TextInput 
                                className="bg-slate-800 p-4 rounded-xl text-white border border-slate-700"
                                placeholder="Doe"
                                placeholderTextColor="#475569"
                                onChangeText={(val: string) => setForm({...form, lastName: val})}
                            />
                        </View>
                    </View>

                    {/* Age Input */}
                    <View>
                        <Text className="text-gray-400 mb-1">Age</Text>
                        <TextInput 
                            className="bg-slate-800 p-4 rounded-xl text-white border border-slate-700"
                            keyboardType="numeric"
                            placeholder="21"
                            placeholderTextColor="#475569"
                            onChangeText={(val: string) => setForm({...form, age: val})}
                        />
                    </View>

                    {/* Height & Weight Row */}
                    <View className="flex-row space-x-4">
                        <View className="flex-1">
                            <Text className="text-gray-400 mb-1">Height</Text>
                            <TextInput 
                                className="bg-slate-800 p-4 rounded-xl text-white border border-slate-700"
                                placeholder="5'10\"
                                placeholderTextColor="#475569"
                                onChangeText={(val: string) => setForm({...form, height: val})}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-400 mb-1">Weight (lbs)</Text>
                            <TextInput 
                                className="bg-slate-800 p-4 rounded-xl text-white border border-slate-700"
                                keyboardType="numeric"
                                placeholder="160"
                                placeholderTextColor="#475569"
                                onChangeText={(val: string) => setForm({...form, weight: val})}
                            />
                        </View>
                    </View>
                </View>

                {/* Continue Button */}
                <View className="flex-1 justify-end items-end mt-10">
                    <TouchableOpacity 
                        onPress={() => navigate('Home')}
                        className="bg-emerald-500 px-8 py-4 rounded-full"
                    >
                        <Text className="text-slate-900 font-bold text-lg">CONTINUE →</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

export default UserSignUpScreen;