// app/pages/SignUpPage.tsx
import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSocialStore } from '../../hooks/useSocialStore'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../types/navigation'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

export function SignUpPage() {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { register, authError, clearAuthError } = useSocialStore()
  const navigation = useNavigation<NavigationProp>()

  useEffect(() => { clearAuthError() }, [])

  const isFormValid =
    email.length > 0 && fullName.length > 0 &&
    username.length >= 3 && password.length >= 6

  const handleSubmit = async () => {
    setIsLoading(true)
    const ok = await register({
      username,
      email,
      fullName,
      password,
      avatarUrl: `https://picsum.photos/150?random=${Math.floor(Math.random() * 1000)}`,
      bio: 'Just joined the frequency. 🌊',
    })
    setIsLoading(false)
    if (ok) navigation.navigate('Feed')
  }

  const FieldError = ({ field }: { field: string }) =>
    authError?.field === field ? (
      <Text className="text-red-400 text-xs mb-3 -mt-2 ml-1">{authError.message}</Text>
    ) : null

  const inputClass = (field: string) =>
    `w-full px-4 py-3 mb-2 rounded-xl border bg-[#1E1E21] text-[#F0EDE8] ${
      authError?.field === field ? 'border-red-500/60' : 'border-[#2A2A2E]'
    }`

  return (
    <ScrollView
      className="flex-1 bg-[#0A0A0B]"
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="w-full max-w-sm bg-[#161618] border border-[#2A2A2E] rounded-2xl px-6 py-10">
        <View className="items-center mb-8">
          <Text className="text-3xl font-bold text-[#F0EDE8]">
            <Text className="text-[#E8A838]">P</Text>ulse
          </Text>
          <Text className="text-[#8A8A8F] text-sm mt-1">Join the frequency.</Text>
        </View>

        {authError?.field === 'general' && (
          <View className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
            <Text className="text-red-400 text-sm text-center">{authError.message}</Text>
          </View>
        )}

        <TextInput
          placeholder="Email address"
          placeholderTextColor="#8A8A8F"
          value={email}
          onChangeText={(t) => { setEmail(t); clearAuthError() }}
          autoCapitalize="none"
          keyboardType="email-address"
          className={inputClass('email')}
        />
        <FieldError field="email" />

        <TextInput
          placeholder="Display name"
          placeholderTextColor="#8A8A8F"
          value={fullName}
          onChangeText={setFullName}
          className={inputClass('fullName')}
        />

        <TextInput
          placeholder="Username"
          placeholderTextColor="#8A8A8F"
          value={username}
          onChangeText={(t) => { setUsername(t); clearAuthError() }}
          autoCapitalize="none"
          className={inputClass('username')}
        />
        <FieldError field="username" />

        <TextInput
          placeholder="Password (min. 6 characters)"
          placeholderTextColor="#8A8A8F"
          secureTextEntry
          value={password}
          onChangeText={(t) => { setPassword(t); clearAuthError() }}
          className={inputClass('password')}
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
            <Text className="font-bold text-[#0A0A0B]">Start Pulsing</Text>
          )}
        </Pressable>

        <Text className="text-xs text-[#8A8A8F] text-center mt-4">
          By joining, you agree to our Terms of Service and Privacy Policy.
        </Text>

        <View className="items-center mt-6">
          <Text className="text-[#8A8A8F] text-sm">Already orbiting?</Text>
          <Pressable onPress={() => { clearAuthError(); navigation.navigate('SignIn') }}>
            <Text className="text-[#E8A838] font-bold mt-1">Sign in</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  )
}