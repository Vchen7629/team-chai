import client from "./client"
import * as SecureStore from 'expo-secure-store'

export const StepsService = {
    create_new_steps: async(
        username: string,
        age: string, weight: string, heightFT: string, heightIn: string, gender: string, 
        activityLevel: string
    ) => {
        const heightin = parseInt(heightFT) * 12 + parseInt(heightIn)
        
        const response = await client.post(`/steps/new`, { 
            username, 
            user_data: {
                username,
                age: parseInt(age), 
                weight: parseInt(weight),
                heightin, 
                gender: gender.toLowerCase(), 
                activityLevel: activityLevel.toLowerCase(),
                avg_steps_7_days: 0.0, 
                goal_hit_rate: 0.0
            }
        })

        return response.data
    },

    update_user_steps: async(steps: number) => {
        const session_token = await SecureStore.getItemAsync('session_token')
        const today = new Date().toISOString().split('T')[0]

        const response = await client.post(`/steps/add`, { session_token, steps, curr_date: today })

        return response.data
    },

    fetch_user_step_goal: async(date: string) => {
        const session_token = await SecureStore.getItemAsync('session_token')

        const response = await client.post(`/steps/get_goal`, { session_token, date })

        return response.data
    },
    
    fetch_user_curr_steps: async(date: string) => {
        const session_token = await SecureStore.getItemAsync('session_token')

        const response = await client.post(`/steps/get_curr_steps`, { session_token, date })

        return response.data
    }   
}