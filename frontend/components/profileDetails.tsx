import { useEffect, useState } from "react"
import { UserService } from "../api/user"
import { View, Text } from "react-native"

const DetailRow = ({ label, value }: { label: string; value?: string | number }) => (
    <View className="flex-row justify-between items-center py-3 border-b border-slate-100 last:border-b-0">
        <Text className="text-slate-500 text-sm font-medium">{label}</Text>
        <Text className="text-slate-900 text-sm font-semibold">{value ?? "—"}</Text>
    </View>
)

interface AccountDetailsRes {
    email: string
    username: string
}

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View className="mb-4">
        <Text className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2 px-1">{title}</Text>
        <View className="bg-white border-2 rounded-2xl px-5 py-1 shadow-sm">
            {children}
        </View>
    </View>
)

const AccountDetailsDisplay = () => {
    const [accountDetails, setAccountDetails] = useState<AccountDetailsRes>()

    useEffect(() => {
        async function fetchProfileData() {
            const account = await UserService.fetch_account_details()
            setAccountDetails(account)
        }
        fetchProfileData()
    }, [])

    return (
        <SectionCard title="Account">
            <DetailRow label="Username" value={accountDetails?.username} />
            <DetailRow label="Email" value={accountDetails?.email} />
        </SectionCard>
    )
}

interface FitnessDetailRes {
    activityLevel: string
    age: number
    avg_steps_7_days: number
    gender: string,
    goal_hit_rate: number
    heightin: number
    weight: number
}

const FitnessDetailsDisplay = () => {
    const [fitnessDetails, setFitnessDetails] = useState<FitnessDetailRes>()

    useEffect(() => {
        async function fetchProfileData() {
            const fitness = await UserService.fetch_fitness_data()
            setFitnessDetails(fitness)
        }
        fetchProfileData()
    }, [])

    return (
        <SectionCard title="Fitness">
            <DetailRow label="Age" value={fitnessDetails?.age} />
            <DetailRow label="Gender" value={fitnessDetails?.gender} />
            <DetailRow label="Height (in)" value={fitnessDetails?.heightin} />
            <DetailRow label="Weight (lbs)" value={fitnessDetails?.weight} />
            <DetailRow label="Activity Level" value={fitnessDetails?.activityLevel} />
            <DetailRow label="Avg Steps (7d)" value={fitnessDetails?.avg_steps_7_days} />
            <DetailRow label="Goal Hit Rate" value={fitnessDetails?.goal_hit_rate} />
        </SectionCard>
    )
}

export { AccountDetailsRes, FitnessDetailRes, AccountDetailsDisplay, FitnessDetailsDisplay }
