import { useState, useEffect, useCallback } from 'react';
import type { AppState, Conversation, Message, TabBadges } from '../types';
import { defaultConversations } from '../data/sampleData';

const STORAGE_KEY = 'eitaa-mockup-state-v5';

const toPersianDigits = (str: string): string =>
  str.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]);

export const getCurrentIranTime = (): string => {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('fa-IR', {
      timeZone: 'Asia/Tehran',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return formatter.format(now);
  } catch {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const iranDate = new Date(utc + 3.5 * 3600000);
    const h = iranDate.getHours().toString().padStart(2, '0');
    const m = iranDate.getMinutes().toString().padStart(2, '0');
    return toPersianDigits(`${h}:${m}`);
  }
};

const defaultTabBadges: TabBadges = {
  all: '۲',
  personal: '۱',
  channel: '۲',
  group: '',
};

const generateId = (): string =>
  `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function loadState(): AppState {
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const viewParam = params?.get('view') as 'list' | 'conversation' | null;
  const idParam = params?.get('id');
  const screenshotParam = params?.get('screenshot') === 'true';

  let initialConversations = defaultConversations();
  let initialGlobalWallpaper: string | undefined = undefined;
  let initialShowAd = true;
  let initialTabBadges = defaultTabBadges;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.conversations && Array.isArray(parsed.conversations)) {
        initialConversations = parsed.conversations;
      }
      if (parsed.globalWallpaper) {
        initialGlobalWallpaper = parsed.globalWallpaper;
      }
      if (typeof parsed.showAd === 'boolean') {
        initialShowAd = parsed.showAd;
      }
      if (parsed.tabBadges) {
        initialTabBadges = { ...defaultTabBadges, ...parsed.tabBadges };
      }
    }
  } catch {
    // ignore
  }

  const activeId = viewParam === 'conversation' ? (idParam || '6') : null;

  return {
    conversations: initialConversations,
    activeConversationId: activeId,
    viewMode: viewParam === 'conversation' ? 'conversation' : 'list',
    screenshotMode: screenshotParam,
    showDashboard: !screenshotParam,
    globalWallpaper: initialGlobalWallpaper,
    showAd: initialShowAd,
    tabBadges: initialTabBadges,
  };
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        conversations: state.conversations,
        globalWallpaper: state.globalWallpaper,
        showAd: state.showAd,
        tabBadges: state.tabBadges,
      })
    );
  } catch {
    // ignore
  }
}

export function useAppState() {
  const [state, setState] = useState<AppState>(loadState);

  // Persist state whenever it changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  const openConversation = useCallback((id: string) => {
    setState((prev) => {
      const next = {
        ...prev,
        activeConversationId: id,
        viewMode: 'conversation' as const,
      };
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('view', 'conversation');
        url.searchParams.set('id', id);
        window.history.replaceState({}, '', url.toString());
      }
      return next;
    });
  }, []);

  const goBack = useCallback(() => {
    setState((prev) => {
      const next = {
        ...prev,
        activeConversationId: null,
        viewMode: 'list' as const,
      };
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('view');
        url.searchParams.delete('id');
        window.history.replaceState({}, '', url.toString());
      }
      return next;
    });
  }, []);

  const sendMessage = useCallback(
    (conversationId: string, text: string, customTime?: string) => {
      if (!text.trim()) return;
      const now = customTime?.trim()
        ? toPersianDigits(customTime.trim())
        : getCurrentIranTime();
      const newMsg: Message = {
        id: generateId(),
        conversationId,
        sender: 'outgoing',
        text: text.trim(),
        timestamp: now,
        status: 'read',
      };
      setState((prev) => {
        const conversations = prev.conversations.map((c) => {
          if (c.id !== conversationId) return c;
          return {
            ...c,
            messages: [...c.messages, newMsg],
            lastMessage:
              text.trim().length > 30 ? text.trim().slice(0, 30) + '...' : text.trim(),
            updatedAt: now,
          };
        });
        // Move updated conversation to top
        const idx = conversations.findIndex((c) => c.id === conversationId);
        if (idx > 0) {
          const [conv] = conversations.splice(idx, 1);
          conversations.unshift(conv);
        }
        return { ...prev, conversations };
      });
    },
    []
  );

  const simulateIncoming = useCallback(
    (conversationId: string, text: string, customTime?: string) => {
      if (!text.trim()) return;
      const now = customTime?.trim()
        ? toPersianDigits(customTime.trim())
        : getCurrentIranTime();
      const newMsg: Message = {
        id: generateId(),
        conversationId,
        sender: 'incoming',
        text: text.trim(),
        timestamp: now,
        status: 'read',
      };
      setState((prev) => {
        const conversations = prev.conversations.map((c) => {
          if (c.id !== conversationId) return c;
          return {
            ...c,
            messages: [...c.messages, newMsg],
            lastMessage:
              text.trim().length > 30
                ? text.trim().slice(0, 30) + '...'
                : text.trim(),
            updatedAt: now,
            unreadCount:
              prev.activeConversationId === conversationId
                ? c.unreadCount
                : c.unreadCount + 1,
          };
        });
        const idx = conversations.findIndex((c) => c.id === conversationId);
        if (idx > 0) {
          const [conv] = conversations.splice(idx, 1);
          conversations.unshift(conv);
        }
        return { ...prev, conversations };
      });
    },
    []
  );

  const clearAllConversations = useCallback(() => {
    setState((prev) => ({
      ...prev,
      conversations: [],
      activeConversationId: null,
      viewMode: 'list' as const,
    }));
  }, []);

  const toggleShowAd = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showAd: !prev.showAd,
    }));
  }, []);

  const updateTabBadge = useCallback((tab: keyof TabBadges, value: string) => {
    setState((prev) => ({
      ...prev,
      tabBadges: {
        ...prev.tabBadges,
        [tab]: value.trim() ? toPersianDigits(value.trim()) : '',
      },
    }));
  }, []);

  const updateUnreadCount = useCallback((id: string, count: number) => {
    setState((prev) => ({
      ...prev,
      conversations: prev.conversations.map((c) =>
        c.id === id ? { ...c, unreadCount: Math.max(0, count) } : c
      ),
    }));
  }, []);

  const updateTimestamp = useCallback((id: string, time: string) => {
    setState((prev) => ({
      ...prev,
      conversations: prev.conversations.map((c) =>
        c.id === id ? { ...c, updatedAt: toPersianDigits(time) } : c
      ),
    }));
  }, []);

  const resetData = useCallback(() => {
    setState((prev) => ({
      ...prev,
      conversations: defaultConversations(),
      activeConversationId: null,
      viewMode: 'list' as const,
    }));
  }, []);

  const toggleScreenshotMode = useCallback(() => {
    setState((prev) => ({
      ...prev,
      screenshotMode: !prev.screenshotMode,
    }));
  }, []);

  const toggleDashboard = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showDashboard: !prev.showDashboard,
    }));
  }, []);

  const updateConversation = useCallback(
    (id: string, updates: Partial<Conversation>) => {
      setState((prev) => ({
        ...prev,
        conversations: prev.conversations.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        ),
      }));
    },
    []
  );

  const addConversation = useCallback(
    (data: {
      contactName: string;
      avatar?: string;
      isChannel?: boolean;
      isMuted?: boolean;
      initialMessage?: string;
      customWallpaper?: string;
    }) => {
      const now = getCurrentIranTime();
      const newId = `conv-${Date.now()}`;
      const defaultAvatar = '/assets/images/avatar-timah.png';

      const initialText = data.initialMessage?.trim() || 'سلام!';
      const newConv: Conversation = {
        id: newId,
        contactName: data.contactName.trim() || 'کاربر جدید',
        avatar: data.avatar || defaultAvatar,
        lastMessage: initialText,
        updatedAt: now,
        unreadCount: 0,
        isMuted: !!data.isMuted,
        isChannel: !!data.isChannel,
        customWallpaper: data.customWallpaper,
        lastSeen: 'آخرین بازدید به تازگی',
        messages: [
          {
            id: generateId(),
            conversationId: newId,
            sender: 'incoming',
            text: initialText,
            timestamp: now,
            status: 'read',
          },
        ],
      };

      setState((prev) => ({
        ...prev,
        conversations: [newConv, ...prev.conversations],
      }));

      return newId;
    },
    []
  );

  const deleteConversation = useCallback((id: string) => {
    setState((prev) => {
      const remaining = prev.conversations.filter((c) => c.id !== id);
      const isDeletingActive = prev.activeConversationId === id;
      if (typeof window !== 'undefined' && isDeletingActive) {
        const url = new URL(window.location.href);
        url.searchParams.delete('view');
        url.searchParams.delete('id');
        window.history.replaceState({}, '', url.toString());
      }
      return {
        ...prev,
        conversations: remaining,
        activeConversationId: isDeletingActive ? null : prev.activeConversationId,
        viewMode: isDeletingActive ? 'list' : prev.viewMode,
      };
    });
  }, []);

  const updateWallpaper = useCallback((conversationId: string | null, wallpaper: string) => {
    setState((prev) => {
      if (conversationId) {
        return {
          ...prev,
          conversations: prev.conversations.map((c) =>
            c.id === conversationId ? { ...c, customWallpaper: wallpaper } : c
          ),
        };
      } else {
        // Global wallpaper
        return {
          ...prev,
          globalWallpaper: wallpaper,
          conversations: prev.conversations.map((c) => ({
            ...c,
            customWallpaper: wallpaper,
          })),
        };
      }
    });
  }, []);

  const updateAvatar = useCallback((conversationId: string, avatarUrl: string) => {
    setState((prev) => ({
      ...prev,
      conversations: prev.conversations.map((c) =>
        c.id === conversationId ? { ...c, avatar: avatarUrl } : c
      ),
    }));
  }, []);

  const activeConversation =
    state.conversations.find((c) => c.id === state.activeConversationId) ||
    state.conversations[0] ||
    (state.viewMode === 'conversation'
      ? {
          id: 'temp',
          contactName: 'مخاطب',
          avatar: '/assets/images/avatar-timah.png',
          lastMessage: '',
          updatedAt: getCurrentIranTime(),
          unreadCount: 0,
          isMuted: false,
          isChannel: false,
          messages: [
            {
              id: 'm-temp',
              conversationId: 'temp',
              sender: 'incoming' as const,
              text: 'سلام! پیام خود را بنویسید.',
              timestamp: getCurrentIranTime(),
              status: 'read' as const,
            },
          ],
        }
      : null);

  return {
    state,
    activeConversation,
    openConversation,
    goBack,
    sendMessage,
    simulateIncoming,
    resetData,
    toggleScreenshotMode,
    toggleDashboard,
    updateConversation,
    addConversation,
    deleteConversation,
    clearAllConversations,
    updateWallpaper,
    updateAvatar,
    toggleShowAd,
    updateTabBadge,
    updateUnreadCount,
    updateTimestamp,
  };
}
