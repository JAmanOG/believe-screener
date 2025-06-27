import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useTheme";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSocket } from "../../hooks/useSocket";

interface NewLaunchToken {
  imageUrl: string | undefined;
  token: {
    symbol: string;
    name: string;
    image: string;
  };
  curvePercentage: string;
  contract: {
    address: string;
    tradeLink: string;
  };
  twitter: {
    handle: string;
    link: string;
  };
  description: string;
  launchTime: string;
}

// const mockNewLaunchData: NewLaunchToken[] = [
//   {
//     token: {
//       symbol: "TTS",
//       name: "TUNG TUNG SAHUR",
//       image:
//         "https://www.believescreener.com/_next/image?url=ht…qtrdxa4soa6xzcadsgdxpqrqz4go3i4yoanzsim&w=96&q=75",
//     },
//     curvePercentage: "0",
//     contract: {
//       address: "Dgkc...iBLV",
//       tradeLink:
//         "https://axiom.trade/t/DgkcLphzsXZcD4qVRFGrfQbvaKgRcdeKNwU7T8htiBLV/@bscreener",
//     },
//     twitter: {
//       handle: "@BSubkhi32009",
//       link: "https://twitter.com/BSubkhi32009",
//     },
//     description: "-",
//     launchTime: "7m ago",
//   },
//   {
//     token: {
//       symbol: "MOON",
//       name: "Moon Token",
//       image: "https://via.placeholder.com/96x96/3B82F6/FFFFFF?text=M",
//     },
//     curvePercentage: "15",
//     contract: {
//       address: "Dgkc...iBLV",
//       tradeLink: "https://axiom.trade/t/example",
//     },
//     twitter: {
//       handle: "@MoonToken",
//       link: "https://twitter.com/MoonToken",
//     },
//     description: "Revolutionary DeFi token with moon potential",
//     launchTime: "12m ago",
//   },
//   {
//     token: {
//       symbol: "FIRE",
//       name: "Fire Protocol",
//       image: "https://via.placeholder.com/96x96/EF4444/FFFFFF?text=F",
//     },
//     curvePercentage: "45",
//     contract: {
//       address: "Dgkc...iBLV",
//       tradeLink: "https://axiom.trade/t/example",
//     },
//     twitter: {
//       handle: "@FireProtocol",
//       link: "https://twitter.com/FireProtocol",
//     },
//     description: "Next-gen burning mechanism for deflationary rewards",
//     launchTime: "23m ago",
//   },
//   {
//     token: {
//       symbol: "DOGE2",
//       name: "Doge Evolution",
//       image: "https://via.placeholder.com/96x96/F59E0B/FFFFFF?text=D",
//     },
//     curvePercentage: "78",
//     contract: {
//       address: "Dgkc...iBLV",
//       tradeLink: "https://axiom.trade/t/example",
//     },
//     twitter: {
//       handle: "@DogeEvolution",
//       link: "https://twitter.com/DogeEvolution",
//     },
//     description: "The evolution of meme coins with utility features",
//     launchTime: "1h ago",
//   },
// ];

