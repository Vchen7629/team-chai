import client from "./client"
import * as SecureStore from 'expo-secure-store'

export const AuthService = {
    // calls backend login route and saves session token to local storage on success
    login: async(username: string, password: string) => {
        const response = await client.post(`/auth/login`, { username, password })
        await SecureStore.setItemAsync('session_token', response.data.session_token)
        return response.data
    },

    signup: async(
        username: string, email: string, password: string, 
        age: string, weight: string, heightFT: string, heightIn: string, gender: string, activityLevel: string
    ) => {
        if (activityLevel == "Very Active") {
            activityLevel = "very_active"
        }
        
        const response = await client.post(`/auth/signup`, {
            username, email, password, age, weight, heightFT, heightIn, 
            gender: gender.toLowerCase(), 
            activityLevel: activityLevel.toLowerCase()
        })

        return response.data
    }   
}