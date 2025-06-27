import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
    const { theme } = useTheme();
    const colors = Colors[theme];
    const insets = useSafeAreaInsets(); 

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
              height: 65 + insets.bottom,
              paddingBottom: 15 + insets.bottom,
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
              title: 'Top Tokens',
              tabBarIcon: ({ color }) => <IconSymbol size={24} name="auto-graph.fill" color={color} />,
            }}
          />
          <Tabs.Screen
            name="new_Launch"
            options={{
              title: 'New Launch',
              tabBarIcon: ({ color }) => <IconSymbol size={24} name="local-fire-department.box.fill" color={color} />,
            }}
          />
        </Tabs>
      );
    }
