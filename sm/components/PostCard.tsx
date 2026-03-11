// components/PostCard.tsx
import React, { useState } from 'react'
import { View, Text, Image, Pressable } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "../app/types/navigation"
import { Post } from '../app/types/social'
import { useSocialStore } from '../hooks/useSocialStore'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const navigation = useNavigation<NavigationProp>()
  const { users, pulsedPosts, togglePulse } = useSocialStore()
  const [isAnimating, setIsAnimating] = useState(false)

  const user = users.find((u) => u.id === post.userId)
  const isPulsed = pulsedPosts.has(post.id)

  if (!user) return null

  const handlePulse = async () => {
    await togglePulse(post.id)
    if (!isPulsed) {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 400)
    }
  }

  const isThought = post.type === 'thought'

  return (
    <View className="bg-[#121214] mb-4 border-y border-[#1E1E21] sm:border sm:rounded-3xl sm:mx-2 overflow-hidden">
      
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          onPress={() => navigation.navigate('Profile', { userId: user.id })}
          className="flex-row items-center active:opacity-70"
        >
          <View className="relative">
            <Image
              source={{ uri: user.avatarUrl }}
              className="w-10 h-10 rounded-full border border-[#2A2A2E]"
            />
            {user.status === 'online' && (
              <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#121214]" />
            )}
          </View>

          <View className="ml-3">
            <Text className="text-white font-bold text-[15px] tracking-tight">
              {user.username}
            </Text>
            <Text className="text-[#6B6B70] text-[11px] font-medium uppercase tracking-tighter">
              {post.createdAt}
            </Text>
          </View>
        </Pressable>

        <Pressable className="p-2 -mr-2 active:opacity-50">
          <Text className="text-[#4A4A50] font-bold text-lg">•••</Text>
        </Pressable>
      </View>

      {/* CONTENT */}
      <View>
        {isThought ? (
          <View className="px-5 pt-2 pb-6">
            <Text className="text-[#E1E1E6] text-[17px] leading-[26px] font-medium italic">
              {post.caption}
            </Text>
          </View>
        ) : (
          <View>
            <Pressable onPress={handlePulse} className="active:opacity-95">
              <Image
                source={{ uri: post.imageUrl }}
                className="w-full aspect-square bg-[#1E1E21]"
                resizeMode="cover"
              />
            </Pressable>

            {post.caption && (
              <View className="px-4 pt-4 pb-2">
                <Text className="text-[#E1E1E6] leading-5 text-[14px]">
                  <Text className="font-bold text-white">{user.username} </Text>
                  {post.caption}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* ACTIONS */}
      <View className="flex-row items-center justify-between px-4 py-4 mt-1">
        <View className="flex-row items-center space-x-6">
          
          <Pressable
            onPress={handlePulse}
            className={`flex-row items-center px-3 py-1.5 rounded-full ${
              isPulsed ? 'bg-[#E8A838]/10' : 'bg-transparent'
            }`}
          >
            <Text className={`text-xl ${isPulsed ? 'text-[#E8A838]' : 'opacity-40 grayscale'}`}>
              ⚡
            </Text>
            <Text className={`ml-1.5 font-bold text-[13px] ${
              isPulsed ? 'text-[#E8A838]' : 'text-[#6B6B70]'
            }`}>
              {post.pulsesCount}
            </Text>
          </Pressable>

          <Pressable className="flex-row items-center active:opacity-50">
            <Text className="text-xl opacity-40">💬</Text>
            <Text className="ml-1.5 text-[#6B6B70] font-bold text-[13px]">
              {post.comments?.length || 0}
            </Text>
          </Pressable>

          <Pressable className="active:opacity-50">
            <Text className="text-xl opacity-40">🔁</Text>
          </Pressable>
        </View>

        <Pressable className="active:opacity-50 p-1">
          <Text className="text-xl opacity-40">🔖</Text>
        </Pressable>
      </View>
    </View>
  )
}