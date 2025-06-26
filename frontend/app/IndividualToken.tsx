import { Colors } from "@/constants/Colors";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import {
  Circle,
  LinearGradient,
  Path,
  Line as SkiaLine,
  vec,
} from "@shopify/react-native-skia";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import {
  runOnJS,
  useDerivedValue,
  type SharedValue
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CartesianChart,
  useAreaPath,
  useChartPressState,
  useLinePath,
  type ChartBounds,
  type PointsArray,
} from "victory-native";
// import tokenData from "./data.json";
import { useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get("window");

const initChartPressState = { x: 0, y: { price: 0 } };

export default function IndividualToken() {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  const [activeTab, setActiveTab] = useState("overview");
  const [displayPrice, setDisplayPrice] = useState("");
  const [displayDate, setDisplayDate] = useState("");
  const [isInteracting, setIsInteracting] = useState(false); // ✅ Add this state
  // const { passingtokenData } = useLocalSearchParams();
  const params = useLocalSearchParams();
  const { passingtokenData } = params;

  const [tokenData, setTokenData] = useState({});
  const [loading, setLoading] = useState(true);

  console.log("Passing token data:", passingtokenData);

  useEffect(() => {
    const fetchingData = async () => {
      console.log("Fetching data for token:", passingtokenData);
      if (!passingtokenData) {
        console.error("No token data provided");
        setTokenData(null);
        setLoading(false);
        return;
      }
      const parsedTokenData = JSON.parse(passingtokenData);
      try {
        setLoading(true);
        const res = await fetch(
          `http://${process.env.EXPO_SERVER_URL}:3000/api/individualTokenData`, 
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({tokenData: parsedTokenData}),
          }
        );
        const data = await res.json();
        console.log("Fetched token data:", data.data);
        if (data && data.ohlcData && data.tradingActivity,data !== null) {
          setTokenData(data.data);
        } else {
          setTokenData(null);
        }
      } catch (error) {
        setTokenData(null);
      } finally {
        setLoading(false);
      }
    };
  
    fetchingData();
  }, [passingtokenData]);
  
  
  // const aggregateHourlyData = (hourlyData: any[], hours: number) => {
  //   const aggregatedData: any[] = [];

  //   // Sort data by timestamp (oldest first)
  //   const sortedData = [...hourlyData].sort(
  //     (a, b) =>
  //       new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  //   );

  //   for (let i = 0; i < sortedData.length; i += hours) {
  //     const chunk = sortedData.slice(i, i + hours);
  //     if (chunk.length === 0) continue;

  //     const aggregated = {
  //       timestamp: chunk[0].timestamp, // Use first timestamp of the period
  //       open: chunk[0].open,
  //       close: chunk[chunk.length - 1].close,
  //       high: Math.max(...chunk.map((d) => d.high)),
  //       low: Math.min(...chunk.map((d) => d.low)),
  //       volume: chunk.reduce((sum, d) => sum + d.volume, 0),
  //     };
  //     aggregatedData.push(aggregated);
  //   }

  //   return aggregatedData;
  // };

  // Helper function to get data based on timeframe

  // console.log("Token Data:", tokenData);
  const getTimeframeData = (timeframe: string) => {
    if (!tokenData || !tokenData.ohlcData) return []; 
    const { hours, days } = tokenData.ohlcData;

    switch (timeframe) {
      case "3H":
        return [...hours].slice(0, 4).reverse();

      case "6H":
        return [...hours].slice(0, 7).reverse();

      case "12H":
        return [...hours].slice(0, 13).reverse();

      case "1D":
        return [...hours].slice(0, 25).reverse();

      case "1W":
        return [...days].slice(0, 8).reverse();

      case "1M":
        return [...days].slice(0, 31).reverse();

      case "MAX":
        const allData = [...hours, ...days];

        const uniqueData = allData.filter(
          (item, index, arr) =>
            arr.findIndex((t) => t.timestamp === item.timestamp) === index
        );

        return uniqueData.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      default:
        return [...days].reverse();
    }
  };

  const chartData = useMemo(() => {
    console.log("Selected timeframe:", selectedTimeframe);

    // Get data based on selected timeframe
    const rawData = getTimeframeData(selectedTimeframe);

    console.log("Raw data length:", rawData);
    console.log(`${selectedTimeframe} data length:`, rawData.length);
    console.log(`${selectedTimeframe} first entry (newest):`, rawData[0]);
    console.log(
      `${selectedTimeframe} last entry (oldest):`,
      rawData[rawData.length - 1]
    );

    return rawData
      .slice() // create a copy
      .map((entry, index) => ({
        x: index,
        price: entry.close,
        open: entry.open,
        high: entry.high,
        low: entry.low,
        volume: entry.volume,
        timestamp: entry.timestamp,
        date: entry.timestamp,
      }));
  }, [selectedTimeframe]);

  const { state: chartPressState, isActive: isChartPressed } =
    useChartPressState(initChartPressState);

  // On activation of gesture, play haptic feedback
  useEffect(() => {
    if (isChartPressed) {
      Haptics.selectionAsync().catch(() => null);
    }
  }, [isChartPressed]);

  // const activeDate = useDerivedValue(() => {
  //   if (!isChartPressed) return "Touch the chart to see details";

  //   const index = Math.round(chartPressState.x.value.value);
  //   if (index >= 0 && index < chartData.length) {
  //     const date = new Date(chartData[index].timestamp);

  //     // Format date based on timeframe
  //     if (selectedTimeframe === "3H") {
  //       return date.toLocaleString(); // Show date and time for hourly
  //     } else {
  //       return date.toLocaleDateString(); // Show date only for others
  //     }
  //   }
  //   return "";
  // });

  useDerivedValue(() => {
    if (isChartPressed) {
      const price = chartPressState.y.price.value.value;
      const index = Math.round(chartPressState.x.value.value);
  
      runOnJS(setDisplayPrice)(`$${price.toFixed(4)}`);
      runOnJS(setIsInteracting)(true);
  
      // Set the date with both date and time for all timeframes
      if (index >= 0 && index < chartData.length) {
        const date = new Date(chartData[index].timestamp);
        // Always show both date and time
        const formattedDate = date.toLocaleString();
        runOnJS(setDisplayDate)(formattedDate);
      }
    } else {
      // ✅ Don't reset immediately - keep last values visible
      if (!isInteracting) {
        const fallbackPrice = chartData[chartData.length - 1]?.price || 0;
        runOnJS(setDisplayPrice)(`$${fallbackPrice.toFixed(4)}`);
  
        if (chartData.length > 0) {
          const latestDate = new Date(
            chartData[chartData.length - 1].timestamp
          );
          // Always show both date and time for fallback as well
          const formattedDate = latestDate.toLocaleString();
          runOnJS(setDisplayDate)(formattedDate);
        }
      }
    }
  });
  
  // useEffect(() => {
  //   let timeout: NodeJS.Timeout;

  //   if (!isChartPressed && isInteracting) {
  //     // Reset to latest values after 2 seconds of no interaction
  //     timeout = setTimeout(() => {
  //       setIsInteracting(false);
  //       const fallbackPrice = chartData[chartData.length - 1]?.price || 0;
  //       setDisplayPrice(`$${fallbackPrice.toFixed(4)}`);

  //       if (chartData.length > 0) {
  //         const latestDate = new Date(
  //           chartData[chartData.length - 1].timestamp
  //         );
  //         const formattedDate = latestDate.toLocaleString()
  //         setDisplayDate(formattedDate);
  //       }
  //     }, 2000);
  //   }

  //   return () => {
  //     if (timeout) clearTimeout(timeout);
  //   };
  // }, [isChartPressed, isInteracting, chartData, selectedTimeframe]);

  // Style for the active price display
  // const activePriceStyle = useAnimatedStyle<TextStyle>(() => {
  //   return {
  //     fontSize: 24,
  //     fontWeight: "bold",
  //     color: theme === "dark" ? "#ffffff" : "#000000",
  //   };
  // });

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.text }}>Loading...</Text>
      </SafeAreaView>
    );
  }
  
  if (!tokenData) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.text }}>Failed to load token data.</Text>
      </SafeAreaView>
    );
  }
  


  // Helper functions
  const formatNumber = (num: number, decimals = 2) => {
    if (num >= 1e9) return (num / 1e9).toFixed(decimals) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(decimals) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(decimals) + "K";
    return num.toFixed(decimals);
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return "$" + formatNumber(num, 4);
  };

  const getPerformanceColor = (value: number) => {
    return value >= 0 ? "#10B981" : "#EF4444";
  };

  const openLink = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  // Chart Area Component
  const PriceArea = ({
    points,
    left,
    right,
    top,
    bottom,
  }: {
    points: PointsArray;
  } & ChartBounds) => {
    const { path: areaPath } = useAreaPath(points, bottom);
    const { path: linePath } = useLinePath(points);

    const areaColors = [
      theme === "dark" ? "#10B981" : "#4CAF50",
      `${theme === "dark" ? "#10B981" : "#4CAF50"}33`,
    ];

    return (
      <>
        <Path path={areaPath} style="fill">
          <LinearGradient
            start={vec(0, top)}
            end={vec(0, bottom)}
            colors={areaColors}
          />
        </Path>
        <Path
          path={linePath}
          style="stroke"
          strokeWidth={2}
          color={theme === "dark" ? "#10B981" : "#4CAF50"}
        />
      </>
    );
  };

  // Active Value Indicator Component
  const ActiveValueIndicator = ({
    xPosition,
    yPosition,
    top,
    bottom,
    activeValue,
  }: {
    xPosition: SharedValue<number>;
    yPosition: SharedValue<number>;
    activeValue: SharedValue<number>;
    bottom: number;
    top: number;
  }) => {
    const start = useDerivedValue(() => vec(xPosition.value, bottom));
    const end = useDerivedValue(() => vec(xPosition.value, top));

    return (
      <>
        <SkiaLine
          p1={start}
          p2={end}
          color={theme === "dark" ? "#6B7280" : "#9CA3AF"}
          strokeWidth={1}
        />
        <Circle
          cx={xPosition}
          cy={yPosition}
          r={6}
          color={theme === "dark" ? "#10B981" : "#4CAF50"}
        />
        <Circle
          cx={xPosition}
          cy={yPosition}
          r={4}
          color="hsla(0, 0, 100%, 0.25)"
        />
      </>
    );
  };

  const renderTradingActivity = () => (
    <View className={`px-5 py-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
      <Text className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-lg font-semibold mb-4`}>
        Trading Activity (24h)
      </Text>

      <View className="grid grid-cols-2 gap-4">
        <View className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} p-4 rounded-xl`}>
          <Text className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-xs mb-1`}>
            Total Trades
          </Text>
          <Text className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-lg font-bold`}>
            {formatNumber(tokenData.tradingActivity.last24h.totalTrades)}
          </Text>
        </View>

        <View className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} p-4 rounded-xl`}>
          <Text className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-xs mb-1`}>
            Unique Wallets
          </Text>
          <Text className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-lg font-bold`}>
            {formatNumber(tokenData.tradingActivity.last24h.uniqueWallets)}
          </Text>
        </View>

        <View className={`${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'} p-4 rounded-xl`}>
          <Text className="text-green-400 text-xs mb-1">
            Buys
          </Text>
          <Text className="text-green-400 text-lg font-bold">
            {formatNumber(tokenData.tradingActivity.last24h.buys)}
          </Text>
        </View>

        <View className={`${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'} p-4 rounded-xl`}>
          <Text className="text-red-400 text-xs mb-1">
            Sells
          </Text>
          <Text className="text-red-400 text-lg font-bold">
            {formatNumber(tokenData.tradingActivity.last24h.sells)}
          </Text>
        </View>
      </View>
    </View>
  );


  // Main chart render function
  const renderPriceChart = () => {
    const chartHeight = 250;

    // Calculate better Y-axis range and formatting
    const getYAxisConfig = () => {
      if (chartData.length === 0)
        return {
          tickCount: 5,
          formatYLabel: (v: number) => `$${v.toFixed(4)}`,
        };

      const prices = chartData.map((d) => d.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const range = maxPrice - minPrice;

      // Determine appropriate decimal places based on price range
      let decimals = 4;
      if (maxPrice < 0.001) decimals = 6;
      else if (maxPrice < 0.01) decimals = 5;
      else if (maxPrice < 0.1) decimals = 4;
      else if (maxPrice < 1) decimals = 3;
      else decimals = 2;

      // Calculate nice tick intervals
      const getTickInterval = (range: number) => {
        if (range < 0.001) return 0.0001;
        if (range < 0.005) return 0.0005;
        if (range < 0.01) return 0.001;
        if (range < 0.05) return 0.005;
        if (range < 0.1) return 0.01;
        if (range < 0.5) return 0.05;
        return 0.1;
      };

      const tickInterval = getTickInterval(range);
      const tickCount = Math.min(
        8,
        Math.max(4, Math.ceil(range / tickInterval))
      );

      return {
        tickCount,
        formatYLabel: (v: number) => {
          // Format based on value magnitude
          if (v < 0.001) return `$${v.toFixed(6)}`;
          if (v < 0.01) return `$${v.toFixed(5)}`;
          if (v < 0.1) return `$${v.toFixed(4)}`;
          if (v < 1) return `$${v.toFixed(3)}`;
          return `$${v.toFixed(2)}`;
        },
      };
    };

    const yAxisConfig = getYAxisConfig();

    return (
      <View
        className={`px-5 py-4 ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}
      >
        <View className="flex-row justify-between items-center mb-4">
          <Text
            className={`${theme === "dark" ? "text-white" : "text-gray-900"} text-lg font-semibold`}
          >
            Price Chart
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
          >
            {["3H", "6H", "12H", "1D", "1W", "1M", "MAX"].map((timeframe) => (
              <TouchableOpacity
                key={timeframe}
                className={`px-3 py-1 mx-1 rounded ${
                  selectedTimeframe === timeframe
                    ? "bg-blue-500"
                    : theme === "dark"
                      ? "bg-gray-800"
                      : "bg-gray-100"
                }`}
                onPress={() => setSelectedTimeframe(timeframe)}
              >
                <Text
                  className={`text-xs font-medium ${
                    selectedTimeframe === timeframe
                      ? "text-white"
                      : theme === "dark"
                        ? "text-gray-400"
                        : "text-gray-600"
                  }`}
                >
                  {timeframe}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Chart Container */}
        <View style={{ height: chartHeight, marginVertical: 10 }}>
          <CartesianChart
            data={chartData}
            xKey="x"
            yKeys={["price"]}
            chartPressState={chartPressState}
            axisOptions={{
              tickCount: yAxisConfig.tickCount,
              labelOffset: { x: 12, y: 8 },
              labelPosition: { x: "outset", y: "inset" },
              axisSide: { x: "bottom", y: "left" },
              formatYLabel: yAxisConfig.formatYLabel,
              lineColor: theme === "dark" ? "#374151" : "#E5E7EB",
              labelColor: theme === "dark" ? "#9CA3AF" : "#6B7280",
            }}
            renderOutside={({ chartBounds }) => (
              <>
                {isChartPressed && (
                  <ActiveValueIndicator
                    xPosition={chartPressState.x.position}
                    yPosition={chartPressState.y.price.position}
                    bottom={chartBounds.bottom}
                    top={chartBounds.top}
                    activeValue={chartPressState.y.price.value}
                  />
                )}
              </>
            )}
          >
            {({ chartBounds, points }) => (
              <PriceArea points={points.price} {...chartBounds} />
            )}
          </CartesianChart>
        </View>

        {/* Chart info display */}
        <View
          className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-50"} mt-4`}
        >
          <Text
            className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} text-sm text-center`}
          >
            {isChartPressed
              ? `Selected ${selectedTimeframe} Data`
              : `${selectedTimeframe} Chart - Touch to see details`}
          </Text>
          <Text
            className={`${theme === "dark" ? "text-white" : "text-gray-900"} text-lg font-bold text-center mt-1`}
          >
            {displayPrice ||
              formatCurrency(chartData[chartData.length - 1]?.price || 0)}
          </Text>

          {/* ✅ Date Display */}
          <Text
            className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"} text-sm text-center mt-1`}
          >
          {displayDate ||
            (chartData.length > 0
              ? new Date(chartData[chartData.length - 1].timestamp).toLocaleString()
              : "")}
          </Text>

          {/* Price range info */}
          {chartData.length > 0 && (
            <View className="flex-row justify-between mt-2">
              <Text
                className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} text-xs`}
              >
                Low:{" "}
                {yAxisConfig.formatYLabel(
                  Math.min(...chartData.map((d) => d.price))
                )}
              </Text>
              <Text
                className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} text-xs`}
              >
                High:{" "}
                {yAxisConfig.formatYLabel(
                  Math.max(...chartData.map((d) => d.price))
                )}
              </Text>
            </View>
          )}
        </View>

        {/* Chart range info */}
        <View className="flex-row justify-between mt-2">
          <Text
            className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} text-xs`}
          >
            {chartData.length > 0
              ? selectedTimeframe === "3H"
                ? new Date(chartData[0].timestamp).toLocaleString()
                : new Date(chartData[0].timestamp).toLocaleDateString()
              : ""}
          </Text>
          <Text
            className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} text-xs`}
          >
            {chartData.length > 0
              ? `${chartData.length} ${selectedTimeframe === "3H" ? "hours" : "periods"}`
              : ""}
          </Text>
          <Text
            className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} text-xs`}
          >
            {chartData.length > 0
              ? selectedTimeframe === "3H"
                ? new Date(
                    chartData[chartData.length - 1].timestamp
                  ).toLocaleString()
                : new Date(
                    chartData[chartData.length - 1].timestamp
                  ).toLocaleDateString()
              : ""}
          </Text>
        </View>
      </View>
    );
  };

  // ... rest of your existing render functions remain the same ...

  const renderHeader = () => (
    <View
      className={`px-5 py-4 ${theme === "dark" ? "bg-gray-900" : "bg-white"} border-b ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}
    >
      <View className="flex-row items-center justify-between mb-4">
        <TouchableOpacity className="w-10 h-10 justify-center items-center">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View className="flex-row gap-3">
          <TouchableOpacity className="w-10 h-10 justify-center items-center">
            <Ionicons name="heart-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity className="w-10 h-10 justify-center items-center">
            <Ionicons name="share-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row items-center mb-4">
        <Image
          source={{ uri: tokenData?.mediaImages?.imageUrl }}
          className="w-12 h-12 rounded-full mr-4"
        />
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text
              className={`${theme === "dark" ? "text-white" : "text-gray-900"} text-xl font-bold mr-2`}
            >
              {tokenData.basicInfo.tokenName}
            </Text>
            {tokenData.basicInfo.isVerified && (
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            )}
          </View>
          <Text
            className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} text-sm`}
          >
            ${tokenData.basicInfo.token}
          </Text>
        </View>
      </View>

      <View className="mb-4">
        <Text
          className={`${theme === "dark" ? "text-white" : "text-gray-900"} text-3xl font-bold mb-2`}
        >
          {formatCurrency(tokenData.livepriceData.currentPrice)}
        </Text>

        <View className="flex-row items-center gap-4">
          {Object.entries(tokenData.momentumData).map(([key, value]) => (
            <View key={key} className="flex-row items-center">
              <Text
                className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} text-xs mr-1`}
              >
                {key.toUpperCase()}:
              </Text>
              <Text
                className={`text-xs font-medium`}
                style={{ color: getPerformanceColor(value) }}
              >
                {value > 0 ? "+" : ""}
                {value}%
              </Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity
        className="bg-blue-500 py-3 rounded-xl mb-4"
        onPress={() => openLink(tokenData.basicInfo.tradeUrl)}
      >
        <Text className="text-white text-center font-semibold text-base">
          Trade on Believe
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ... include all your other existing render functions (renderMarketStats, renderTradingActivity, etc.) ...

  const renderMarketStats = () => (
    <View className={`px-5 py-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
      <Text className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-lg font-semibold mb-4`}>
        Market Statistics
      </Text>

      <View className="space-y-4">
        <View className="flex-row justify-between items-center">
          <Text className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
            Market Cap
          </Text>
          <Text className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-semibold`}>
            {formatCurrency(tokenData.performanceData.marketCap)}
          </Text>
        </View>

        <View className="flex-row justify-between items-center">
          <Text className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
            24h Volume
          </Text>
          <Text className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-semibold`}>
            {formatCurrency(tokenData.performanceData.volume)}
          </Text>
        </View>

        <View className="flex-row justify-between items-center">
          <Text className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
            Liquidity
          </Text>
          <Text className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-semibold`}>
            {formatCurrency(tokenData.performanceData.liquidity)}
          </Text>
        </View>

        <View className="flex-row justify-between items-center">
          <Text className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
            24h High
          </Text>
          <Text className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-semibold`}>
            {formatCurrency(tokenData.dailyPriceSummary.highPrice)}
          </Text>
        </View>

        <View className="flex-row justify-between items-center">
          <Text className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
            24h Low
          </Text>
          <Text className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-semibold`}>
            {formatCurrency(tokenData.dailyPriceSummary.lowPrice)}
          </Text>
        </View>
      </View>
    </View>
  );



  const renderSocialLinks = () => (
    <View className={`px-5 py-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
      <Text className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-lg font-semibold mb-4`}>
        Social Links
      </Text>

      <View className="space-y-3">
        {tokenData.socialLinks.websites.map((website, index) => (
          <TouchableOpacity
            key={index}
            className={`flex-row items-center p-3 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl`}
            onPress={() => openLink(website.url)}
          >
            <Ionicons name="globe-outline" size={20} color={colors.text} />
            <Text className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} ml-3 flex-1`}>
              {website.label}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={theme === 'dark' ? '#6B7280' : '#9CA3AF'} />
          </TouchableOpacity>
        ))}

        {tokenData.socialLinks.socials.map((social, index) => (
          <TouchableOpacity
            key={index}
            className={`flex-row items-center p-3 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl`}
            onPress={() => openLink(social.url)}
          >
            <Ionicons
              name={social.type === 'twitter' ? 'logo-twitter' : 'link-outline'}
              size={20}
              color={social.type === 'twitter' ? '#1DA1F2' : colors.text}
            />
            <Text className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} ml-3 flex-1`}>
              {social.type.charAt(0).toUpperCase() + social.type.slice(1)}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={theme === 'dark' ? '#6B7280' : '#9CA3AF'} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );


  const renderTokenInfo = () => (
    <View className={`px-5 py-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
      <Text className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-lg font-semibold mb-4`}>
        Token Information
      </Text>

      <View className="space-y-4">
        <View>
          <Text className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm mb-1`}>
            Contract Address
          </Text>
          <View className="flex-row items-center">
            <Text className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-sm flex-1 font-mono`}>
              {tokenData.basicInfo.contractAddress.slice(0, 20)}...
            </Text>
            <TouchableOpacity className="ml-2">
              <Ionicons name="copy-outline" size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row justify-between">
          <Text className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
            Chain
          </Text>
          <Text className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-sm capitalize`}>
            {tokenData.basicInfo.chainId}
          </Text>
        </View>

        <View className="flex-row justify-between">
          <Text className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
            DEX
          </Text>
          <Text className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-sm capitalize`}>
            {tokenData.basicInfo.dexId}
          </Text>
        </View>

        <View className="flex-row justify-between">
          <Text className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
            Total Trades (All Time)
          </Text>
          <Text className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-sm`}>
            {formatNumber(parseInt(tokenData.tradingActivity.allTime.totalTrades))}
          </Text>
        </View>

        <View className="flex-row justify-between">
          <Text className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
            Total Volume (All Time)
          </Text>
          <Text className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-sm`}>
            {formatCurrency(parseFloat(tokenData.tradingActivity.allTime.totalVolume))}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderTabNavigation = () => (
    <View
      className={`flex-row ${theme === "dark" ? "bg-gray-900" : "bg-white"} border-b ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}
    >
      {[
        { key: "overview", label: "Overview" },
        { key: "chart", label: "Chart" },
        { key: "trades", label: "Trades" },
        { key: "info", label: "Info" },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          className={`flex-1 py-4 items-center border-b-2 ${
            activeTab === tab.key ? "border-blue-500" : "border-transparent"
          }`}
          onPress={() => setActiveTab(tab.key)}
        >
          <Text
            className={`text-sm font-medium ${
              activeTab === tab.key
                ? "text-blue-500"
                : theme === "dark"
                  ? "text-gray-400"
                  : "text-gray-600"
            }`}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            {renderMarketStats()}
            {renderTradingActivity()}
            {renderSocialLinks()}
          </>
        );
      case 'chart':
        return renderPriceChart();
      case 'trades':
        return renderTradingActivity();
      case 'info':
        return renderTokenInfo();
      default:
        return (
          <>
            {renderMarketStats()}
            {renderTradingActivity()}
          </>
        );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {renderHeader()}
        {renderTabNavigation()}
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
}
