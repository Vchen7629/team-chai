import { Button, Text, View } from "react-native"
import { pageBodyStyle } from "../styles/page"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

type NavProp = NativeStackNavigationProp<RootStackParamList, 'UserSignUp'>;

// i think keeping it simple for now would be good 
const UserSignUpScreen = () => {
    const navigation = useNavigation<NavProp>();

    return (
        <View style={pageBodyStyle.container}>
            <Text>Hello this is User Signup screen</Text>
            <Button title="Go back to Home Screen" onPress={() => navigation.navigate('Home', undefined)}/>
        </View>
    )
}

export default UserSignUpScreen