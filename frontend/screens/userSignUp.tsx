import { Button, Text, View, TextInput, ToouchableOpacity, ScrollView, Alert} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

type NavProp = NativeStackNavigationProp<RootStackParamList, 'UserSignUp'>;

// i think keeping it simple for now would be good 
const UserSignUpScreen = () => {
    const navigation = useNavigation<NavProp>();

    // FORM STATE
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        age: '',
        weight: '',
        heightFt: '',
        heightIn: '',
        stepGoal: ''
    });

    // ===== UI STATE =====
    const [showPassword, setShowPassword] = useState(false);
    const [selectedGender, setSelectedGender] = useState('');
    const [selectedActivity, setSelectedActivity] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    // ===== SELECTION OPTIONS =====
    const genders = ['Male', 'Female', 'Other', 'Prefer not to say'];
    const activityLevels = ['Sedentary', 'Light', 'Moderate', 'Active', 'Very Active'];

    // ===== EVENT HANDLERS =====
    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value}));
        clearError(field);
    };

    const selectGender = (gender: string) => {
        setSelectedGender(gender);
        clearError('gender');
    };

    const selectActivity = (activty: string) => {
        setSelectedActivity(activity);
        clearError('activity');
    };

    // ===== VALIDATION =====
    const clearError = (field: string) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    }

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        let isValid = true;

        if(!formData.name.trim()) {
            newErrors.name = 'Name is Required';
            isValid = false;
        }

        const emailRegex = /\S+@\S+\.\S+/;
        if (!formData.email.trim() || !emailRegex.test(formData.email)) {
            newErrors.email = 'Enter a valid email address';
            isValid = false;
        }

        if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
            isValid = false;
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        const age = Number(formData.age);
        if (!formData.age || age < 13 || age > 100) {
            newErrors.age = 'Enter a valid age (13-100)';
            isValid = false;
        }

        if (formData.weight && isNaN(Number(formData.weight))) {
            newErrors.weight = 'Enter a valid weight';
            isValid = false;
        }

        if (!selectedGender) {
            newErrors.gender = 'Please select a gender';
            isValid = false;
        }

        if (!selectedActivity) {
            newErrors.activity = 'Please select an activity level';
            isValid = false;
        }

        const steps = Number(formData.stepGoal)
        if (!formData.stepGoal || steps < 1000 || steps > 100000) {
            newErrors.steps = 'Enter a step goal between 1,000 and 100,000';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // ===== FORM SUBMISSION =====

}

export default UserSignUpScreen