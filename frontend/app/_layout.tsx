// import { Stack } from "expo-router";
import { ThemeProvider } from "@/hooks/useTheme";
import "../global.css";
import { SocketProvider } from '../hooks/useSocket';

// export default function RootLayout() {
//   return (
//     <ThemeProvider>
//       <Stack screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//       </Stack>
//     </ThemeProvider>
//   );
// }
import { Stack } from "expo-router";

export default function Layout() {
  return (
    
    <ThemeProvider>
      <SocketProvider>
      <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="WelcomePage" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="IndividualToken" options={{ headerShown: false }} />
        </Stack>
    </SocketProvider>
    </ThemeProvider>

  );
}
