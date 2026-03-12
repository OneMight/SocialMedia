// app/pages/CreatePostPage.tsx
import React, { useState } from 'react'
import { 
  View, Text, Image, TextInput, Pressable, 
  ScrollView, ActivityIndicator, Alert, Platform 
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import * as ImagePicker from 'expo-image-picker'
import { RootStackParamList } from '../types/navigation'
import { Layout } from '../../components/Layout'
import { useSocialStore } from '../../hooks/useSocialStore'
import api from '../../api/client' // Импортируем api

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

export function CreatePostPage() {
  const navigation = useNavigation<NavigationProp>()
  const { createPost, currentUser } = useSocialStore()

  const [type, setType] = useState<'photo' | 'thought'>('photo')
  const [caption, setCaption] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Запрос разрешений на доступ к галерее
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos')
        return false
      }
      return true
    }
    return true
  }

  // Выбор изображения из галереи
  const pickImage = async () => {
    const hasPermission = await requestPermissions()
    if (!hasPermission) return

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: false,
      })

      if (!result.canceled && result.assets[0]) {
        setIsUploading(true)
        try {
          // Загружаем изображение на сервер используя api.upload.image
          const uploadedUrl = await api.upload.image(result.assets[0].uri)
          setImageUrl(uploadedUrl)
          Alert.alert('Success', 'Image uploaded successfully!')
        } catch (error) {
          Alert.alert('Error', 'Failed to upload image. Please try again.')
          console.error('Upload error:', error)
        } finally {
          setIsUploading(false)
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image')
      console.error('Image pick error:', error)
    }
  }

  // Сделать фото с камеры
  const takePhoto = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to use camera')
        return
      }
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        setIsUploading(true)
        try {
          const uploadedUrl = await api.upload.image(result.assets[0].uri)
          setImageUrl(uploadedUrl)
          Alert.alert('Success', 'Photo uploaded successfully!')
        } catch (error) {
          Alert.alert('Error', 'Failed to upload photo. Please try again.')
          console.error('Upload error:', error)
        } finally {
          setIsUploading(false)
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo')
      console.error('Camera error:', error)
    }
  }

  // Показать опции выбора изображения
  const showImageOptions = () => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        { text: '📷 Take Photo', onPress: takePhoto },
        { text: '🖼️ Choose from Gallery', onPress: pickImage },
        { text: '🎲 Use Random Image', onPress: handleGenerateImage },
        { text: 'Cancel', style: 'cancel' }
      ]
    )
  }

  const handleGenerateImage = () => {
  const randomId = Math.floor(Math.random() * 1000)
  // Используйте полный URL с https://
  setImageUrl(`https://picsum.photos/600?random=${randomId}`)
}

  const handlePublish = async () => {
    if (
      (type === 'photo' && !imageUrl) ||
      (type === 'thought' && !caption.trim())
    ) {
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      await createPost(type, caption, type === 'photo' ? imageUrl : undefined)
      Alert.alert('Success', 'Your transmission has been published!')
      navigation.navigate('Feed')
    } catch (error) {
      Alert.alert('Error', 'Failed to publish post. Please try again.')
      console.error('Publish error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!currentUser) {
    navigation.navigate('SignIn')
    return null
  }

  const isValid = type === 'photo' ? !!imageUrl : caption.trim().length > 0

  return (
    <Layout title="New Transmission" showBackButton={true}>
      <ScrollView className="flex-1 bg-[#0A0A0B]">
        {/* Type Selector */}
        <View className="flex-row p-4">
          <Pressable
            onPress={() => setType('photo')}
            className={`flex-1 p-3 rounded-xl mr-2 ${
              type === 'photo' ? 'bg-[#2A2A2E]' : 'bg-[#161618]'
            }`}
          >
            <Text className="text-center text-white font-bold">📷 Photo</Text>
          </Pressable>

          <Pressable
            onPress={() => setType('thought')}
            className={`flex-1 p-3 rounded-xl ml-2 ${
              type === 'thought' ? 'bg-[#2A2A2E]' : 'bg-[#161618]'
            }`}
          >
            <Text className="text-center text-white font-bold">💭 Thought</Text>
          </Pressable>
        </View>

        {/* Content */}
        {type === 'photo' ? (
          <View className="p-4">
            {isUploading ? (
              <View className="bg-[#1E1E21] p-6 rounded-2xl items-center justify-center h-80">
                <ActivityIndicator size="large" color="#E8A838" />
                <Text className="text-white mt-4">Uploading image...</Text>
              </View>
            ) : imageUrl ? (
              <View>
                <Image
                  source={{ uri: imageUrl }}
                  className="w-full h-80 rounded-2xl"
                />
                <View className="flex-row mt-3 space-x-2">
                  <Pressable
                    onPress={showImageOptions}
                    className="flex-1 bg-[#2A2A2E] p-3 rounded-xl"
                  >
                    <Text className="text-white text-center">Change</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setImageUrl('')}
                    className="flex-1 bg-[#E85D4A] p-3 rounded-xl"
                  >
                    <Text className="text-white text-center">Remove</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={showImageOptions}
                className="bg-[#1E1E21] p-6 rounded-2xl items-center justify-center h-80 border-2 border-dashed border-[#2A2A2E]"
              >
                <Text className="text-4xl mb-3">📷</Text>
                <Text className="text-white font-bold text-lg">Add Image</Text>
                <Text className="text-[#8A8A8F] text-sm mt-2 text-center">
                  Tap to select from gallery,{'\n'}camera, or random image
                </Text>
              </Pressable>
            )}

            <TextInput
              value={caption}
              onChangeText={setCaption}
              placeholder="Add context to your visual..."
              placeholderTextColor="#8A8A8F"
              multiline={true}
              numberOfLines={4}
              className="bg-[#161618] text-white mt-4 p-4 rounded-xl min-h-[100px]"
              textAlignVertical="top"
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
              numberOfLines={6}
              className="bg-[#161618] text-white text-lg p-6 rounded-2xl min-h-[200px]"
              textAlignVertical="top"
            />
          </View>
        )}

        {/* Publish Button */}
        <View className="p-4">
          <Pressable
            onPress={handlePublish}
            disabled={!isValid || isSubmitting || isUploading}
            className={`p-4 rounded-xl ${
              !isValid || isSubmitting || isUploading ? 'bg-[#1E1E21]' : 'bg-[#E8A838]'
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-center font-bold text-lg">
                {isUploading ? 'Uploading...' : '🚀 Publish'}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </Layout>
  )
}