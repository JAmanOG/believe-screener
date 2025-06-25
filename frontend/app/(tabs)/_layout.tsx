import {Tabs } from "expo-router";
import React from "react";
import { Platform } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/hooks/useTheme';
import { Colors } from '@/constants/Colors';

export default function TabLayout() {
    const { theme } = useTheme();
    const colors = Colors[theme];
  
    return (
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: colors.tabIconSelected,
            tabBarInactiveTintColor: colors.tabIconDefault,
            headerShown: false,
            tabBarButton: HapticTab,
            tabBarStyle: {
              backgroundColor: colors.background,
              borderTopWidth: 0,
              elevation: 0,
              shadowOpacity: 0,
              height: 80,
              paddingBottom: 20,
              paddingTop: 10,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '500',
            },
          }}>
          <Tabs.Screen
            name="HomeScreen"
            options={{
              title: 'Home',
              tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
            }}
          />
          <Tabs.Screen
            name="top"
            options={{
              title: 'Stocks',
              tabBarIcon: ({ color }) => <IconSymbol size={24} name="chart.line.uptrend.xyaxis" color={color} />,
            }}
          />
          <Tabs.Screen
            name="new_Launch"
            options={{
              title: 'FlowBox',
              tabBarIcon: ({ color }) => <IconSymbol size={24} name="cube.box.fill" color={color} />,
            }}
          />
          <Tabs.Screen
            name="favorites"
            options={{
              title: 'Cryptos',
              tabBarIcon: ({ color }) => <IconSymbol size={24} name="bitcoinsign.circle.fill" color={color} />,
            }}
          />
          <Tabs.Screen
            name="swap"
            options={{
              title: 'Swap',
              tabBarIcon: ({ color }) => <IconSymbol size={24} name="arrow.left.arrow.right" color={color} />,
            }}
          />
        </Tabs>
      );
    }
