import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabHeaderProps } from '@react-navigation/bottom-tabs';
import { BlurView } from '@react-native-community/blur';
import { Home, ShoppingCart, ChevronLeft } from 'lucide-react-native';
import type { RootTabParamList, CatalogStackParamList } from './types';
import CatalogScreen from '../screens/catalog/CatalogScreen';
import ProductDetailScreen from '../screens/product/ProductDetailScreen';
import CartScreen from '../screens/cart/CartScreen';
import { colors, spacing, typography } from '../theme';
import { useCartStore } from '../store/cartStore';
// Root ref — can dispatch actions to any focused navigator in the tree
const navigationRef = createNavigationContainerRef();

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

const AppHeader = ({ navigation }: BottomTabHeaderProps): React.ReactElement => {
  const state = navigation.getState();
  const catalogTab = state.routes.find(r => r.name === 'Catalog');
  const canGoBack = (catalogTab?.state?.index ?? 0) > 0;
  return (
    <Pressable
      disabled={!canGoBack}
      onPress={() => navigationRef.isReady() && navigationRef.goBack()}
      style={({ pressed }) => [styles.header, pressed && styles.backBtnPressed]}
    >
      {canGoBack && (
        <View
          style={styles.backBtn}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ChevronLeft color={colors.text} size={24} />
        </View>
      )}
      <Text style={styles.headerTitle} accessibilityRole="header">
        Reaction
      </Text>
    </Pressable>
  );
};

function CatalogNavigator(): React.ReactElement {
  return (
    <CatalogStack.Navigator
      initialRouteName="CatalogScreen"
      screenOptions={{ headerShown: false }}
    >
      <CatalogStack.Screen
        name="CatalogScreen"
        component={CatalogScreen}
        options={{ headerShown: false }}
      />
      <CatalogStack.Screen
        name="ProductDetailScreen"
        component={ProductDetailScreen}
        options={{ headerShown: false, gestureEnabled: true }}
      />
    </CatalogStack.Navigator>
  );
}

const RootNavigator: React.FC = () => {
  const { totalItemCount } = useCartStore();
  const cartItems = totalItemCount() || undefined;
  return (
    <NavigationContainer ref={navigationRef}>
      <Tab.Navigator
        initialRouteName="Catalog"
        screenOptions={{
          header: AppHeader,
          tabBarBackground: GlassTabBackground,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: colors.primary,
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
            title: 'Shop',
            tabBarIcon: HomeIcon,
          }}
        />
        <Tab.Screen
          name="Cart"
          component={CartScreen}
          options={{
            title: 'Cart',
            tabBarIcon: CartIcon,
            tabBarBadge: cartItems,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  // Persistent app header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: 56,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  headerTitle: {
    fontFamily: 'Pacifico-Regular',
    fontSize: 28,
    color: '#5a5a5a',
    letterSpacing: 1.2,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnPressed: {
    opacity: 0.5,
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
    height: 64,
  },
  scene: {
    paddingBottom: 96,
  },
});

export default RootNavigator;
