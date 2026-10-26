export const chatEndpoints = {
  messages: (room: string) => `/rooms/${encodeURIComponent(room)}/messages`,
  files: (room: string) => `/rooms/${encodeURIComponent(room)}/files`,
  file: (room: string, fileId: string) => `/rooms/${encodeURIComponent(room)}/files/${fileId}`,
  webrtcConfig: () => "/webrtc/config",
  callHistory: () => "/calls/history",
  groups: () => "/groups",
  group: (groupId: string) => `/groups/${groupId}`,
  groupAvatar: (groupId: string) => `/groups/${groupId}/avatar`,
  contacts: () => "/contacts",
} as const;

export const profileEndpoints = {
  status: () => "/profile/status",
} as const;

export const pushEndpoints = {
  tokens: () => "/push/tokens",
} as const;
