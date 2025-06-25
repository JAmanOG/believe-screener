import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { Colors } from "@/constants/Colors";

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

const stockData: StockData[] = [
  {
    symbol: "AAPL",
    company: "Apple Inc.",
    price: 138.2,
    change: 4.28,
    changePercent: 3.0,
    volume: "$124.925M",
    marketCap: "$2.221T",
    previousClose: 142.48,
    open: 161.28,
  },
  {
    symbol: "AAPL",
    company: "Apple Inc.",
    price: 138.2,
    change: 4.28,
    changePercent: 3.0,
    volume: "$124.925M",
    marketCap: "$2.221T",
    previousClose: 142.48,
    open: 161.28,
  },
  {
    symbol: "AAPL",
    company: "Apple Inc.",
    price: 138.2,
    change: 4.28,
    changePercent: 3.0,
    volume: "$124.925M",
    marketCap: "$2.221T",
    previousClose: 142.48,
    open: 161.28,
  },
];

export default function HomeScreen() {
  const [activeView, setActiveView] = useState("Table View");
  const { theme, toggleTheme } = useTheme();
  const colors = Colors[theme];

  const renderStockCard = (stock: StockData, index: number) => (
    <View
      key={index}
      className={`${theme === "dark" ? "bg-gray-900" : "bg-gray-50"} rounded-2xl p-4 mr-4 mb-3`}
      style={{ width: width * 0.75 }}
    >
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-row items-center gap-3">
          <View
            className={`w-9 h-9 ${theme === "dark" ? "bg-gray-700" : "bg-gray-300"} rounded-lg justify-center items-center`}
          >
            <Ionicons name="logo-apple" size={24} color={colors.text} />
          </View>
          <View>
            <Text
              className={`${theme === "dark" ? "text-white" : "text-gray-900"} text-base font-bold`}
            >
              {stock.symbol}
            </Text>
            <Text
              className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} text-xs`}
            >
              {stock.company}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-1">
          <Ionicons name="trending-up" size={16} color={colors.green} />
          <Text className="text-green-400 text-xs font-medium">
            +{stock.change} (+{stock.changePercent}%)
          </Text>
        </View>
      </View>

      <View className="mb-4">
        <Text
          className={`${theme === "dark" ? "text-white" : "text-gray-900"} text-2xl font-bold`}
        >
          ${stock.price}
        </Text>
        <Text
          className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} text-xs`}
        >
          $ 138.00 - $ 161.10
        </Text>
      </View>

      <View className="h-10 mb-4">
        <View
          className={`flex-1 ${theme === "dark" ? "bg-gray-700" : "bg-gray-300"} rounded`}
        />
      </View>

      <View
        className={`border-t ${theme === "dark" ? "border-gray-700" : "border-gray-300"} pt-4`}
      >
        <View className="flex-row justify-between">
          <View className="flex-1">
            <Text
              className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} text-xs mb-1`}
            >
              Previous Close
            </Text>
            <Text
              className={`${theme === "dark" ? "text-white" : "text-gray-900"} text-xs font-medium`}
            >
              ${stock.previousClose}
            </Text>
          </View>
          <View className="flex-1">
            <Text
              className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} text-xs mb-1`}
            >
              Open
            </Text>
            <Text
              className={`${theme === "dark" ? "text-white" : "text-gray-900"} text-xs font-medium`}
            >
              ${stock.open}
            </Text>
          </View>
          <View className="flex-1">
            <Text
              className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} text-xs mb-1`}
            >
              Market Cap
            </Text>
            <Text
              className={`${theme === "dark" ? "text-white" : "text-gray-900"} text-xs font-medium`}
            >
              {stock.marketCap}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderTableRow = (stock: StockData, index: number) => (
    <View
      key={index}
      className={`flex-row px-5 py-4 border-b ${theme === "dark" ? "border-gray-900" : "border-gray-200"}`}
    >
      <View className="flex-1 justify-center">
        <View className="flex-row items-center gap-2">
          <View
            className={`w-6 h-6 ${theme === "dark" ? "bg-gray-700" : "bg-gray-300"} rounded justify-center items-center`}
          >
            <Ionicons name="logo-apple" size={16} color={colors.text} />
          </View>
          <View>
            <Text
              className={`${theme === "dark" ? "text-white" : "text-gray-900"} text-sm font-semibold`}
            >
              {stock.symbol}
            </Text>
            <Text
              className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} text-xs`}
            >
              {stock.company}
            </Text>
          </View>
        </View>
      </View>
      <View className="flex-1 justify-center">
        <Text
          className={`${theme === "dark" ? "text-white" : "text-gray-900"} text-sm font-medium`}
        >
          ${stock.price}
        </Text>
      </View>
      <View className="flex-1 justify-center">
        <Text className="text-green-400 text-sm font-medium">
          +{stock.change}
        </Text>
        <Text className="text-green-400 text-xs">
          (+{stock.changePercent}%)
        </Text>
      </View>
      <View className="flex-1 justify-center">
        <Text
          className={`${theme === "dark" ? "text-white" : "text-gray-900"} text-sm`}
        >
          {stock.volume}
        </Text>
      </View>
      <View className="flex-1 justify-center">
        <Text
          className={`${theme === "dark" ? "text-white" : "text-gray-900"} text-sm`}
        >
          {stock.marketCap}
        </Text>
      </View>
    </View>
  );

  const renderHeatmapView = () => (
    <View
      className={`px-5 py-8 ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"} mx-5 rounded-xl`}
    >
      <View className="items-center mb-4">
        <Text
          className={`${theme === "dark" ? "text-white" : "text-gray-900"} text-lg font-semibold`}
        >
          Market Heatmap
        </Text>
        <Text
          className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} text-sm mt-1`}
        >
          Visualize market performance
        </Text>
      </View>

      <View className="flex-row flex-wrap justify-center gap-2 mt-4">
        {stockData.map((stock, index) => (
          <View
            key={index}
            className={`w-24 h-24 ${stock.change > 0 ? "bg-green-600" : "bg-red-600"} 
              rounded-lg justify-center items-center p-2
              ${stock.change > 3 ? "opacity-100" : "opacity-70"}`}
          >
            <Text className="text-white font-bold text-base">
              {stock.symbol}
            </Text>
            <Text className="text-white text-xs">{stock.changePercent}%</Text>
          </View>
        ))}
      </View>

      <View className="flex-row justify-between mt-8">
        <View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-sm bg-green-600 mr-2" />
            <Text
              className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"} text-xs`}
            >
              Gainers
            </Text>
          </View>
        </View>
        <View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-sm bg-red-600 mr-2" />
            <Text
              className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"} text-xs`}
            >
              Losers
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      className={`flex-1 ${theme === "dark" ? "bg-black" : "bg-white"}`}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row justify-between items-center px-5 py-4">
          <Text
            className={`${theme === "dark" ? "text-white" : "text-gray-900"} text-xl font-bold tracking-wide`}
          >
            COIN FLOW
          </Text>
          <View className="flex-row gap-4">
            {/* Theme Toggle Button */}
            <TouchableOpacity
              className={`w-10 h-10 ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"} rounded-full justify-center items-center`}
              onPress={toggleTheme}
            >
              <Ionicons
                name={theme === "dark" ? "sunny" : "moon"}
                size={20}
                color={theme === "dark" ? "#FCD34D" : "#6B7280"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              className={`w-10 h-10 ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"} rounded-full justify-center items-center`}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
            <TouchableOpacity
              className={`w-10 h-10 ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"} rounded-full justify-center items-center`}
            >
              <Ionicons name="menu" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View
          className={`flex-row items-center ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"} mx-5 my-4 px-4 py-3 rounded-full`}
        >
          <Ionicons name="search" size={20} color={colors.gray} />
          <TextInput
            className={`flex-1 ml-3 ${theme === "dark" ? "text-white" : "text-gray-900"} text-base`}
            placeholder="Search something here ..."
            placeholderTextColor={colors.gray}
          />
        </View>

        {/* Featured Stocks */}
        <View className="flex-row justify-between items-center px-5 my-4">
          <Text
            className={`${theme === "dark" ? "text-white" : "text-gray-900"} text-lg font-semibold`}
          >
            Featured Stocks
          </Text>
          <TouchableOpacity>
            <Text
              className={`${theme === "dark" ? "text-blue-400" : "text-blue-600"} text-sm`}
            >
              See All
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="pl-5"
        >
          {stockData.map((stock, index) => renderStockCard(stock, index))}
        </ScrollView>

        {/* View Toggle */}
        <View
          className={`flex-row ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"} mx-5 my-5 rounded-full p-1`}
        >
          <TouchableOpacity
            className={`flex-1 py-3 items-center rounded-full ${
              activeView === "Table View"
                ? theme === "dark"
                  ? "bg-gray-700"
                  : "bg-white shadow-sm"
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
                  : "bg-white shadow-sm"
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
              className={`flex-row px-5 py-3 border-b ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}
            >
              <View className="flex-1">
                <Text
                  className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} text-xs font-medium`}
                >
                  Name
                </Text>
              </View>
              <View className="flex-1">
                <Text
                  className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} text-xs font-medium`}
                >
                  Price
                </Text>
              </View>
              <View className="flex-1">
                <Text
                  className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} text-xs font-medium`}
                >
                  Change
                </Text>
              </View>
              <View className="flex-1">
                <Text
                  className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} text-xs font-medium`}
                >
                  Volume
                </Text>
              </View>
              <View className="flex-1">
                <Text
                  className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} text-xs font-medium`}
                >
                  Market Cap
                </Text>
              </View>
            </View>

            {/* Table Rows */}
            {stockData.map((stock, index) => renderTableRow(stock, index))}
          </>
        ) : (
          renderHeatmapView()
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
