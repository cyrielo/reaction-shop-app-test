import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';

export type RootTabParamList = {
  Catalog: undefined;
  Cart: undefined;
};

export type CatalogStackParamList = {
  CatalogScreen: undefined;
  ProductDetailScreen: { productId: string };
};

/**
 * AppNavigationProp gives screens full access to both the catalog stack
 * and the root tab navigator (for switching tabs).
 */
export type AppNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<CatalogStackParamList>,
  BottomTabNavigationProp<RootTabParamList>
>;
