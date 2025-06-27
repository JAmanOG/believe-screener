import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSocket } from "../../hooks/useSocket";

const { width } = Dimensions.get("window");

interface StockData {
  symbol: string;
  company: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  previousClose: number;
  open: number;
}

interface TableTokenData {
  token: string;
  symbol: string;
  company: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  previousClose: number;
  open: number;
}

interface RawTokenData {
  token: string;
  tokenName: string;
  tradeCA?: string;
  price: string;
  marketCap: string;
  marketCapValue: number;
  change30m?: string;
  change24h?: string;
  change24hValue: number;
  volume24h?: string;
  volume24hValue?: number;
  liquidityFull?: {
    liquidity: string;
    buy: string;
    sell: string;
  };
  liquidity: string;
  buyPressure?: string;
  sellPressure?: string;
  holders: string;
  age?: string;
}

export default function HomeScreen() {
  const [activeView, setActiveView] = useState("Table View");
  const { theme, toggleTheme } = useTheme();
  const colors = Colors[theme];
  const { isConnected, filteredData, connectionStatus } = useSocket();

  console.log("Connection Status:", connectionStatus);

  const globalStats = (filteredData as any)?.data?.otherData?.globalStats || [];

  const liveTokenData = (filteredData as any)?.data?.tableData || [];
  const tableViewData = liveTokenData.slice(0, 5);

  const convertTokenToTableFormat = (token: any) => {
    // Parse price value
    const priceValue = parseFloat(token.price.replace(/[$,]/g, "")) || 0;

    // Parse change percentage (remove arrows and % sign)
    const changeValue = parseFloat(
      token.change24h?.replace(/[↑↓%]/g, "") || "0"
    );
    const isNegative = token.change24h?.includes("↓");
    const finalChangeValue = isNegative ? -changeValue : changeValue;

    return {
      token: token.token,
      symbol: token.token,
      company: token.tokenName,
      price: priceValue,
      change: finalChangeValue,
      changePercent: finalChangeValue,
      volume: token.volume24h || "$0",
      marketCap: token.marketCap || "$0",
      previousClose: priceValue,
      open: priceValue,
    };
  };

  // Convert live data for table display
  const tokenData = React.useMemo(
    () => tableViewData.map(convertTokenToTableFormat),
    [tableViewData]
  );

  // Major stats with the exact data you provided
  // const majorStats = [
  //   {
  //     title: "Total Market Cap",
  //     value: "$206.18M",
  //     subDetails: ["$105.57M Creator Coins", "$100.62M LAUNCHCOIN"],
  //     icon: "trending-up",
  //     color: "#10B981",
  //   },
  //   {
  //     title: "24h Volume",
  //     value: "$29.11M",
  //     subDetails: ["$10.56M Creator Coins", "$18.55M LAUNCHCOIN"],
  //     icon: "bar-chart",
  //     color: "#3B82F6",
  //   },
  //   {
  //     title: "24h Transactions",
  //     value: "110.86K",
  //     subDetails: ["48.45K Creator Coins", "62.41K LAUNCHCOIN"],
  //     icon: "swap-horizontal",
  //     color: "#F59E0B",
  //   },
  //   {
  //     title: "Total Liquidity",
  //     value: "$22.26M",
  //     subDetails: ["$17.28M Creator Coins", "$4.98M LAUNCHCOIN"],
  //     icon: "water",
  //     color: "#8B5CF6",
  //   },
  // ];

  const majorStats = (filteredData as any)?.data?.otherData?.majorCardDetails || [];

  // Add icon and color mapping for live data to match dummy data styling
  const getMajorStatWithIconAndColor = (stat: any) => {
    const iconColorMap: { [key: string]: { icon: string; color: string } } = {
      "Total Market Cap": { icon: "trending-up", color: "#10B981" },
      "24h Volume": { icon: "bar-chart", color: "#3B82F6" },
      "24h Transactions": { icon: "swap-horizontal", color: "#F59E0B" },
      "Total Liquidity": { icon: "water", color: "#8B5CF6" },
    };

    const mapping = iconColorMap[stat.title] || {
      icon: "stats-chart",
      color: "#6B7280",
    };

    return {
      ...stat,
      icon: mapping.icon,
      color: mapping.color,
    };
  };

  const enhancedMajorStats = React.useMemo(
    () => majorStats.map(getMajorStatWithIconAndColor),
    [majorStats]
  );

  const [heatmapFilter, setHeatmapFilter] = useState("all");

  const renderMajorStatCard = (stat: any, index: number) => (
    <View
      key={index}
      className={`${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      } rounded-2xl p-4 mr-4 mb-3`}
      style={{ width: width * 0.8 }}
    >
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-row items-center gap-3">
          <View
            className={`w-9 h-9 rounded-lg justify-center items-center`}
            style={{ backgroundColor: stat.color + "20" }}
          >
            <Ionicons
              name={stat.icon}
              size={24}
              style={{ color: stat.color }}
            />
          </View>
          <View>
            <Text
              className={`${
                theme === "dark" ? "text-white" : "text-gray-900"
              } text-base font-bold`}
            >
              {stat.title}
            </Text>
            <Text
              className={`${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              } text-xs`}
            >
              Live Data
            </Text>
          </View>
        </View>
      </View>

      <View className="mb-4">
        <Text
          className={`${
            theme === "dark" ? "text-white" : "text-gray-900"
          } text-2xl font-bold`}
        >
          {stat.value}
        </Text>
        <Text
          className={`${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          } text-xs`}
        >
          Total Amount
        </Text>
      </View>

      <View className="mb-4">
        {stat.subDetails.map((detail: string, detailIndex: number) => (
          <View
            key={detailIndex}
            className="flex-row justify-between items-center mb-2"
          >
            <Text
              className={`${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              } text-xs`}
            >
              {detail.includes("Creator Coins")
                ? "Creator Coins"
                : "LAUNCHCOIN"}
            </Text>
            <Text
              className={`${
                theme === "dark" ? "text-white" : "text-gray-900"
              } text-xs font-medium`}
            >
              {detail.split(" ")[0]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderTableRow = React.useCallback(
    (stock: TableTokenData, index: number) => (
      <View
        key={index}
        className={`flex-row px-5 py-4 border-b ${
          theme === "dark" ? "border-gray-900" : "border-gray-200"
        }`}
      >
        <View className="flex-1 justify-center">
          <View className="flex-row items-center gap-2">
            <View>
              <Text
                className={`${
                  theme === "dark" ? "text-white" : "text-gray-900"
                } text-sm font-semibold`}
              >
                {stock.symbol}
              </Text>
              <Text
                className={`${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                } text-xs`}
              >
                {stock.company}
              </Text>
            </View>
          </View>
        </View>
        <View className="flex-1 justify-center items-center">
          <Text
            className={`${
              theme === "dark" ? "text-white" : "text-gray-900"
            } text-sm font-medium`}
          >
            ${stock.price}
          </Text>
        </View>
        <View className="flex-1 justify-center items-center">
          <Text
            className={`text-sm font-medium ${
              stock.change > 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {stock.change > 0 ? "+" : ""}
            {stock.change}
          </Text>
          <Text
            className={`text-xs ${
              stock.change > 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            ({stock.change > 0 ? "+" : ""}
            {stock.changePercent}%)
          </Text>
        </View>
        <View className="flex-1 justify-center items-center">
          <Text
            className={`${
              theme === "dark" ? "text-white" : "text-gray-900"
            } text-sm`}
          >
            {stock.volume}
          </Text>
        </View>
        <View className="flex-1 justify-center items-center">
          <Text
            className={`${
              theme === "dark" ? "text-white" : "text-gray-900"
            } text-sm`}
          >
            {stock.marketCap}
          </Text>
        </View>
      </View>
    ),
    [theme]
  );

  const tokenDataRaw = (filteredData as any)?.data?.tableData || [];

  const heatmapData = React.useMemo(() => {
    return tokenDataRaw.map((token: RawTokenData) => {
      const hasNegativePerformance = token.change24h?.includes("↓");
      let adjustedPerformancePercent = Math.abs(token.change24hValue || 0);
      if (hasNegativePerformance) {
        adjustedPerformancePercent = -adjustedPerformancePercent;
      }
      return {
        symbol: token.token,
        marketCapitalization: token.marketCap,
        marketCapValue: token.marketCapValue,
        dailyPerformancePercent: adjustedPerformancePercent,
        holderCount: token.holders,
      };
    });
  }, [tokenDataRaw]);

  const filteredHeatmapData = React.useMemo(() => {
    switch (heatmapFilter) {
      case "advancing":
        return heatmapData
          .filter((token: any) => token.dailyPerformancePercent > 0)
          .sort(
            (a: any, b: any) =>
              b.dailyPerformancePercent - a.dailyPerformancePercent
          );
      case "declining":
        return heatmapData
          .filter((token: any) => token.dailyPerformancePercent < 0)
          .sort(
            (a: any, b: any) => a.dailyPerformancePercent - b.dailyPerformancePercent
          );
      default:
        return heatmapData.sort((a: any, b: any) => b.marketCapValue - a.marketCapValue);
    }
  }, [heatmapData, heatmapFilter]);

  const renderHeatmapView = () => {
    // Use filteredHeatmapData instead of recalculating
    // Professional size calculation based on market capitalization
    const maxMarketCap =
      heatmapData.length > 0
        ? Math.max(...heatmapData.map((t:any) => t.marketCapValue))
        : 1;
    const minMarketCap =
      heatmapData.length > 0
        ? Math.min(...heatmapData.map((t:any) => t.marketCapValue))
        : 0;
    const calculateTokenBoxSize = (marketCapValue: number) => {
      const sizeRatio =
        (marketCapValue - minMarketCap) / (maxMarketCap - minMarketCap || 1);
      const calculatedSize = 50 + sizeRatio * 40; // 50px to 90px
      return { width: calculatedSize, height: calculatedSize };
    };

    // Professional color scheme based on performance
    const getPerformanceColor = (performancePercent: number) => {
      if (performancePercent > 15) return "#059669"; // Strong positive performance
      if (performancePercent > 0) return "#10B981"; // Positive performance
      if (performancePercent > -15) return "#EF4444"; // Negative performance
      return "#DC2626"; // Strong negative performance
    };

    const advancingTokens = filteredHeatmapData.filter(
      (t:any) => t.dailyPerformancePercent > 0
    ).length;
    const decliningTokens = filteredHeatmapData.filter(
      (t:any) => t.dailyPerformancePercent < 0
    ).length;

    return (
      <View
        className={`px-5 py-6 ${
          theme === "dark" ? "bg-gray-900" : "bg-gray-50"
        } mx-5 rounded-xl`}
      >
        {/* Professional Header */}
        <View className="items-center mb-6">
          <Text
            className={`${
              theme === "dark" ? "text-white" : "text-gray-900"
            } text-lg font-bold`}
          >
            Market Performance Heatmap
          </Text>
          <Text
            className={`${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            } text-sm mt-1`}
          >
            {filteredHeatmapData.length} tokens • 24h market data
          </Text>
        </View>

        {/* Professional Market Statistics */}
        <View className="flex-row justify-around mb-6">
          <View className="items-center">
            <Text className="text-green-500 text-xl font-bold">
              {advancingTokens}
            </Text>
            <Text
              className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} text-xs`}
            >
              Advancing
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-red-500 text-xl font-bold">
              {decliningTokens}
            </Text>
            <Text
              className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} text-xs`}
            >
              Declining
            </Text>
          </View>
        </View>

        {/* Professional Filter Controls */}
        <View className="flex-row justify-center mb-6">
          {[
            { key: "all", label: "All Securities" },
            { key: "advancing", label: "Advancing" },
            { key: "declining", label: "Declining" },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              className={`px-4 py-2 mx-1 rounded-full ${
                heatmapFilter === filter.key
                  ? "bg-blue-500"
                  : theme === "dark"
                    ? "bg-gray-700"
                    : "bg-gray-200"
              }`}
              onPress={() => setHeatmapFilter(filter.key)}
            >
              <Text
                className={`text-xs font-medium ${
                  heatmapFilter === filter.key
                    ? "text-white"
                    : theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-700"
                }`}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Professional Heatmap Visualization */}
        <View className="flex-row flex-wrap justify-center">
          {filteredHeatmapData.map((tokenData:any, index:number) => {
            const boxDimensions = calculateTokenBoxSize(
              tokenData.marketCapValue
            );
            const performanceColor = getPerformanceColor(
              tokenData.dailyPerformancePercent
            );

            return (
              <TouchableOpacity
                key={index}
                className="rounded-xl justify-center items-center p-2 m-1"
                style={{
                  width: boxDimensions.width,
                  height: boxDimensions.height,
                  backgroundColor: performanceColor,
                }}
              >
                <Text className="text-white font-bold text-xs text-center">
                  {tokenData.symbol}
                </Text>
                <Text className="text-white text-xs mt-1">
                  {tokenData.dailyPerformancePercent > 0 ? "+" : ""}
                  {tokenData.dailyPerformancePercent.toFixed(1)}%
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Professional Legend */}
        <View className="mt-6">
          <Text
            className={`${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            } text-sm font-semibold mb-3 text-center`}
          >
            Performance Indicators
          </Text>

          <View className="flex-row justify-between items-center mb-3">
            <Text
              className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} text-xs`}
            >
              Color: Daily Performance
            </Text>
            <Text
              className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} text-xs`}
            >
              Size: Market Capitalization
            </Text>
          </View>

          <View className="flex-row justify-between">
            <View className="flex-row items-center">
              <View className="w-4 h-4 rounded bg-red-600 mr-2" />
              <Text
                className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"} text-xs`}
              >
                Declining Performance
              </Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-4 h-4 rounded bg-green-600 mr-2" />
              <Text
                className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"} text-xs`}
              >
                Advancing Performance
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      className={`flex-1 ${theme === "dark" ? "bg-black" : "bg-white"}`}
    >
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center px-5 py-4">
          <Text
            className={`${
              theme === "dark" ? "text-white" : "text-gray-900"
            } text-xl font-bold tracking-wide`}
          >
            BelieveScreener
          </Text>
          <View className="flex-row gap-4">
            {/* Theme Toggle Button */}
            <TouchableOpacity
              className={`w-10 h-10 ${
                theme === "dark" ? "bg-gray-900" : "bg-gray-100"
              } rounded-full justify-center items-center`}
              onPress={toggleTheme}
            >
              <Ionicons
                name={theme === "dark" ? "sunny" : "moon"}
                size={20}
                color={theme === "dark" ? "#FCD34D" : "#6B7280"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              className={`w-10 h-10 ${
                theme === "dark" ? "bg-gray-900" : "bg-gray-100"
              } rounded-full justify-center items-center`}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
            <TouchableOpacity
              className={`w-10 h-10 ${
                theme === "dark" ? "bg-gray-900" : "bg-gray-100"
              } rounded-full justify-center items-center`}
            >
              <Ionicons name="menu" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Global Stats */}
        <View className="px-5 mb-6">
          <View className="flex-row justify-between">
            {globalStats.map((stat: any, index: number) => (
              <View
                key={index}
                className={`flex-1 ${
                  theme === "dark" ? "bg-gray-900" : "bg-gray-50"
                } rounded-xl p-4 ${index < globalStats.length - 1 ? "mr-2" : ""}`}
                style={{ minHeight: 120 }}
              >
                <Text
                  className={`${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  } text-xs font-semibold mb-2 uppercase tracking-wide`}
                >
                  {stat.title}
                </Text>
                <Text
                  className={`${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  } text-lg font-bold mb-2 leading-tight`}
                >
                  {stat.value}
                </Text>
                <Text
                  className={`${
                    theme === "dark" ? "text-gray-500" : "text-gray-500"
                  } text-xs leading-normal flex-1`}
                >
                  {stat.subDetail}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="flex-row justify-between items-center px-5 my-4">
          <Text
            className={`${
              theme === "dark" ? "text-white" : "text-gray-900"
            } text-lg font-semibold`}
          >
            Major Market Stats
          </Text>
          <TouchableOpacity>
            <Text
              className={`${
                theme === "dark" ? "text-blue-400" : "text-blue-600"
              } text-sm`}
            >
              Refresh
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="pl-5"
        >
          {enhancedMajorStats.map((stat: any, index: number) =>
            renderMajorStatCard(stat, index)
          )}
        </ScrollView>

        {/* View Toggle */}
        <View
          className={`flex-row ${
            theme === "dark" ? "bg-gray-900" : "bg-gray-100"
          } mx-5 my-5 rounded-full p-1`}
        >
          <TouchableOpacity
            className={`flex-1 py-3 items-center rounded-full ${
              activeView === "Table View"
                ? theme === "dark"
                  ? "bg-gray-700"
                  : "bg-white"
                : ""
            }`}
            onPress={() => setActiveView("Table View")}
          >
            <Text
              className={`text-sm ${
                activeView === "Table View"
                  ? theme === "dark"
                    ? "text-white"
                    : "text-gray-900"
                  : theme === "dark"
                    ? "text-gray-400"
                    : "text-gray-600"
              }`}
            >
              Table View
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 items-center rounded-full ${
              activeView === "Heatmap View"
                ? theme === "dark"
                  ? "bg-gray-700"
                  : "bg-white"
                : ""
            }`}
            onPress={() => setActiveView("Heatmap View")}
          >
            <Text
              className={`text-sm ${
                activeView === "Heatmap View"
                  ? theme === "dark"
                    ? "text-white"
                    : "text-gray-900"
                  : theme === "dark"
                    ? "text-gray-400"
                    : "text-gray-600"
              }`}
            >
              Heatmap View
            </Text>
          </TouchableOpacity>
        </View>

        {activeView === "Table View" ? (
          <>
            {/* Table Header */}
            <View
              className={`flex-row px-5 py-3 border-b ${
                theme === "dark" ? "border-gray-700" : "border-gray-300"
              }`}
            >
              <View className="flex-1">
                <Text
                  className={`${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  } text-xs font-medium`}
                >
                  NAME
                </Text>
              </View>
              <View className="flex-1 items-center">
                <Text
                  className={`${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  } text-xs font-medium`}
                >
                  PRICE
                </Text>
              </View>
              <View className="flex-1 items-center">
                <Text
                  className={`${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  } text-xs font-medium`}
                >
                  CHANGE
                </Text>
              </View>
              <View className="flex-1 items-center">
                <Text
                  className={`${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  } text-xs font-medium`}
                >
                  VOLUME
                </Text>
              </View>
              <View className="flex-1 items-center">
                <Text
                  className={`${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  } text-xs font-medium`}
                >
                  MARKET CAP
                </Text>
              </View>
            </View>

            {/* <FlatList
              data={tokenData}
              keyExtractor={(item, idx) =>
                item.token ? String(item.token) : `token-${idx}`
              }
              renderItem={({ item, index }) => renderTableRow(item, index)}
            /> */}
            <FlatList
              data={tokenData}
              keyExtractor={(item) => String(item.token)}
              renderItem={({ item, index }) => renderTableRow(item, index)}
            />
          </>
        ) : (
          renderHeatmapView()
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
