// Which browser origins an API accepts
export type OriginConfig = {
  // Explicit CORS_ORIGIN entries
  corsOrigin: string[];
  // Also accept any localhost / LAN origin (dev)
  allowLanOrigins: boolean;
  // Sent as the Origin by the mobile app, since native requests have none
  mobileAppOrigin: string;
};

// localhost, loopback, private ranges and mDNS (*.local) hostnames
const PRIVATE_HOSTNAME =
  /^(localhost|127(\.\d{1,3}){3}|10(\.\d{1,3}){3}|192\.168(\.\d{1,3}){2}|172\.(1[6-9]|2\d|3[01])(\.\d{1,3}){2}|[\w-]+\.local)$/;

const isPrivateNetworkOrigin = (origin: string): boolean => {
  try {
    return PRIVATE_HOSTNAME.test(new URL(origin).hostname);
  } catch {
    return false;
  }
};

export const isAllowedOrigin = (config: OriginConfig, origin: string): boolean =>
  origin === config.mobileAppOrigin ||
  config.corsOrigin.includes(origin) ||
  (config.allowLanOrigins && isPrivateNetworkOrigin(origin));

// Origin callback for `cors` (HTTP and Socket.IO); requests without an Origin header are allowed
export const corsOriginCallback =
  (config: OriginConfig) => (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) =>
    callback(null, !origin || isAllowedOrigin(config, origin));
