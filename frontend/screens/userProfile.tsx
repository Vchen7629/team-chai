import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { useNavigation } from "@react-navigation/native";
import { Button, Text, View } from "react-native";

type NavProp = NativeStackNavigationProp<RootStackParamList, 'UserProfile'>;

// this page would probably just include the info about the user like
// name, age, height, weight, calculated bmi, goals?
const UserProfileScreen = () => {
    const navigation = useNavigation<NavProp>();

    return (
        <View className="flex flex-col w-full h-full items-center justify-center">
            <Text>Hello this is User Profile screen</Text>
            <Button title="Go back to Home Screen" onPress={() => navigation.navigate('Home', undefined)}/>
        </View>
    )
}

export default UserProfileScreen