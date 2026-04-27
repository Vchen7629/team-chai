import * as SecureStore from 'expo-secure-store'
import client from './client'

export const UserService = {
    fetch_account_details: async() => {
        const session_token = await SecureStore.getItemAsync('session_token')

        const response = await client.get(`/user/account_details/${session_token}`)

        return response.data
    },

    fetch_fitness_data: async() => {
        const session_token = await SecureStore.getItemAsync('session_token')

        const response = await client.get(`/user/fitness/${session_token}`)

        return response.data
    }
}