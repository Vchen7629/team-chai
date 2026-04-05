import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Button, Text, View } from "react-native"
import { RootStackParamList } from "../App";

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
    const navigation = useNavigation<NavProp>();

    return (
        <View className="flex flex-col w-full h-full items-center justify-center">
            <Text>Hello this is home screen</Text>
            <Button title="Login Screen" onPress={() => navigation.navigate('Login', undefined)}/>
            <Button title="User Feed Screen" onPress={() => navigation.navigate('UserFeed', { userId: '123' })}/>
            <Button title="Profile Screen" onPress={() => navigation.navigate('UserProfile', { userId: '123' })}/>
            <Button title="Sign Up Screen" onPress={() => navigation.navigate('UserSignUp', undefined)}/>
        </View>
    )
}

export default HomeScreen