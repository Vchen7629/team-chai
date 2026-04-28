import { Text, View, ScrollView } from "react-native";
import { AccountDetailsDisplay, FitnessDetailsDisplay } from "../components/profileDetails";

const UserSignUpScreen = () => {
    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-slate-900">
            <View className="flex-1 px-8 pt-20 pb-10">
                {/* Header Section */}
                <Text className="text-white text-3xl font-bold mb-2">User Profile</Text>
                <AccountDetailsDisplay />
                <FitnessDetailsDisplay />
            </View>
        </ScrollView>
    );
};

export default UserSignUpScreen;