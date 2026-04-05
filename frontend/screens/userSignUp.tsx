import { Button, Text, View } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

type NavProp = NativeStackNavigationProp<RootStackParamList, 'UserSignUp'>;

// i think keeping it simple for now would be good 
const UserSignUpScreen = () => {
    const navigation = useNavigation<NavProp>();

    return (
        <View className="flex flex-col w-full h-full items-center justify-center">
            <Text>Hello this is User Signup screen</Text>
            <Button title="Go back to Home Screen" onPress={() => navigation.navigate('Home', undefined)}/>
        </View>
    )
}

export default UserSignUpScreen