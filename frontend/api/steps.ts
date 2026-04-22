import client from "./client"

export const StepsService = {
    create_new_steps: async(username: string, steps: number) => {
        const response = await client.post(`/steps/new`, { username, steps })

        return response.data
    },

    update_user_steps: async(username: string, steps: number) => {
        const response = await client.post(`/steps/add`, { username, steps })

        return response.data
    },

    fetch_user_steps: async(username: string, date: string) => {
        const response = await client.post(`/steps/get`, { username, date})

        return response.data
    }   
}