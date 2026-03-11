// app/pages/FeedPage.tsx
import React, { useEffect } from 'react'
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../types/navigation'
import { Layout } from '../../components/Layout'
import { WavelengthBar } from '../../components/WavelengthBar'
import { PostCard } from '../../components/PostCard'
import { useSocialStore } from '../../hooks/useSocialStore'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

export function FeedPage() {
  const { currentUser, posts, orbiting, isLoading } = useSocialStore()
  const navigation = useNavigation<NavigationProp>()

  useEffect(() => {
    if (!currentUser && !isLoading) {
      navigation.navigate('SignIn')
    }
  }, [currentUser, isLoading])

  if (isLoading) {
    return (
      <Layout>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#E8A838" />
        </View>
      </Layout>
    )
  }

  if (!currentUser) return null

  const feedPosts = posts.filter(
    (post) => orbiting.has(post.userId) || post.userId === currentUser.id
  )

  return (
    <Layout>
      <View className="border-b border-[#2A2A2E]">
        <WavelengthBar />
      </View>

      <ScrollView
        className="flex-1 bg-[#0A0A0B]"
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {feedPosts.length > 0 ? (
          feedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <View className="mt-16 items-center">
            <View className="w-20 h-20 bg-[#161618] border border-[#2A2A2E] rounded-2xl items-center justify-center mb-6">
              <Text className="text-4xl">🧭</Text>
            </View>

            <Text className="text-white text-2xl font-bold mb-3 tracking-tight">
              Your feed is quiet
            </Text>

            <Text className="text-[#8A8A8F] text-sm text-center leading-5 mb-8 px-6">
              Start orbiting other creators to see{'\n'}their thoughts and photos here.
            </Text>

            <Pressable
              onPress={() => navigation.navigate('Explore')}
              className="bg-[#E8A838] px-10 py-3.5 rounded-xl active:opacity-80"
            >
              <Text className="text-black font-bold text-base tracking-wide">
                Explore Pulse
              </Text>
            </Pressable>

            <View className="mt-10 flex-row items-center gap-2">
              <View className="h-px w-12 bg-[#2A2A2E]" />
              <Text className="text-[#3A3A3E] text-xs">or wait for others to join</Text>
              <View className="h-px w-12 bg-[#2A2A2E]" />
            </View>
          </View>
        )}
      </ScrollView>
    </Layout>
  )
}