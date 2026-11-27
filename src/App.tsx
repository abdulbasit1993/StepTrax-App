import React from 'react';
import { StatusBar, View } from 'react-native';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  Theme,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { HomeIcon, HistoryIcon, SettingsIcon } from './components/Icons';
import { useStepCounter } from './hooks/useStepCounter';
import HomeScreen from './screens/HomeScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';
import { ThemeProvider, useTheme } from './theme/ThemeContext';

type RootTabParamList = {
  Home: undefined;
  History: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

function Shell() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  // The counter lives here so counting continues while Settings is open.
  const counter = useStepCounter();

  const navTheme: Theme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      primary: colors.trail,
      background: colors.fog,
      card: colors.card,
      text: colors.ink,
      border: colors.line,
    },
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.fog, paddingTop: insets.top }}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <NavigationContainer theme={navTheme}>
        <Tab.Navigator
          // Android back from Settings goes to Home (the default 'firstRoute' behaviour).
          screenOptions={{
            headerShown: false,
            sceneStyle: { backgroundColor: colors.fog },
            tabBarActiveTintColor: colors.trail,
            tabBarInactiveTintColor: colors.muted,
            tabBarStyle: {
              backgroundColor: colors.card,
              borderTopColor: colors.line,
            },
            tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
          }}
        >
          <Tab.Screen
            name="Home"
            options={{
              tabBarIcon: ({ color, size }) => (
                <HomeIcon color={color} size={size} />
              ),
            }}
          >
            {() => <HomeScreen counter={counter} />}
          </Tab.Screen>
          <Tab.Screen
            name="History"
            options={{
              tabBarIcon: ({ color, size }) => (
                <HistoryIcon color={color} size={size} />
              ),
            }}
          >
            {() => (
              <HistoryScreen
                dailyHistory={counter.dailyHistory}
                sessions={counter.sessions}
              />
            )}
          </Tab.Screen>
          <Tab.Screen
            name="Settings"
            options={{
              tabBarIcon: ({ color, size }) => (
                <SettingsIcon color={color} size={size} />
              ),
            }}
          >
            {() => <SettingsScreen source={counter.source} />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Shell />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
