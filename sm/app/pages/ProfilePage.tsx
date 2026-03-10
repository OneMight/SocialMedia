import React from 'react'
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
} from 'react-native'
import { useRoute } from '@react-navigation/native'

import { Layout } from '../../components/Layout'
import { useSocialStore } from '../../hooks/useSocialStore'

export function ProfilePage() {
  const route: any = useRoute()

  const { userId } = route.params || {}

  const { users, currentUser, posts, orbiting, toggleOrbit } =
    useSocialStore()

  const profileId = userId || currentUser?.id
  const profileUser = users.find((u) => u.id === profileId)

  if (!profileUser) {
    return (
      <Layout title="Profile" showBackButton>
        <View className="items-center justify-center h-40">
          <Text className="text-[#8A8A8F]">
            User not found in orbit.
          </Text>
        </View>
      </Layout>
    )
  }

  const isCurrentUser = currentUser?.id === profileUser.id
  const isOrbiting = orbiting.has(profileUser.id)

  const userPosts = posts.filter(
    (p) => p.userId === profileUser.id
  )

  return (
    <Layout title={profileUser.username} showBackButton={!!(!isCurrentUser)}>
      <ScrollView>

        {/* HEADER */}

        <View className="px-5 py-8 border-b border-[#2A2A2E]">

          <View className="flex-row items-center mb-8">

            <Image
              source={{ uri: profileUser.avatarUrl }}
              className="w-24 h-24 rounded-2xl mr-6"
            />

            <View className="flex-1 flex-row justify-around">

              <View className="items-center">
                <Text className="text-[#E8A838] font-bold text-xl">
                  {profileUser.postsCount}
                </Text>
                <Text className="text-xs text-[#8A8A8F]">
                  Posts
                </Text>
              </View>

              <View className="items-center">
                <Text className="text-[#E8A838] font-bold text-xl">
                  {profileUser.followersCount}
                </Text>
                <Text className="text-xs text-[#8A8A8F]">
                  Orbiters
                </Text>
              </View>

              <View className="items-center">
                <Text className="text-[#E8A838] font-bold text-xl">
                  {profileUser.followingCount}
                </Text>
                <Text className="text-xs text-[#8A8A8F]">
                  Orbiting
                </Text>
              </View>

            </View>
          </View>

          {/* BIO */}

          <View className="mb-6">
            <Text className="text-white font-bold text-lg">
              {profileUser.fullName}
            </Text>

            <Text className="text-[#8A8A8F] mt-2">
              {profileUser.bio}
            </Text>
          </View>

          {/* BUTTONS */}

          {isCurrentUser ? (
            <Pressable className="bg-[#1E1E21] py-3 rounded-xl items-center">
              <Text className="text-white font-semibold">
                Edit Profile
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => toggleOrbit(profileUser.id)}
              className={`py-3 rounded-xl items-center ${
                isOrbiting
                  ? 'bg-[#1E1E21]'
                  : 'bg-[#E8A838]'
              }`}
            >
              <Text
                className={
                  isOrbiting ? 'text-white' : 'text-black'
                }
              >
                {isOrbiting ? "In Orbit" : ""}
              </Text>
            </Pressable>
          )}
        </View>

        {/* POSTS GRID */}

        <View className="flex-row flex-wrap p-4 justify-between">

          {userPosts.map((post) => {
            const isThought = post.type === 'thought'

            return (
              <View
                key={post.id}
                className="w-[48%] mb-4 rounded-2xl overflow-hidden border border-[#2A2A2E]"
              >

                {isThought ? (
                  <View className="p-4 min-h-[120px] justify-center">
                    <Text className="text-white text-sm text-center">
                      "{post.caption}"
                    </Text>
                  </View>
                ) : (
                  <Image
                    source={{ uri: post.imageUrl }}
                    className="w-full h-40"
                  />
                )}

              </View>
            )
          })}

          {userPosts.length === 0 && (
            <View className="w-full py-16 items-center">
              <Text className="text-white font-bold mb-2">
                No Transmissions
              </Text>
              <Text className="text-[#8A8A8F]">
                This wavelength is currently silent.
              </Text>
            </View>
          )}

        </View>

      </ScrollView>
    </Layout>
  )
}