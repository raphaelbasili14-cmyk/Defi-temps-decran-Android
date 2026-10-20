import { requireOptionalNativeModule } from 'expo';

type NativeUsageAccess = {
  hasUsageAccess: () => boolean;
  getTodayScreenTimeSeconds: () => Promise<number>;
};

export const nativeUsageAccess =
  requireOptionalNativeModule<NativeUsageAccess>('PauseActiveUsage');
