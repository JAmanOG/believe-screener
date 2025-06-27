import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function BelieveScreenerWelcome() {
    
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View className="flex-1 justify-between">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="px-6 py-4 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-blue-500 rounded-xl items-center justify-center mr-3">
                <MaterialIcons name="analytics" size={20} color="white" />
              </View>
              <Text className="text-xl font-bold text-gray-900">BelieveScreener App</Text>
            </View>
          </View>

          {/* Hero Section */}
          <View className="px-6 py-8">
            <Text className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
              Track Believe Token{'\n'}Launches in Real-Time
            </Text>
            <Text className="text-gray-600 text-base mb-6 leading-relaxed">
              Discover new token launches, monitor performance, and find opportunities before they moon.
            </Text>
          </View>

          {/* Features */}
          <View className="px-6 pb-8">
            <Text className="text-xl font-bold text-gray-900 mb-4">Key Features</Text>
            <View className="space-y-3">
              <View className="bg-gray-50 p-4 rounded-xl flex-row items-center">
                <View className="w-12 h-12 bg-blue-100 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="flash" size={20} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900 mb-1">Real-Time Data</Text>
                  <Text className="text-gray-600 text-sm">Live price feeds and instant launch alerts</Text>
                </View>
              </View>
              <View className="bg-gray-50 p-4 rounded-xl flex-row items-center">
                <View className="w-12 h-12 bg-green-100 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="trending-up" size={20} color="#10B981" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900 mb-1">Performance Tracking</Text>
                  <Text className="text-gray-600 text-sm">Monitor token performance and analytics</Text>
                </View>
              </View>
              <View className="bg-gray-50 p-4 rounded-xl flex-row items-center">
                <View className="w-12 h-12 bg-purple-100 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="search" size={20} color="#8B5CF6" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900 mb-1">Advanced Filters</Text>
                  <Text className="text-gray-600 text-sm">Find tokens by market cap, volume & more</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Call to Action */}
          <View className="px-6 pb-4">
            <View className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl">
              <Text className="text-xl font-bold text-gray-900 mb-2">Ready to Start?</Text>
              <Text className="text-gray-600 mb-4 leading-relaxed">
                Join thousands of traders using BelieveScreener to discover new opportunities in the Believe ecosystem.
              </Text>
              <TouchableOpacity
              onPress={() => {
                // Navigate to the app or perform an action
                router.push('/(tabs)/HomeScreen');
              }
            }
              >
                <LinearGradient
                  colors={['#3B82F6', '#8B5CF6']}
                  className="py-3 px-6 rounded-xl flex-row items-center justify-center"
                >
                  <Text className="text-white font-semibold mr-2">Launch App</Text>
                  <Ionicons name="arrow-forward" size={16} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        {/* Footer */}
        <View className="px-6 py-4 border-t border-gray-100">
          <Text className="text-center text-gray-500 text-sm">
            Built by Aman Jaiswal
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}