import { generateTodayDate } from "../utils/datetime"
import client from "./client"
import * as SecureStore from 'expo-secure-store'

export const StepsService = {
    create_new_step_goal: async(
        age: string, weight: string, heightFT: string, heightIn: string, 
        gender: string, activityLevel: string, avg_steps_7_days: number, goal_hit_rate: number
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
            avg_steps_7_days, 
            goal_hit_rate
        })

        return stepGoalRes.data
    },

    add_new_step_goal: async(username: string, stepGoal: number, date: string) => {
        const response = await client.post(`/steps/add/step_goal`, { 
            username, steps: stepGoal, curr_date: date 
        })

        return response.data
    },

    update_user_steps: async(steps: number) => {
        const session_token = await SecureStore.getItemAsync('session_token')
        const today = generateTodayDate()

        const response = await client.post(`/steps/update`, { session_token, steps, curr_date: today })

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