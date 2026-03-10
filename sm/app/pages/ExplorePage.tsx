import React, { useState } from 'react'
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native'

import { Layout } from '../../components/Layout'
import { useSocialStore } from '../../hooks/useSocialStore'

export function ExplorePage() {
  const { posts } = useSocialStore()

  const [search, setSearch] = useState('')

  const tags = [
    'Photography',
    'Design',
    'Thoughts',
    'Architecture',
    'Minimal',
    'Tech',
  ]

  return (
    <Layout hideTopBar={true}>

      {/* SEARCH BAR */}

      <View className="px-4 py-4 border-b border-[#2A2A2E] bg-[#0A0A0B]">

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search wavelengths..."
          placeholderTextColor="#8A8A8F"
          className="bg-[#161618] text-white px-4 py-3 rounded-xl border border-[#2A2A2E]"
        />

        {/* TAGS */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4"
        >
          {tags.map((tag, i) => (
            <Pressable
              key={tag}
              className={`mr-2 px-4 py-2 rounded-full ${
                i === 0
                  ? 'bg-[#E8A838]'
                  : 'bg-[#1E1E21] border border-[#2A2A2E]'
              }`}
            >
              <Text
                className={
                  i === 0 ? 'text-black' : 'text-white'
                }
              >
                {tag}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* POSTS GRID */}

      <ScrollView className="p-4">

        <View className="flex-row flex-wrap justify-between">

          {posts.map((post) => {
            const isThought = post.type === 'thought'

            return (
              <View
                key={post.id}
                className="w-[48%] mb-4 rounded-2xl overflow-hidden border border-[#2A2A2E] bg-[#161618]"
              >

                {isThought ? (
                  <View className="p-4 min-h-[140px] justify-between">

                    <Text className="text-white text-sm">
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

              </View>
            )
          })}

        </View>

      </ScrollView>

    </Layout>
  )
}