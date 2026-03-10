import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { SocialProvider } from '../hooks/useSocialStore'
import { FeedPage } from './pages/FeedPage'
import { SignInPage } from './pages/SignInPage'
import { SignUpPage } from './pages/SignUpPage'
import { ExplorePage } from './pages/ExplorePage'
import { ProfilePage } from './pages/ProfilePage'
import { CreatePostPage } from './pages/CreatePostPage'
import { RootStackParamList } from './types/navigation'
import ErrorBoundary from '../components/ErrorBoundary'
import { LogBox } from 'react-native'
import { cssInterop } from 'nativewind'
import { Screen } from 'react-native-screens'

cssInterop(Screen, { className: 'style' })
// LogBox.ignoreAllLogs(false)

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function App() {
  return (
    <ErrorBoundary>
      <SocialProvider>
        {/* <NavigationContainer> */}
          <Stack.Navigator 
            screenOptions={{ 
              headerShown: false, 
              animation: 'fade', 
              // fullScreenGestureEnabled: Boolean(true), 
            }}
          >
            <Stack.Screen name="Feed" component={FeedPage} />
            <Stack.Screen name="SignIn" component={SignInPage} />
            <Stack.Screen name="SignUp" component={SignUpPage} />
            <Stack.Screen name="Explore" component={ExplorePage} />
            <Stack.Screen name="CreatePost" component={CreatePostPage} />
            <Stack.Screen name="Profile" component={ProfilePage} />
          </Stack.Navigator>
        {/* </NavigationContainer> */}
      </SocialProvider>
    </ErrorBoundary>
  )
}