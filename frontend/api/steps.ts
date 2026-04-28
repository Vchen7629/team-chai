import client from "./client"
import * as SecureStore from 'expo-secure-store'

export const StepsService = {
    create_new_step_goal: async(
        age: string, weight: string, heightFT: string, heightIn: string, 
        gender: string, activityLevel: string
    ): Promise<number> => {
        const heightin = parseInt(heightFT) * 12 + parseInt(heightIn)

        if (activityLevel == "Very Active") {
            activityLevel = "very_active"
        }
        
        const stepGoalRes = await client.post(`/steps/new_target_steps`, { 
            age: parseInt(age), 
            weight: parseInt(weight),
            heightin, 
            gender: gender.toLowerCase(), 
            activityLevel: activityLevel.toLowerCase(),
            avg_steps_7_days: 0.0, 
            goal_hit_rate: 0.0
        })

        return stepGoalRes.data
    },

    create_new_user_steps: async(username: string, stepGoal: number) => {
        const response = await client.post(`/steps/add`, { username, steps: stepGoal })

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