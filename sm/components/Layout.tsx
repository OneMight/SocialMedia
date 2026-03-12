import React from 'react'
import { View, Text, Image, Pressable, SafeAreaView } from 'react-native'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useSocialStore } from '../hooks/useSocialStore'

export type RootStackParamList = {
  Feed: undefined
  Explore: undefined
  CreatePost: undefined
  Recognize: undefined
  Profile: { userId?: string } | undefined
  SignIn: undefined
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

interface LayoutProps {
  children: React.ReactNode
  hideTopBar?: boolean
  hideBottomBar?: boolean
  title?: string
  showBackButton?: boolean
}

interface NavButtonProps {
  label: string
  icon: string
  screen: keyof RootStackParamList
}

export function Layout({
  children,
  hideTopBar = false,
  hideBottomBar = false,
  title,
  showBackButton = false,
}: LayoutProps) {
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<RouteProp<RootStackParamList>>()
  const { currentUser } = useSocialStore()

  const isActive = (name: string) => route.name === name

  const NavButton = ({ label, icon, screen }: NavButtonProps) => {
    const active = isActive(screen)
    return (
      <Pressable
        onPress={() => navigation.navigate(screen as any)}
        className="flex-1 items-center justify-center py-2"
      >
        <View className="items-center justify-center">
          {/* Активный индикатор сверху */}
          {active && (
            <View className="absolute -top-3 w-8 h-1 bg-[#E8A838] rounded-b-full" />
          )}
          <Text className={`text-2xl mb-1 ${active ? 'opacity-100' : 'opacity-50'}`}>
            {icon}
          </Text>
          <Text className={`text-[10px] font-semibold tracking-wide ${
            active ? 'text-[#E8A838]' : 'text-[#6B6B70]'
          }`}>
            {label}
          </Text>
        </View>
      </Pressable>
    )
  }

  return (
    /* SafeAreaView предотвращает наложение контента на статус-бар и челку */
    <SafeAreaView className="flex-1 bg-[#0A0A0B]">
      
      {/* TOP BAR */}
      {!hideTopBar && (
        <View className="flex-row items-center justify-between px-4 h-14 border-b border-[#1E1E21] bg-[#0A0A0B]">
          
          {/* Левая часть (фиксированная ширина для центрирования заголовка) */}
          <View className="w-16 items-start justify-center">
            {showBackButton && (
              <Pressable
                onPress={() => navigation.goBack()}
                className="flex-row items-center py-2 pr-4"
              >
                <Text className="text-[#E8A838] text-2xl mr-1 leading-none">←</Text>
                <Text className="text-[#6B6B70] text-sm font-medium">Back</Text>
              </Pressable>
            )}
          </View>

          {/* Центр — Логотип или Заголовок */}
          <View className="flex-1 items-center justify-center">
            {title ? (
              <Text className="text-white text-lg font-bold tracking-wide">
                {title}
              </Text>
            ) : (
              <Text className="text-white text-xl font-black tracking-widest uppercase">
                <Text className="text-[#E8A838]">P</Text>ulse
              </Text>
            )}
          </View>

          {/* Правая часть */}
          <View className="w-16 items-end justify-center">
            {!title && !showBackButton && (
              <Pressable className="w-10 h-10 bg-[#161618] rounded-full items-center justify-center border border-[#1E1E21] active:bg-[#1E1E21]">
                <Text className="text-lg">🔔</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* CONTENT */}
      <View className="flex-1 bg-[#0A0A0B]">
        {children}
      </View>

      {/* BOTTOM NAV */}
      {!hideBottomBar && (
        <View className="flex-row items-center justify-between border-t border-[#1E1E21] bg-[#0A0A0B] pb-6 pt-2 px-2">
          <NavButton label="Home" icon="🏠" screen="Feed" />
          <NavButton label="Explore" icon="🔭" screen="Explore" />

          {/* Центральная кнопка Create (с выступом вверх) */}
          <Pressable
            onPress={() => navigation.navigate('CreatePost')}
            className="flex-1 items-center justify-center -mt-6"
          >
            <View className="w-14 h-14 bg-[#E8A838] rounded-full items-center justify-center border-4 border-[#0A0A0B] shadow-lg shadow-[#E8A838]/30">
              <Text className="text-[#0A0A0B] text-3xl font-black leading-none pb-1">+</Text>
            </View>
          </Pressable>

          <NavButton label="AI Scan" icon="🧠" screen="Recognize" />

          {/* Profile */}
          <Pressable
            onPress={() => navigation.navigate(currentUser ? 'Profile' : 'SignIn')}
            className="flex-1 items-center justify-center py-2"
          >
            <View className="items-center justify-center">
              {isActive('Profile') && (
                <View className="absolute -top-3 w-8 h-1 bg-[#E8A838] rounded-b-full" />
              )}
              {currentUser?.avatarUrl ? (
                <Image
                  source={{ uri: currentUser.avatarUrl }}
                  className={`w-7 h-7 rounded-full mb-1 border-2 ${
                    isActive('Profile') ? 'border-[#E8A838] opacity-100' : 'border-transparent opacity-50'
                  }`}
                />
              ) : (
                <Text className={`text-2xl mb-1 ${isActive('Profile') ? 'opacity-100' : 'opacity-50'}`}>
                  👤
                </Text>
              )}
              <Text className={`text-[10px] font-semibold tracking-wide ${
                isActive('Profile') ? 'text-[#E8A838]' : 'text-[#6B6B70]'
              }`}>
                Profile
              </Text>
            </View>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  )
}