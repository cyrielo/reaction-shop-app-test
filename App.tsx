/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, useColorScheme } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import RootNavigator from './src/navigation/';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from './src/requests/queryClient';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <AppContent />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  return (
    <RootNavigator />
  );
}
export default App;
