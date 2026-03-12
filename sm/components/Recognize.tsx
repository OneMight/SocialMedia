import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const RecognizeScreen = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7, // Сжимаем для быстрой отправки
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null);
    }
  };

  const uploadAndAnalyze = async () => {
    if (!image) return;

    setLoading(true);
    const formData = new FormData();
    
    formData.append('file', {
      uri: image,
      name: 'photo.jpg',
      type: 'image/jpeg',
    } as any);

    try {
      const response = await fetch('http://localhost:8000/analyze-emotion', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      if (data.status === 'success') {
        setResult(data.dominant_emotion);
      } else {
        Alert.alert('Ошибка', data.message);
      }
    } catch (error) {
      Alert.alert('Ошибка соединения', 'Проверь, запущен ли Python сервер');
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#0A0A0B] items-center justify-center p-5">
      <Text className="text-[#E8A838] text-2xl font-bold mb-8">Распознавание эмоций</Text>

      <TouchableOpacity 
        onPress={pickImage}
        className="w-64 h-64 bg-[#1E1E21] border-2 border-dashed border-[#6B6B70] rounded-3xl items-center justify-center overflow-hidden"
      >
        {image ? (
          <Image source={{ uri: image }} className="w-full h-full" />
        ) : (
          <Text className="text-[#6B6B70] text-center">Нажми, чтобы выбрать фото</Text>
        )}
      </TouchableOpacity>

      {image && !loading && (
        <TouchableOpacity 
          onPress={uploadAndAnalyze}
          className="mt-8 bg-[#E8A838] px-10 py-4 rounded-full"
        >
          <Text className="text-[#0A0A0B] font-bold text-lg">Анализировать</Text>
        </TouchableOpacity>
      )}

      {loading && <ActivityIndicator size="large" color="#E8A838" className="mt-8" />}

      {result && (
        <View className="mt-10 items-center">
          <Text className="text-[#6B6B70] text-sm uppercase tracking-widest">Результат:</Text>
          <Text className="text-white text-4xl font-black mt-2 capitalize">{result}</Text>
        </View>
      )}
    </View>
  );
};

export default RecognizeScreen;