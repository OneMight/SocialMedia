import React from 'react';
import { Text, View } from 'react-native';

interface EditScreenInfoProps {
  path: string;
}

export const EditScreenInfo =({ path } : EditScreenInfoProps) => {
  return (
    <View>
      <View className="items-center mx-12">
        <Text className="text-lg leading-6 text-center">Open up the code for this screen:</Text>
        
        <View className="rounded-md px-1 my-2 bg-slate-200">
          <Text>{path}</Text>
        </View>

        <Text className="text-lg leading-6 text-center">
          Change any of the text, save the file, and your app will update.
        </Text> 
      </View>
    </View>
  );
};

