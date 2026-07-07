/**
 * Compile-time feature flags. Flip a flag to hide a module without deleting
 * code. For per-environment flags, read from `process.env.NEXT_PUBLIC_*`
 * instead of a literal, e.g.:
 *   dashboardCharts: process.env.NEXT_PUBLIC_FEATURE_CHARTS !== "false"
 */
export const features = {
  dashboardCharts: true,
  usersTable: true,
  permissionDemo: true,
} as const;

export type FeatureFlag = keyof typeof features;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return features[flag];
}
