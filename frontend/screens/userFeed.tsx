import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { Button, Text, View } from "react-native";

type NavProp = NativeStackNavigationProp<RootStackParamList, 'UserFeed'>;

const UserFeedScreen = () => {
    const navigation = useNavigation<NavProp>();

    return (
        <View className="flex flex-col w-full h-full items-center justify-center">
            <Text>Hello this is User Feed screen</Text>
            <Button title="Go back to Home Screen" onPress={() => navigation.navigate('Home', undefined)}/>
        </View>
    )

    // Idk if we should make a new screen when the user clicks on the day in the calendar on user feed screen
    // to expand or just make that a component
}

export default UserFeedScreen