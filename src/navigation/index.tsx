import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import CatalogScreen from '../screens/catalog/CatalogScreen';
import ProductDetailScreen from '../screens/product/ProductDetailScreen';
import CartScreen from '../screens/cart/CartScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="CatalogScreen">
        <Stack.Screen
          name="CatalogScreen"
          component={CatalogScreen}
          />
        <Stack.Screen
          name="ProductDetailScreen"
          component={ProductDetailScreen}
        />
        <Stack.Screen name="CartScreen" component={CartScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export default RootNavigator;