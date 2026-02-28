import { Dimensions, ScaledSize } from "react-native";
import { useCallback, useEffect, useState } from 'react';
import type { BreakPoint } from '../types/screen';

const useMediaQuery = () => {
  const windowDimension = Dimensions.get('window');
  const currentBreakPoint = getBreakPointFromWidth(windowDimension.width);

  const [breakpoint, setBreakPoint] = useState<BreakPoint>(currentBreakPoint ?? 'sm');

  const handler = useCallback(({ window }: { window: ScaledSize }) => {
    const { width } = window;
    setBreakPoint(bp => getBreakPointFromWidth(width) || bp );
  }, []);

  useEffect(() => {
    const dimensionListener = Dimensions.addEventListener('change', handler);
    return () => dimensionListener?.remove();
  });
  return { breakpoint }
};

const getBreakPointFromWidth = (width:number): BreakPoint|undefined => {
  if (width < 480) { return 'sm' }
  if (width < 768) { return 'md' }
  if (width < 1279) { return 'lg' }
  if (width > 1279) { return 'xlg' }
}
export default useMediaQuery;