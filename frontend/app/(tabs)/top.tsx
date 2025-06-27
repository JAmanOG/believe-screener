import { Colors } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSocket } from '../../hooks/useSocket';

interface StockData {
  token: string;
  tokenName: string;
  price: string;
  change24h: string;
  change24hValue: number;
  marketCap: string;
  liquidity: string;
  holders: string;
  chartData: number[];
}

// const mockStockData: StockData[] = [
//   {
//     token: "DUPE",
//     tokenName: "Dupe",
//     price: "$0.021064",
//     change24h: "-8.55%",
//     change24hValue: -8.55,
//     marketCap: "$21.06M",
//     liquidity: "$2.12M",
//     holders: "7K",
//     chartData: [100, 95, 88, 92, 85, 78, 82, 75, 70, 72, 68, 65],
//   },
//   {
//     token: "BTC",
//     tokenName: "Bitcoin",
//     price: "$32,811.00",
//     change24h: "-2.27%",
//     change24hValue: -2.27,
//     marketCap: "$3.4T",
//     liquidity: "$850M",
//     holders: "15.8M",
//     chartData: [100, 98, 95, 92, 88, 85, 82, 78, 75, 72, 68, 65],
//   },
//   {
//     token: "ETH",
//     tokenName: "Ethereum",
//     price: "$2,489.10",
//     change24h: "+3.95%",
//     change24hValue: 3.95,
//     marketCap: "$902B",
//     liquidity: "$520M",
//     holders: "3.2M",
//     chartData: [60, 65, 68, 72, 75, 78, 82, 85, 88, 92, 95, 98],
//   },
//   {
//     token: "SOL",
//     tokenName: "Solana",
//     price: "$178.32",
//     change24h: "+12.25%",
//     change24hValue: 12.25,
//     marketCap: "$2.2T",
//     liquidity: "$420M",
//     holders: "2.8M",
//     chartData: [70, 75, 78, 82, 85, 88, 92, 95, 98, 102, 105, 108],
//   },
//   {
//     token: "ADA",
//     tokenName: "Cardano",
//     price: "$0.45",
//     change24h: "-1.20%",
//     change24hValue: -1.20,
//     marketCap: "$89.5B",
//     liquidity: "$180M",
//     holders: "4.1M",
//     chartData: [100, 99, 97, 95, 96, 94, 92, 90, 89, 91, 88, 87],
//   }
// ];

const MiniChart: React.FC<{ data: number[]; isPositive: boolean }> = ({ data, isPositive }) => {
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;

  return (
    <View className="flex-row items-end h-4 w-12 gap-0.5">
      {data.map((value, index) => {
        const height = ((value - minValue) / range) * 16 + 2;
        const opacity = 0.6 + (height / 18) * 0.4;
        return (
          <View
            key={index}
            className={`flex-1 rounded-sm ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}`}
            style={{ height, opacity }}
          />
        );
      })}
    </View>
  );
};


function generateMockChartData(tokenData: StockData) {
  const currentPrice = parseFloat(tokenData.price.replace('$', ''));
  const change24h = tokenData.change24hValue;
  
  // Generate 12 data points representing hourly changes over 24h
  const chartData = [];
  const basePrice = currentPrice / (1 + (change24h / 100)); // Calculate starting price
  
  for (let i = 0; i < 12; i++) {
    // Create some variation around the trend
    const randomVariation = (Math.random() - 0.5) * 0.1; // ±5% random variation
    const trendFactor = (change24h / 100) * (i / 11); // Progressive change over time
    const pricePoint = basePrice * (1 + trendFactor + randomVariation);
    chartData.push(Math.max(0, pricePoint)); // Ensure no negative prices
  }
  
  return chartData;
}


