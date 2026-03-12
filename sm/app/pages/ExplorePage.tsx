import React, { useState } from 'react'
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { Layout } from '../../components/Layout'
import { useSocialStore } from '../../hooks/useSocialStore'
import { RootStackParamList } from '../types/navigation'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

export function ExplorePage() {
  const navigation = useNavigation<NavigationProp>()
  // Берем посты и пользователей из стора
  const { posts, users } = useSocialStore()
  const [search, setSearch] = useState('')

  // ─── ЛОГИКА ПОИСКА ───
  // Фильтруем пользователей по username или fullName
  const filteredUsers = search.trim().length > 0 
    ? users.filter(user => 
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.fullName.toLowerCase().includes(search.toLowerCase())
      )
    : []

  const filteredPosts = search.trim().length > 0
    ? posts.filter(post => post.caption?.toLowerCase().includes(search.toLowerCase()))
    : posts

  return (
    <Layout hideTopBar={true}>
      
      {/* SEARCH BAR */}
      <View className="px-4 py-4 border-b border-[#2A2A2E] bg-[#0A0A0B]">
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search wavelengths or users..."
          placeholderTextColor="#8A8A8F"
          className="bg-[#161618] text-white px-4 py-3 rounded-xl border border-[#2A2A2E]"
          autoCapitalize="none"
        />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* ─── СЕКЦИЯ ПОЛЬЗОВАТЕЛЕЙ (показывается только при поиске) ─── */}
        {search.trim().length > 0 && (
          <View className="px-4 pt-4">
            <Text className="text-[#8A8A8F] text-xs font-bold mb-3 uppercase tracking-widest">
              Found In Orbit
            </Text>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <Pressable
                  key={user.id}
                  onPress={() => navigation.navigate('Profile', { userId: user.id })}
                  className="flex-row items-center bg-[#161618] p-3 rounded-2xl border border-[#2A2A2E] mb-2"
                >
                  <Image 
                    source={{ uri: user.avatarUrl }} 
                    className="w-12 h-12 rounded-full border border-[#2A2A2E]" 
                  />
                  <View className="ml-3">
                    <Text className="text-white font-bold">{user.fullName}</Text>
                    <Text className="text-[#8A8A8F] text-xs">@{user.username}</Text>
                  </View>
                </Pressable>
              ))
            ) : (
              <Text className="text-[#444] text-sm mb-6 ml-1">No users found</Text>
            )}
            
            <View className="h-[1px] bg-[#2A2A2E] w-full my-4" />
          </View>
        )}

        {/* ─── СЕКЦИЯ ПОСТОВ ─── */}
        <View className="p-4">
          <Text className="text-[#8A8A8F] text-xs font-bold mb-4 uppercase tracking-widest">
            {search.trim().length > 0 ? 'Transmissions' : 'Global Feed'}
          </Text>
          
          <View className="flex-row flex-wrap justify-between">
            {filteredPosts.map((post) => {
              const isThought = post.type === 'thought'

              return (
                <Pressable
                  key={post.id}
                  className="w-[48%] mb-4 rounded-2xl overflow-hidden border border-[#2A2A2E] bg-[#161618]"
                >
                  {isThought ? (
                    <View className="p-4 min-h-[140px] justify-between">
                      <Text className="text-white text-sm" numberOfLines={5}>
                        "{post.caption}"
                      </Text>
                      <Text className="text-[#8A8A8F] text-xs mt-2">
                        ⚡ {post.pulsesCount}
                      </Text>
                    </View>
                  ) : (
                    <Image
                      source={{ uri: post.imageUrl }}
                      className="w-full h-40"
                    />
                  )}
                </Pressable>
              )
            })}
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>
    </Layout>
  )
}