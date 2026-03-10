import React, { useState } from 'react'
import { View, Text, Image, TextInput, Pressable, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../types/navigation'
import { Layout } from '../../components/Layout'
import { useSocialStore } from '../../hooks/useSocialStore'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

export function CreatePostPage() {
  const navigation = useNavigation<NavigationProp>()
  const { createPost, currentUser } = useSocialStore()

  const [type, setType] = useState<'photo' | 'thought'>('photo')
  const [caption, setCaption] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleGenerateImage = () => {
    const randomId = Math.floor(Math.random() * 1000)
    setImageUrl(`https://picsum.photos/600?random=${randomId}`)
  }

  const handlePublish = () => {
    if (
      (type === 'photo' && !imageUrl) ||
      (type === 'thought' && !caption.trim())
    )
      return

    setIsSubmitting(true)

    setTimeout(() => {
      createPost(type, caption, type === 'photo' ? imageUrl : undefined)
      setIsSubmitting(false)
      navigation.navigate('Feed')
    }, 800)
  }

  if (!currentUser) {
    navigation.navigate('SignIn')
    return null
  }

  const isValid = type === 'photo' ? !!imageUrl : caption.trim().length > 0

  return (
    <Layout title="New Transmission" showBackButton={true}>
      <ScrollView className="flex-1 bg-[#0A0A0B]">

        {/* TYPE SELECTOR */}

        <View className="flex-row p-4">
          <Pressable
            onPress={() => setType('photo')}
            className={`flex-1 p-3 rounded-xl mr-2 ${
              type === 'photo' ? 'bg-[#2A2A2E]' : 'bg-[#161618]'
            }`}
          >
            <Text className="text-center text-white font-bold">
              Photo
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setType('thought')}
            className={`flex-1 p-3 rounded-xl ml-2 ${
              type === 'thought' ? 'bg-[#2A2A2E]' : 'bg-[#161618]'
            }`}
          >
            <Text className="text-center text-white font-bold">
              Thought
            </Text>
          </Pressable>
        </View>

        {/* PHOTO MODE */}

        {type === 'photo' ? (
          <View className="p-4">

            {imageUrl ? (
              <View>
                <Image
                  source={{ uri: imageUrl }}
                  className="w-full h-80 rounded-2xl"
                />

                <Pressable
                  onPress={() => setImageUrl('')}
                  className="mt-3 bg-[#E85D4A] p-3 rounded-xl"
                >
                  <Text className="text-white text-center">Remove</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={handleGenerateImage}
                className="bg-[#1E1E21] p-6 rounded-2xl items-center"
              >
                <Text className="text-white font-bold">
                  Select Image
                </Text>
              </Pressable>
            )}

            <TextInput
              value={caption}
              onChangeText={setCaption}
              placeholder="Add context to your visual..."
              placeholderTextColor="#8A8A8F"
              multiline={true}
              className="bg-[#161618] text-white mt-4 p-4 rounded-xl"
            />

          </View>
        ) : (
          <View className="p-4">
            <TextInput
              value={caption}
              onChangeText={setCaption}
              placeholder="What's on your wavelength?"
              placeholderTextColor="#8A8A8F"
              multiline
              className="bg-[#161618] text-white text-lg p-6 rounded-2xl min-h-[200px]"
            />
          </View>
        )}

        {/* PUBLISH BUTTON */}

        <View className="p-4">
          <Pressable
            onPress={handlePublish}
            disabled={!isValid || isSubmitting}
            className={`p-4 rounded-xl ${
              !isValid ? 'bg-[#1E1E21]' : 'bg-[#E8A838]'
            }`}
          >
            <Text className="text-center font-bold text-lg">
              {isSubmitting ? 'Transmitting...' : 'Publish'}
            </Text>
          </Pressable>
        </View>

      </ScrollView>
    </Layout>
  )
}