export default function TopScreen() {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const [searchQuery, setSearchQuery] = useState('');
  const { isConnected, filteredData, connectionStatus } = useSocket();
  const router = useRouter();
  
  const tokenData = (filteredData as any) ? (filteredData as any).data.tableData : [];

  const tokenDataWithCharts = React.useMemo(
    () => tokenData.map((token: any) => ({
    ...token,
    chartData: generateMockChartData(token),
  })),
  [tokenData]
);

  const filteredStocks = React.useMemo(
    () => tokenDataWithCharts.filter((stock: any) =>
    stock.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.tokenName.toLowerCase().includes(searchQuery.toLowerCase())
  ),
  [tokenDataWithCharts, searchQuery]
);

  const StockRow: React.FC<{ stock: StockData; theme: string }> = React.memo(({ stock, theme }) => {
    const isPositive = stock.change24hValue >= 0;
    
    return (
      <TouchableOpacity onPress={() => {
        router.push({
          pathname: '/IndividualToken',
          params: { passingtokenData: JSON.stringify(stock) }
        });
      }} className="flex-row items-center py-4 px-5">
        <View className="flex-row items-center flex-1">
          <View className="flex-1">
            <Text className={`text-sm font-semibold mb-0.5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {stock.tokenName}
            </Text>
            <Text className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {stock.token} • {stock.marketCap}
            </Text>
          </View>
        </View>
        
        <View className="items-center justify-center w-16">
          <MiniChart data={stock.chartData} isPositive={isPositive} />
        </View>
        
        <View className="items-center justify-center w-20">
          <Text className={`text-sm font-semibold mb-0.5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {stock.price}
          </Text>
          <Text className={`text-xs font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
            {stock.change24h}
          </Text>
        </View>
  
        <View className="items-center justify-center w-16">
          <Text className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {stock.liquidity}
          </Text>
        </View>
  
        <View className="items-center justify-center w-16">
          <Text className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {stock.holders}
          </Text>
        </View>
      </TouchableOpacity>
    );
  });
  

  return (
    <SafeAreaView className={`flex-1 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      {/* Header */}
      <View className="px-5 pt-2 pb-5">
        <Text className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Top 75 Tokens
        </Text>
        <Text className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Real-time crypto prices
        </Text>
      </View>

      {/* Search Bar */}
      <View 
        className={`flex-row items-center mx-5 mb-5 px-4 py-3 rounded-xl border ${
          theme === 'dark'
            ? 'bg-gray-900 border-gray-800' 
            : 'bg-white border-gray-200'
        }`}
        style={theme !== 'dark' ? styles.searchShadow : {}}
      >
        <Text className={`text-sm mr-3 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
          🔍
        </Text>
        <TextInput
          className={`flex-1 text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
          placeholder="Search tokens..."
          placeholderTextColor={theme === 'dark' ? '#6B7280' : '#9CA3AF'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Table Header */}
      <View className="flex-row items-center py-3 px-5">
        <View className="flex-1">
          <View className="flex-row items-center">
            <View className="w-9 mr-3" />
            <Text className={`text-xs font-semibold uppercase tracking-wide ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Token
            </Text>
          </View>
        </View>
        
        <View className="items-center justify-center w-16">
          <Text className={`text-xs font-semibold uppercase tracking-wide ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Chart
          </Text>
        </View>
        
        <View className="items-center justify-center w-20">
          <Text className={`text-xs font-semibold uppercase tracking-wide ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Price
          </Text>
        </View>

        <View className="items-center justify-center w-16">
          <Text className={`text-xs font-semibold uppercase tracking-wide ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Liquidity
          </Text>
        </View>

        <View className="items-center justify-center w-16">
          <Text className={`text-xs font-semibold uppercase tracking-wide ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Holders
          </Text>
        </View>
      </View>

      {/* Stock List */}
      {/* <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      > */}
        {/* {filteredStocks.map((stock, index) => (
          <View key={index}>
            <StockRow stock={stock} theme={theme} />
            {index < filteredStocks.length - 1 && (
              <View className={`mx-0 h-px ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`} />
            )}
          </View>
        ))} */}

<FlatList
  data={filteredStocks}
  keyExtractor={(item) => item.token}
  renderItem={({ item }) => <StockRow stock={item} theme={theme} />}
  ItemSeparatorComponent={() => (
    <View className={`mx-0 h-px ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`} />
  )}
  contentContainerStyle={{ paddingBottom: 20 }}
/>
      {/* </ScrollView> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});