const TokenRow: React.FC<{ token: NewLaunchToken; theme: string }> = React.memo(({
  token,
  theme,
}) => {
  const curveValue = parseFloat(token.curvePercentage);
  const getCurveColor = (percentage: number) => {
    if (percentage === 0) return theme === "dark" ? "#6B7280" : "#9CA3AF";
    if (percentage < 25) return "#EF4444";
    if (percentage < 50) return "#F59E0B";
    if (percentage < 75) return "#10B981";
    return "#3B82F6";
  };

  return (
    <TouchableOpacity className="flex-row items-center py-4 px-5">
      <View className="flex-row items-center flex-1 mr-2">
        <View className="w-10 h-10 rounded-full mr-3 overflow-hidden">
          <Image
            source={{ uri: token.imageUrl }}
            className="w-full h-full"
            defaultSource={{
              uri:
                "https://via.placeholder.com/40x40/6B7280/FFFFFF?text=" +
                token.token.symbol.charAt(0),
            }}
          />
        </View>
        <View className="flex-1">
          <Text
            className={`text-sm font-semibold mb-0.5 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          >
            {token.token.name}
          </Text>
          <Text
            className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
          >
            {token.token.symbol}
          </Text>
        </View>
      </View>

      <View className="items-center justify-center w-16 mx-1">
        <View
          className={`w-8 h-8 rounded-full justify-center items-center`}
          style={{ backgroundColor: getCurveColor(curveValue) + "20" }}
        >
          <Text
            className={`text-xs font-bold`}
            style={{ color: getCurveColor(curveValue) }}
          >
            {token.curvePercentage}%
          </Text>
        </View>
      </View>

      <View className="items-center justify-center w-20 mx-1">
        <TouchableOpacity
          className={`px-3 py-1.5 rounded-full border ${
            theme === "dark"
              ? "border-blue-500 bg-blue-500/10"
              : "border-blue-600 bg-blue-50"
          }`}
        >
          <Text
            className={`text-xs font-medium ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}
          >
            TRADE
          </Text>
        </TouchableOpacity>
      </View>

      <View className="items-center justify-center w-16 mx-1">
        <TouchableOpacity
          className={`px-2 py-1 rounded-md ${
            theme === "dark" ? "bg-gray-800" : "bg-gray-100"
          }`}
        >
          <Text
            className={`text-xs ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}
          >
            {token.twitter.handle}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="items-center justify-center w-10">
        <View
          className={`px-1.5 py-1 rounded-md ${
            theme === "dark" ? "bg-green-500/20" : "bg-green-50"
          }`}
        >
          <Text
            className={`text-xs font-medium ${theme === "dark" ? "text-green-400" : "text-green-600"}`}
          >
            {token.launchTime}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default function NewLaunchScreen() {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const [searchQuery, setSearchQuery] = useState("");

  const { isConnected, filteredData, connectionStatus } = useSocket();

  const NewLaunchData = React.useMemo(() => {
    if (
      filteredData &&
      (filteredData as any).data?.otherData?.newLaunchTableData
    ) {
      return (filteredData as any).data.otherData.newLaunchTableData;
    }
      // return mockNewLaunchData;
  }, [filteredData]);

  const filteredTokens = React.useMemo(
    () => NewLaunchData.filter(
    (token:any) =>
      token.token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.token.name.toLowerCase().includes(searchQuery.toLowerCase())
  ),
  [NewLaunchData, searchQuery]
);

const renderListHeader = () => (
  
  <>
        {/* Header */}
        <View className="px-5 pt-2 pb-5">
        <Text
          className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
        >
          New Launch Tokens
        </Text>
        <Text
          className={`text-sm mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
        >
          Recently launched tokens and their curve progress
        </Text>
      </View>

      {/* Search Bar */}
      <View
        className={`flex-row items-center mx-5 mb-5 px-4 py-3 rounded-xl border ${
          theme === "dark"
            ? "bg-gray-900 border-gray-800"
            : "bg-white border-gray-200"
        }`}
        style={theme !== "dark" ? styles.searchShadow : {}}
      >
        <Text
          className={`text-sm mr-3 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}
        >
          🔍
        </Text>
        <TextInput
          className={`flex-1 text-base ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          placeholder="Search new tokens..."
          placeholderTextColor={theme === "dark" ? "#6B7280" : "#9CA3AF"}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Table Header */}
      <View className="flex-row items-center py-3 px-5">
        <View className="flex-1 mr-2">
          <View className="flex-row items-center">
            <View className="w-10 mr-3" />
            <Text
              className={`text-xs font-semibold uppercase tracking-wide ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
            >
              Token
            </Text>
          </View>
        </View>

        <View className="items-center justify-center w-16 mx-1">
          <Text
            className={`text-xs font-semibold uppercase tracking-wide ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
          >
            Curve %
          </Text>
        </View>

        <View className="items-center justify-center w-20 mx-1">
          <Text
            className={`text-xs font-semibold uppercase tracking-wide ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
          >
            Trade/CA
          </Text>
        </View>

        <View className="items-center justify-center w-16 mx-1">
          <Text
            className={`text-xs font-semibold uppercase tracking-wide ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
          >
            Twitter
          </Text>
        </View>

        <View className="items-center justify-center w-10">
          <Text
            className={`text-xs font-semibold uppercase tracking-wide ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
          >
            Launched
          </Text>
        </View>
      </View>
</>
);
  return (
    <SafeAreaView
      className={`flex-1 ${theme === "dark" ? "bg-black" : "bg-white"}`}
    >

      {/* Token List */}
      {/* <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      > */}
        {/* {filteredTokens.map((token, index) => (
          <View key={index}>
            <TokenRow token={token} theme={theme} />
            {index < filteredTokens.length - 1 && (
              <View className={`mx-0 h-px ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`} />
            )}
          </View>
        ))} */}
        <FlatList
          data={filteredTokens}
          keyExtractor={(item) => item.token.symbol}
          renderItem={({ item }) => <TokenRow token={item} theme={theme} />}
          ItemSeparatorComponent={() => (
            <View
              className={`mx-0 h-px ${theme === "dark" ? "bg-gray-800" : "bg-gray-200"}`}
            />
          )}
          ListHeaderComponent={renderListHeader}
          contentContainerStyle={{ paddingBottom: 20 }}
          />
        
      {/* </ScrollView> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
});
