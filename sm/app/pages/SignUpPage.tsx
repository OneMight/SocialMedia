import React, { useState } from "react"
import { View, Text, TextInput, Pressable } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useSocialStore } from "../../hooks/useSocialStore"
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../types/navigation'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

export function SignUpPage() {
  
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const { register } = useSocialStore()
  const navigation = useNavigation<NavigationProp>()

  const isFormValid = Boolean(
    email.length > 0 &&
    fullName.length > 0 &&
    username.length > 0 &&
    password.length >= 6)

  const handleSubmit = () => {
    if (!isFormValid) return

    register({
      username,
      fullName,
      avatarUrl: `https://picsum.photos/150?random=${Math.floor(
        Math.random() * 1000
      )}`,
      bio: "Just joined the frequency. 🌊",
    })

    navigation.navigate("Feed")
  }

  return (
    <View className="flex-1 bg-[#0A0A0B] justify-center items-center px-6">

      {/* Card */}
      <View className="w-full max-w-sm bg-[#161618] border border-[#2A2A2E] rounded-2xl px-6 py-10">

        {/* Logo */}
        <View className="items-center mb-8">
          <Text className="text-3xl font-bold text-[#F0EDE8]">
            <Text className="text-[#E8A838]">P</Text>ulse
          </Text>
          <Text className="text-[#8A8A8F] text-sm mt-1">
            Join the frequency.
          </Text>
        </View>

        {/* Email */}
        <TextInput
          placeholder="Email address"
          placeholderTextColor="#8A8A8F"
          value={email}
          onChangeText={setEmail}
          className="w-full px-4 py-3 mb-3 rounded-xl border border-[#2A2A2E] bg-[#1E1E21] text-[#F0EDE8]"
        />

        {/* Full name */}
        <TextInput
          placeholder="Display Name"
          placeholderTextColor="#8A8A8F"
          value={fullName}
          onChangeText={setFullName}
          className="w-full px-4 py-3 mb-3 rounded-xl border border-[#2A2A2E] bg-[#1E1E21] text-[#F0EDE8]"
        />

        {/* Username */}
        <TextInput
          placeholder="Username"
          placeholderTextColor="#8A8A8F"
          value={username}
          onChangeText={setUsername}
          className="w-full px-4 py-3 mb-3 rounded-xl border border-[#2A2A2E] bg-[#1E1E21] text-[#F0EDE8]"
        />

        {/* Password */}
        <TextInput
          placeholder="Password"
          placeholderTextColor="#8A8A8F"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
          className="w-full px-4 py-3 mb-6 rounded-xl border border-[#2A2A2E] bg-[#1E1E21] text-[#F0EDE8]"
        />

        {/* Button */}
        <Pressable
          onPress={handleSubmit}
          disabled={!isFormValid}
          className={`py-4 rounded-xl items-center ${
            isFormValid ? "bg-[#E8A838]" : "bg-[#E8A838]/40"
          }`}
        >
          <Text className="font-bold text-[#0A0A0B]">Start Pulsing</Text>
        </Pressable>

        <Text className="text-xs text-[#8A8A8F] text-center mt-4">
          By joining, you agree to our Terms of Service and Privacy Policy.
        </Text>

        {/* Sign in */}
        <View className="items-center mt-6">
          <Text className="text-[#8A8A8F] text-sm">
            Already orbiting?
          </Text>

          <Pressable onPress={() => navigation.navigate("SignIn")}>
            <Text className="text-[#E8A838] font-bold mt-1">
              Sign in
            </Text>
          </Pressable>
        </View>

      </View>
    </View>
  )
}