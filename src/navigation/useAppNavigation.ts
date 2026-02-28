import { useNavigation } from '@react-navigation/native';
import type { AppNavigationProp } from './types';

export type { AppNavigationProp };

const useAppNavigation = (): AppNavigationProp => {
  return useNavigation<AppNavigationProp>();
};

export default useAppNavigation;
