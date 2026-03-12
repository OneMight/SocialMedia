import React, { useEffect, useState } from 'react'
import {
  View, Text, Image, ScrollView, Pressable,
  Modal, TextInput, ActivityIndicator,
} from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Layout } from '../../components/Layout'
import { useSocialStore } from '../../hooks/useSocialStore'
import { RootStackParamList } from '../types/navigation'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

// ─── ДОБАВЛЕНА ФУНКЦИЯ ───
// Заменяет битые ссылки picsum на ui-avatars или генерирует новую по имени
const getSafeAvatar = (url: string | undefined | null, name: string) => {
  if (!url || url.includes('picsum.photos')) {
    const safeName = name ? encodeURIComponent(name) : 'User'
    return `https://ui-avatars.com/api/?name=${safeName}&background=random`
  }
  return url
}

export function ProfilePage() {
  const route: any = useRoute()
  const navigation = useNavigation<NavigationProp>()
  const { userId } = route.params || {}
  const { users, currentUser, posts, orbiting, toggleOrbit, logout, editProfile } =
    useSocialStore()

  // --- Edit modal state ---
  const [editVisible, setEditVisible] = useState(false)
  const [editFullName, setEditFullName] = useState('')
  const [editBio, setEditBio] = useState('')
  
  const [editAvatar, setEditAvatar] = useState('')
// const [defferedValue, setDeffered] = useState('')

  const [saving, setSaving] = useState(false)

  // --- Logout confirm state ---
  const [logoutVisible, setLogoutVisible] = useState(false)

  const profileId = userId || currentUser?.id
  const profileUser = users.find((u) => u.id === profileId)

// useEffect(()=>{
//   const handler=setTimeout(()=>{
//     setDeffered(editAvatar)
//   },500)
//   return () =>{
//     clearTimeout(handler)
//   }
// },[editAvatar])

// console.log(defferedValue)

  if (!profileUser) {
    return (
      <Layout title="Profile" showBackButton>
        <View className="items-center justify-center h-40">
          <Text className="text-[#8A8A8F]">User not found in orbit.</Text>
        </View>
      </Layout>
    )
  }

  const isCurrentUser = currentUser?.id === profileUser.id
  const isOrbiting = orbiting.has(profileUser.id)
  const userPosts = posts.filter((p) => p.userId === profileUser.id)

  const openEditModal = () => {
    setEditFullName(profileUser.fullName)
    setEditBio(profileUser.bio)
    // Если в базе лежит picsum, не показываем его в поле ввода, чтобы не смущать
    setEditAvatar(profileUser.avatarUrl.includes('picsum') ? '' : profileUser.avatarUrl)
    setEditVisible(true)
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    setTimeout(() => {
      const finalName = editFullName.trim() || profileUser.fullName;
      const finalAvatar = editAvatar.trim();

      editProfile({
        fullName: finalName,
        bio: editBio.trim(),
        // Если поле ссылки пустое, сохраняем сгенерированный ui-avatars прямо в базу
        avatarUrl: finalAvatar || getSafeAvatar('', finalName),
      })
      setSaving(false)
      setEditVisible(false)
    }, 600) // имитация запроса
  }

  const handleLogout = () => {
    logout()
    navigation.navigate('SignIn')
  }

  return (
    <Layout
      title={isCurrentUser ? 'My Profile' : profileUser.username}
      showBackButton={!isCurrentUser}
    >
      <ScrollView className="flex-1 bg-[#0A0A0B]" showsVerticalScrollIndicator={false}>

        {/* ── HEADER ── */}
        <View className="px-5 pt-6 pb-8 border-b border-[#1E1E21]">

          {/* Avatar + Stats */}
          <View className="flex-row items-center mb-6">
            <View className="relative">
              <Image
                // ── ИСПОЛЬЗУЕМ getSafeAvatar ──
                source={{ uri: getSafeAvatar(profileUser.avatarUrl, profileUser.fullName) }}
                className="w-24 h-24 rounded-2xl"
              />
              {/* Online indicator */}
              {profileUser.status === 'online' && (
                <View className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0A0A0B]" />
              )}
            </View>

            <View className="flex-1 flex-row justify-around ml-6">
              <View className="items-center">
                <Text className="text-white font-bold text-xl">{profileUser.postsCount}</Text>
                <Text className="text-xs text-[#8A8A8F] mt-0.5">Posts</Text>
              </View>
              <View className="items-center">
                <Text className="text-white font-bold text-xl">{profileUser.followersCount}</Text>
                <Text className="text-xs text-[#8A8A8F] mt-0.5">Followers</Text>
              </View>
              <View className="items-center">
                <Text className="text-white font-bold text-xl">{profileUser.followingCount}</Text>
                <Text className="text-xs text-[#8A8A8F] mt-0.5">Following</Text>
              </View>
            </View>
          </View>

          {/* Name + Bio */}
          <View className="mb-5">
            <Text className="text-white font-bold text-lg">{profileUser.fullName}</Text>
            <Text className="text-[#8A8A8F] text-sm mt-1 leading-5">{profileUser.bio}</Text>
          </View>

          {/* Buttons */}
          {isCurrentUser ? (
            <View className="flex-row gap-3">
              <Pressable
                onPress={openEditModal}
                className="flex-1 bg-[#1E1E21] border border-[#2A2A2E] py-3 rounded-xl items-center"
              >
                <Text className="text-white font-semibold text-sm">Edit Profile</Text>
              </Pressable>

              <Pressable
                onPress={() => setLogoutVisible(true)}
                className="w-12 bg-[#1E1E21] border border-[#2A2A2E] py-3 rounded-xl items-center"
              >
                <Text className="text-lg">🚪</Text>
              </Pressable>
            </View>
          ) : (
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => toggleOrbit(profileUser.id)}
                className={`flex-1 py-3 rounded-xl items-center ${
                  isOrbiting ? 'bg-[#1E1E21] border border-[#2A2A2E]' : 'bg-[#E8A838]'
                }`}
              >
                <Text className={`font-semibold text-sm ${isOrbiting ? 'text-white' : 'text-black'}`}>
                  {isOrbiting ? '✓ In Orbit' : '+ Enter Orbit'}
                </Text>
              </Pressable>

              <Pressable className="w-12 bg-[#1E1E21] border border-[#2A2A2E] py-3 rounded-xl items-center">
                <Text className="text-lg">💬</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* ── POSTS GRID ── */}
        <View className="flex-row flex-wrap p-3 gap-1">
          {userPosts.map((post) => (
            <View
              key={post.id}
              className="rounded-xl overflow-hidden border border-[#1E1E21] bg-[#161618]"
              style={{ width: '49%' }}
            >
              {post.type === 'thought' ? (
                <View className="p-4 justify-center" style={{ minHeight: 130 }}>
                  <Text className="text-[#E8A838] text-xs mb-2 font-medium">THOUGHT</Text>
                  <Text className="text-white text-sm leading-5" numberOfLines={4}>
                    "{post.caption}"
                  </Text>
                </View>
              ) : (
                <Image source={{ uri: post.imageUrl }} className="w-full" style={{ height: 150 }} />
              )}
            </View>
          ))}

          {userPosts.length === 0 && (
            <View className="w-full py-20 items-center">
              <Text className="text-3xl mb-4">📡</Text>
              <Text className="text-white font-bold mb-2">No Transmissions</Text>
              <Text className="text-[#8A8A8F] text-sm">This wavelength is currently silent.</Text>
            </View>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ══════════════════════════════════
          EDIT PROFILE MODAL
      ══════════════════════════════════ */}
      <Modal visible={editVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-[#161618] border-t border-[#2A2A2E] rounded-t-3xl px-6 pt-6 pb-10">

            {/* Handle */}
            <View className="w-10 h-1 bg-[#2A2A2E] rounded-full self-center mb-6" />

            <Text className="text-white text-xl font-bold mb-6">Edit Profile</Text>

            {/* Avatar preview */}
            <View className="items-center mb-6">
              <Image
                // ── ИСПОЛЬЗУЕМ getSafeAvatar ДЛЯ ПРЕВЬЮ ──
                source={{ uri: getSafeAvatar(editAvatar || profileUser.avatarUrl, editFullName || profileUser.fullName) }}
                className="w-20 h-20 rounded-2xl mb-3"
              />
              <TextInput
                value={editAvatar}
                onChangeText={setEditAvatar}
                placeholder="Avatar URL (leave blank for auto-generate)"
                placeholderTextColor="#8A8A8F"
                className="w-full px-4 py-3 rounded-xl border border-[#2A2A2E] bg-[#1E1E21] text-[#F0EDE8] text-sm"
                autoCapitalize="none"
              />
            </View>

            {/* Display name */}
            <Text className="text-[#8A8A8F] text-xs mb-2 ml-1">DISPLAY NAME</Text>
            <TextInput
              value={editFullName}
              onChangeText={setEditFullName}
              placeholder="Your name"
              placeholderTextColor="#8A8A8F"
              className="w-full px-4 py-3 mb-4 rounded-xl border border-[#2A2A2E] bg-[#1E1E21] text-[#F0EDE8]"
            />

            {/* Bio */}
            <Text className="text-[#8A8A8F] text-xs mb-2 ml-1">BIO</Text>
            <TextInput
              value={editBio}
              onChangeText={setEditBio}
              placeholder="Say something about yourself..."
              placeholderTextColor="#8A8A8F"
              multiline
              numberOfLines={3}
              className="w-full px-4 py-3 mb-6 rounded-xl border border-[#2A2A2E] bg-[#1E1E21] text-[#F0EDE8]"
              style={{ textAlignVertical: 'top', minHeight: 80 }}
            />

            {/* Buttons */}
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setEditVisible(false)}
                className="flex-1 py-4 rounded-xl items-center bg-[#1E1E21] border border-[#2A2A2E]"
              >
                <Text className="text-white font-semibold">Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleSaveProfile}
                disabled={saving}
                className="flex-1 py-4 rounded-xl items-center bg-[#E8A838]"
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#0A0A0B" />
                ) : (
                  <Text className="text-black font-bold">Save</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ══════════════════════════════════
          LOGOUT CONFIRM MODAL
      ══════════════════════════════════ */}
      <Modal visible={logoutVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/70 justify-center items-center px-8">
          <View className="w-full bg-[#161618] border border-[#2A2A2E] rounded-2xl p-6">

            <Text className="text-2xl text-center mb-2">🚪</Text>
            <Text className="text-white text-lg font-bold text-center mb-2">Leave the frequency?</Text>
            <Text className="text-[#8A8A8F] text-sm text-center mb-6">
              You'll need to sign back in to access your pulse.
            </Text>

            <Pressable
              onPress={handleLogout}
              className="py-4 rounded-xl items-center bg-red-500/80 mb-3"
            >
              <Text className="text-white font-bold">Sign Out</Text>
            </Pressable>

            <Pressable
              onPress={() => setLogoutVisible(false)}
              className="py-4 rounded-xl items-center bg-[#1E1E21] border border-[#2A2A2E]"
            >
              <Text className="text-white font-semibold">Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

    </Layout>
  )
}