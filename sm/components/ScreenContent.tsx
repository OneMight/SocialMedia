import React from 'react'
import { Text, View } from 'react-native'

import { EditScreenInfo } from './EditScreenInfo'

interface ScreenContentProps {
  title: string
  path: string
  children?: React.ReactNode
}

export const ScreenContent: React.FC<ScreenContentProps> = ({
  title,
  path,
  children,
}) => {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold">{title}</Text>

      <View className="h-[1px] my-7 w-4/5 bg-gray-200" />

      <EditScreenInfo path={path} />

      {children}
    </View>
  )
}