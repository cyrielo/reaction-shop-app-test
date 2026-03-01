import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from '@react-native-community/blur';
import { Home, ShoppingCart } from 'lucide-react-native';
import type { RootTabParamList, CatalogStackParamList } from './types';
import CatalogScreen from '../screens/catalog/CatalogScreen';
import ProductDetailScreen from '../screens/product/ProductDetailScreen';
import CartScreen from '../screens/cart/CartScreen';
import { spacing, typography } from '../theme';

const CatalogStack = createNativeStackNavigator<CatalogStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

interface TabIconProps {
  color: string;
  size: number;
}

const HomeIcon = ({ color, size }: TabIconProps): React.ReactElement => (
  <Home color={color} size={size} />
);

const CartIcon = ({ color, size }: TabIconProps): React.ReactElement => (
  <ShoppingCart color={color} size={size} />
);

const GlassTabBackground = (): React.ReactElement => (
  <View style={styles.glassContainer} pointerEvents="none">
    <BlurView
      style={StyleSheet.absoluteFill}
      blurType="light"
      blurAmount={24}
      reducedTransparencyFallbackColor="rgba(255,255,255,0.85)"
    />
    <View style={styles.glassOverlay} />
  </View>
);

const AppHeader = (): React.ReactElement => (
  <Text style={styles.headerTitle} accessibilityRole="header">
    Reaction
  </Text>
);

function CatalogNavigator(): React.ReactElement {
  return (
    <CatalogStack.Navigator
      initialRouteName="CatalogScreen"
      screenOptions={{ headerShown: false }}
    >
      <CatalogStack.Screen name="CatalogScreen" component={CatalogScreen} />
      <CatalogStack.Screen
        name="ProductDetailScreen"
        component={ProductDetailScreen}
        options={{ headerShown: true, title: 'Product' }}
      />
    </CatalogStack.Navigator>
  );
}

const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Catalog"
        screenOptions={{
          headerLeft: AppHeader,
          headerTitle: 'Products',
          tabBarBackground: GlassTabBackground,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#008060',
          tabBarInactiveTintColor: 'rgba(26,26,26,0.45)',
          tabBarLabelStyle: styles.tabLabel,
          tabBarItemStyle: styles.tabItem,
          sceneStyle: styles.scene,
        }}
      >
        <Tab.Screen
          name="Catalog"
          component={CatalogNavigator}
          options={{
            title: 'Catalog',
            tabBarIcon: HomeIcon,
          }}
        />
        <Tab.Screen
          name="Cart"
          component={CartScreen}
          options={{
            title: 'Cart',
            tabBarIcon: CartIcon,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  headerTitle: {
    fontFamily: 'Pacifico-Regular',
    fontSize: 22,
    color: '#5a5a5a',
    letterSpacing: 0.5,
    marginHorizontal: spacing.md,
  },
  // Glass tab bar
  glassContainer: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  tabBar: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    height: 64,
    borderRadius: 28,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
  },
  tabLabel: {
    fontSize: typography.sizeMd,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  tabItem: {
    height: 64
  },
  scene: {
    paddingBottom: 96,
  },
});

export default RootNavigator;
