// app/pages/SignInPage.tsx
import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSocialStore } from '../../hooks/useSocialStore'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../types/navigation'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

export function SignInPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, authError, clearAuthError } = useSocialStore()
  const navigation = useNavigation<NavigationProp>()

  useEffect(() => { clearAuthError() }, [])

  const handleSubmit = async () => {
    setIsLoading(true)
    const ok = await login(username, password)
    setIsLoading(false)
    if (ok) navigation.navigate('Feed')
  }

  const isFormValid = username.length > 0 && password.length >= 6

  const FieldError = ({ field }: { field: string }) =>
    authError?.field === field ? (
      <Text className="text-red-400 text-xs mb-3 -mt-2 ml-1">{authError.message}</Text>
    ) : null

  return (
    <View className="flex-1 bg-[#0A0A0B] justify-center items-center px-6">
      <View className="w-full max-w-sm bg-[#161618] border border-[#2A2A2E] rounded-2xl px-6 py-10">
        <View className="items-center mb-10">
          <Text className="text-4xl font-bold text-[#F0EDE8]">
            <Text className="text-[#E8A838]">P</Text>ulse
          </Text>
          <Text className="text-[#8A8A8F] text-sm mt-2">Feel the rhythm of your world</Text>
        </View>

        {authError?.field === 'general' && (
          <View className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
            <Text className="text-red-400 text-sm text-center">{authError.message}</Text>
          </View>
        )}

        <TextInput
          placeholder="Username or email"
          placeholderTextColor="#8A8A8F"
          value={username}
          onChangeText={(t) => { setUsername(t); clearAuthError() }}
          autoCapitalize="none"
          className={`w-full px-4 py-3 mb-2 rounded-xl border bg-[#1E1E21] text-[#F0EDE8] ${
            authError?.field === 'username' ? 'border-red-500/60' : 'border-[#2A2A2E]'
          }`}
        />
        <FieldError field="username" />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#8A8A8F"
          secureTextEntry
          value={password}
          onChangeText={(t) => { setPassword(t); clearAuthError() }}
          className={`w-full px-4 py-3 mb-2 rounded-xl border bg-[#1E1E21] text-[#F0EDE8] ${
            authError?.field === 'password' ? 'border-red-500/60' : 'border-[#2A2A2E]'
          }`}
        />
        <FieldError field="password" />

        <Pressable
          onPress={handleSubmit}
          disabled={!isFormValid || isLoading}
          className={`py-4 rounded-xl items-center mt-2 ${
            isFormValid && !isLoading ? 'bg-[#E8A838]' : 'bg-[#E8A838]/40'
          }`}
        >
          {isLoading ? (
            <ActivityIndicator color="#0A0A0B" />
          ) : (
            <Text className="font-bold text-[#0A0A0B]">Sign In</Text>
          )}
        </Pressable>

        <View className="mt-6 items-center">
          <Text className="text-[#8A8A8F] text-sm">New to the frequency?</Text>
          <Pressable onPress={() => { clearAuthError(); navigation.navigate('SignUp') }}>
            <Text className="text-[#E8A838] font-bold mt-1">Create account</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}