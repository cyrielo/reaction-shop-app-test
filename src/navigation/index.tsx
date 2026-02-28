import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from '@react-native-community/blur';
import { Home, ShoppingCart } from 'lucide-react-native';
import type { RootTabParamList, CatalogStackParamList } from './types';
import CatalogScreen from '../screens/catalog/CatalogScreen';
import ProductDetailScreen from '../screens/product/ProductDetailScreen';
import CartScreen from '../screens/cart/CartScreen';

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

function CatalogNavigator(): React.ReactElement {
  return (
    <CatalogStack.Navigator initialRouteName="CatalogScreen">
      <CatalogStack.Screen
        name="CatalogScreen"
        component={CatalogScreen}
        options={{ title: 'Products' }}
      />
      <CatalogStack.Screen
        name="ProductDetailScreen"
        component={ProductDetailScreen}
        options={{ title: 'Product' }}
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
          tabBarBackground: GlassTabBackground,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#008060',
          tabBarInactiveTintColor: 'rgba(26,26,26,0.45)',
          tabBarLabelStyle: styles.tabLabel,
          tabBarItemStyle: styles.tabItem,
          // Reserve space below content for the floating tab bar:
          // bottom (24) + height (64) + breathing room (8) = 96
          sceneStyle: styles.scene,
        }}
      >
        <Tab.Screen
          name="Catalog"
          component={CatalogNavigator}
          options={{
            headerShown: false,
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
    // Subtle drop shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  tabItem: {
    paddingTop: 5,
  },
  scene: {
    paddingBottom: 96,
  },
});

export default RootNavigator;
