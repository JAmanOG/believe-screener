// import { Stack } from "expo-router";
import '../global.css';
import { ThemeProvider } from '@/hooks/useTheme';
import { NavigationContainer } from '@react-navigation/native';

// export default function RootLayout() {
//   return (
//     <ThemeProvider>
//       <Stack screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//       </Stack>
//     </ThemeProvider>
//   );
// }
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}