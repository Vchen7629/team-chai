import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './screens/home';
import LoginScreen from './screens/login';
import UserFeedScreen from './screens/userFeed';
import UserProfileScreen from './screens/userProfile';
import UserSignUpScreen from './screens/userSignUp';
import "./global.css";

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  UserFeed: { userId: string };
  UserProfile: { userId: string };
  UserSignUp: undefined;
}

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Home'>
        <Stack.Screen name="Home" component={HomeScreen}/>
        <Stack.Screen name="Login" component={LoginScreen}/>
        <Stack.Screen name="UserFeed" component={UserFeedScreen}/>
        <Stack.Screen name="UserProfile" component={UserProfileScreen}/>
        <Stack.Screen name="UserSignUp" component={UserSignUpScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
