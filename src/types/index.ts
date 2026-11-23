export interface Message {
  id: string;
  conversationId: string;
  sender: 'outgoing' | 'incoming';
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  quotedText?: string;
}

export interface Conversation {
  id: string;
  contactName: string;
  avatar: string;
  lastMessage: string;
  updatedAt: string;
  unreadCount: number;
  isMuted: boolean;
  isChannel: boolean;
  customWallpaper?: string;
  lastSeen?: string;
  messages: Message[];
}

export type ViewMode = 'list' | 'conversation';

export interface TabBadges {
  all: string;
  personal: string;
  channel: string;
  group: string;
}

export interface AppState {
  conversations: Conversation[];
  activeConversationId: string | null;
  viewMode: ViewMode;
  screenshotMode: boolean;
  showDashboard: boolean;
  globalWallpaper?: string;
  showAd: boolean;
  tabBadges: TabBadges;
}
