import React, { useState } from "react"
import { View, Text, TextInput, Pressable } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useSocialStore } from "../../hooks/useSocialStore"
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../types/navigation'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

export function SignInPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const { login } = useSocialStore()
  const navigation = useNavigation<NavigationProp>()

  const isFormValid = Boolean(username.length > 0 && password.length >= 6)

  const handleSubmit = () => {
    if (!isFormValid) return

    login(username)
    navigation.navigate("Feed")
  }

  return (
    <View className="flex-1 bg-[#0A0A0B] justify-center items-center px-6">
      
      {/* Card */}
      <View className="w-full max-w-sm bg-[#161618] border border-[#2A2A2E] rounded-2xl px-6 py-10">

        {/* Logo */}
        <View className="items-center mb-10">
          <Text className="text-4xl font-bold text-[#F0EDE8]">
            <Text className="text-[#E8A838]">P</Text>ulse
          </Text>

          <Text className="text-[#8A8A8F] text-sm mt-2">
            Feel the rhythm of your world
          </Text>
        </View>

        {/* Username */}
        <TextInput
          placeholder="Username or email"
          placeholderTextColor="#8A8A8F"
          value={username}
          onChangeText={setUsername}
          className="w-full px-4 py-3 mb-4 rounded-xl border border-[#2A2A2E] bg-[#1E1E21] text-[#F0EDE8]"
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
            isFormValid
              ? "bg-[#E8A838]"
              : "bg-[#E8A838]/40"
          }`}
        >
          <Text className="font-bold text-[#0A0A0B]">Sign In</Text>
        </Pressable>

        {/* Signup */}
        <View className="mt-6 items-center">
          <Text className="text-[#8A8A8F] text-sm">
            New to the frequency?
          </Text>

          <Pressable onPress={() => navigation.navigate("SignUp")}>
            <Text className="text-[#E8A838] font-bold mt-1">
              Create account
            </Text>
          </Pressable>
        </View>

      </View>
    </View>
  )
}