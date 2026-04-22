import client from "./client"
import * as SecureStore from 'expo-secure-store'

export const StepsService = {
    create_new_steps: async(steps: number) => {
        const session_token = await SecureStore.getItemAsync('session_token')

        const response = await client.post(`/steps/new`, { session_token, steps })

        return response.data
    },

    update_user_steps: async(steps: number) => {
        const session_token = await SecureStore.getItemAsync('session_token')

        const response = await client.post(`/steps/add`, { session_token, steps })

        return response.data
    },

    fetch_user_steps: async(date: string) => {
        const session_token = await SecureStore.getItemAsync('session_token')

        const response = await client.post(`/steps/get`, { session_token, date})

        return response.data
    }   
}