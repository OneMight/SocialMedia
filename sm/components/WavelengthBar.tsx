import React from 'react'
import { View, Text, Image, ScrollView, Pressable } from 'react-native'

import { useSocialStore } from '../hooks/useSocialStore'

export function WavelengthBar() {
  const { users, currentUser } = useSocialStore()

  const otherUsers = users.filter((u) => u.id !== currentUser?.id)

  const getGradient = (id: string) => {
    const gradients = [
      'from-[#E8A838] to-[#E85D4A]',
      'from-[#4A90E2] to-[#50E3C2]',
      'from-[#B8E986] to-[#4A90E2]',
      'from-[#BD10E0] to-[#4A90E2]',
      'from-[#F5A623] to-[#F8E71C]',
      'from-[#D0021B] to-[#F5A623]',
    ]

    const index = parseInt(id) % gradients.length
    return gradients[index] || gradients[0]
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="py-4 px-4 bg-[#0A0A0B]"
    >

      {/* CURRENT USER */}

      {currentUser && (
        <Pressable className="items-center mr-3">

          <View className="relative w-20 h-28 rounded-xl bg-[#161618] border border-[#2A2A2E] overflow-hidden mb-2 items-center justify-center">

            <Image
              source={{ uri: currentUser.avatarUrl }}
              className="absolute w-full h-full opacity-40"
            />

            <View className="bg-[#E8A838] rounded-full px-2 py-1">
              <Text className="text-black font-bold">+</Text>
            </View>
          </View>

          <Text className="text-[11px] text-white">
            Your Wavelength
          </Text>

        </Pressable>
      )}

      {/* OTHER USERS */}

      {otherUsers.map((user) => (
        <Pressable
          key={user.id}
          className="items-center mr-3"
        >
          <View
            className={`w-20 h-28 rounded-xl bg-gradient-to-br ${getGradient(
              user.id
            )} p-[2px] mb-2`}
          >

            <View className="flex-1 bg-[#161618] rounded-xl overflow-hidden">

              <Image
                source={{ uri: user.avatarUrl }}
                className="w-full h-full opacity-80"
              />

            </View>
          </View>

          <Text
            numberOfLines={1}
            className="text-[11px] text-[#8A8A8F] w-20 text-center"
          >
            {user.username}
          </Text>

        </Pressable>
      ))}
    </ScrollView>
  )
}