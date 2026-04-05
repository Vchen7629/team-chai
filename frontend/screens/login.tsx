import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Button, Text, View } from "react-native"
import { RootStackParamList } from "../App";
import { useNavigation } from "@react-navigation/native";
import { pageBodyStyle } from "../styles/page";

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
    const navigation = useNavigation<NavProp>();

    return (
        <View style={pageBodyStyle.container}>
            <Text>Hello this is Login screen</Text>
            <Button title="Go back to Home Screen" onPress={() => navigation.navigate('Home', undefined)}/>
        </View>
    )
}

export default LoginScreen