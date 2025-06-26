import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';
import { Tabs } from "expo-router";
import React from "react";

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
              height: 65,
              paddingBottom: 15,
              paddingTop: 8,
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

        </Tabs>
      );
    }
