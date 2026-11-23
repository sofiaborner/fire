import React, { useState } from 'react';
import type { Conversation, AppState, TabBadges } from '../types';
import { getCurrentIranTime } from '../hooks/useAppState';

interface Props {
  state: AppState;
  onSelectConversation: (id: string) => void;
  onGoBack: () => void;
  onSendMessage: (conversationId: string, text: string, customTime?: string) => void;
  onSimulateIncoming: (conversationId: string, text: string, customTime?: string) => void;
  onReset: () => void;
  onToggleScreenshot: () => void;
  onUpdateConversation: (id: string, updates: Partial<Conversation>) => void;
  onAddConversation: (data: {
    contactName: string;
    avatar?: string;
    isChannel?: boolean;
    isMuted?: boolean;
    initialMessage?: string;
    customWallpaper?: string;
  }) => string;
  onDeleteConversation: (id: string) => void;
  onClearAllConversations: () => void;
  onUpdateWallpaper: (conversationId: string | null, wallpaper: string) => void;
  onUpdateAvatar: (conversationId: string, avatarUrl: string) => void;
  onToggleShowAd: () => void;
  onUpdateTabBadge: (tab: keyof TabBadges, value: string) => void;
  onUpdateUnreadCount: (conversationId: string, count: number) => void;
  onUpdateTimestamp: (conversationId: string, time: string) => void;
}

const PRESET_WALLPAPERS = [
  {
    name: 'بنفش ایتا (اصلی)',
    value:
      'linear-gradient(180deg, rgb(168, 173, 211) 0%, rgb(183, 188, 217) 12%, rgb(190, 194, 215) 25%, rgb(180, 184, 206) 40%, rgb(155, 158, 173) 55%, rgb(110, 113, 123) 70%, rgb(55, 56, 61) 85%, rgb(10, 10, 10) 100%)',
  },
  {
    name: 'آبی تلگرام',
    value: 'linear-gradient(180deg, #8ea7c5 0%, #b8c8dd 40%, #c8d7ea 100%)',
  },
  {
    name: 'حالت شب (تیره)',
    value: 'linear-gradient(180deg, #1f2229 0%, #15171c 50%, #0d0e11 100%)',
  },
  {
    name: 'سبز زمردی',
    value: 'linear-gradient(180deg, #1b3d36 0%, #29534a 50%, #152e29 100%)',
  },
  {
    name: 'غروب گرم',
    value: 'linear-gradient(180deg, #5c3852 0%, #87576a 45%, #b57a79 100%)',
  },
  {
    name: 'سفید مینیمال',
    value: '#f5f7fb',
  },
];

const PRESET_AVATARS = [
  { name: 'تیماه', path: '/assets/images/avatar-timah.png' },
];

const Dashboard: React.FC<Props> = ({
  state,
  onSelectConversation,
  onGoBack,
  onSendMessage,
  onSimulateIncoming,
  onReset,
  onToggleScreenshot,
  onUpdateConversation,
  onAddConversation,
  onDeleteConversation,
  onClearAllConversations,
  onUpdateWallpaper,
  onUpdateAvatar,
  onToggleShowAd,
  onUpdateTabBadge,
  onUpdateUnreadCount,
  onUpdateTimestamp,
}) => {
  const [outgoingText, setOutgoingText] = useState('');
  const [incomingText, setIncomingText] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [selectedConvId, setSelectedConvId] = useState(
    state.activeConversationId || state.conversations[0]?.id || ''
  );

  // New Chat Form State
  const [newChatName, setNewChatName] = useState('');
  const [newChatAvatar, setNewChatAvatar] = useState('/assets/images/avatar-timah.png');
  const [newChatIsChannel, setNewChatIsChannel] = useState(false);
  const [newChatIsMuted, setNewChatIsMuted] = useState(false);
  const [newChatInitialMsg, setNewChatInitialMsg] = useState('سلام!');

  // Custom Wallpaper State
  const [customWallpaperInput, setCustomWallpaperInput] = useState('');

  // Contact Rename State
  const [editName, setEditName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const currentConv = state.conversations.find((c) => c.id === selectedConvId) || state.conversations[0];

  const handleSend = () => {
    if (!outgoingText.trim() || !selectedConvId) return;
    onSendMessage(selectedConvId, outgoingText, customTime || undefined);
    setOutgoingText('');
  };

  const handleSimulate = () => {
    if (!incomingText.trim() || !selectedConvId) return;
    onSimulateIncoming(selectedConvId, incomingText, customTime || undefined);
    setIncomingText('');
  };

  const handleCreateChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatName.trim()) return;
    const newId = onAddConversation({
      contactName: newChatName.trim(),
      avatar: newChatAvatar,
      isChannel: newChatIsChannel,
      isMuted: newChatIsMuted,
      initialMessage: newChatInitialMsg,
    });
    setNewChatName('');
    setSelectedConvId(newId);
    onSelectConversation(newId);
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'selected' | 'new') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        if (target === 'selected' && selectedConvId) {
          onUpdateAvatar(selectedConvId, dataUrl);
        } else {
          setNewChatAvatar(dataUrl);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleWallpaperFileUpload = (e: React.ChangeEvent<HTMLInputElement>, applyToAll: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onUpdateWallpaper(applyToAll ? null : selectedConvId, dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="dashboard-panel">
      <h2>
        <span>پنل تنظیمات و ویرایش ایتا</span>
      </h2>

      {/* Navigation & Preview Mode */}
      <div className="section">
        <h3>ناوبری و نما</h3>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={onGoBack} style={{ flex: 1 }}>
            فهرست گفتگوها
          </button>
          <button
            className="primary"
            onClick={onToggleScreenshot}
            style={{ flex: 1 }}
          >
            {state.screenshotMode ? 'خروج از اسکرین‌شات' : 'حالت اسکرین‌شات'}
          </button>
        </div>
      </div>

      {/* Active Conversation Picker & Delete */}
      <div className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>گفتگوها ({state.conversations.length})</h3>
          {state.conversations.length > 0 && (
            <button
              className="small-danger"
              style={{ width: 'auto', marginBottom: 4 }}
              onClick={() => {
                if (confirm('آیا از حذف تمام چت‌ها مطمئن هستید؟')) {
                  onClearAllConversations();
                }
              }}
            >
              پاک کردن همه
            </button>
          )}
        </div>
        <div style={{ maxHeight: '160px', overflowY: 'auto', marginBottom: 8 }}>
          {state.conversations.map((conv) => (
            <div
              key={conv.id}
              className={`conv-list-item${selectedConvId === conv.id ? ' active' : ''}`}
              onClick={() => {
                setSelectedConvId(conv.id);
                if (state.viewMode === 'conversation') {
                  onSelectConversation(conv.id);
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                <img
                  src={conv.avatar}
                  alt=""
                  style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }}
                />
                <span
                  style={{
                    direction: 'rtl',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: 150,
                    fontSize: 12,
                  }}
                >
                  {conv.contactName}
                </span>
                {conv.unreadCount > 0 && (
                  <span
                    style={{
                      background: '#c4c8ca',
                      color: 'white',
                      borderRadius: 10,
                      padding: '1px 6px',
                      fontSize: 10,
                    }}
                  >
                    {conv.unreadCount}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  style={{ width: 'auto', padding: '2px 6px', margin: 0, fontSize: 11 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedConvId(conv.id);
                    onSelectConversation(conv.id);
                  }}
                >
                  باز کردن
                </button>
                <button
                  className="small-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`آیا از حذف چت "${conv.contactName}" مطمئن هستید؟`)) {
                      onDeleteConversation(conv.id);
                    }
                  }}
                  title="حذف چت"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          {state.conversations.length === 0 && (
            <div style={{ color: '#888', textAlign: 'center', padding: '12px 0' }}>
              هیچ گفتگویی وجود ندارد. از بخش زیر گفتگوی جدید بسازید.
            </div>
          )}
        </div>
      </div>

      {/* Unread Count & Timestamp for Selected Chat */}
      {currentConv && (
        <div className="section">
          <h3>دایره پیام‌های خوانده‌نشده و ساعت ({currentConv.contactName})</h3>
          <div style={{ marginBottom: 6, fontSize: 11, color: '#aaa' }}>
            تعداد پیام‌های خوانده‌نشده (دایره خاکستری زیر ساعت):
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <input
              type="number"
              min={0}
              value={currentConv.unreadCount}
              onChange={(e) => onUpdateUnreadCount(selectedConvId, parseInt(e.target.value) || 0)}
              style={{ width: 80, margin: 0 }}
            />
            <button
              style={{ width: 'auto', margin: 0, padding: '4px 8px' }}
              onClick={() => onUpdateUnreadCount(selectedConvId, 0)}
            >
              صفر (پنهان)
            </button>
            <button
              style={{ width: 'auto', margin: 0, padding: '4px 8px' }}
              onClick={() => onUpdateUnreadCount(selectedConvId, (currentConv.unreadCount || 0) + 1)}
            >
              +۱
            </button>
            <button
              style={{ width: 'auto', margin: 0, padding: '4px 8px' }}
              onClick={() => onUpdateUnreadCount(selectedConvId, (currentConv.unreadCount || 0) + 5)}
            >
              +۵
            </button>
          </div>

          <div style={{ marginBottom: 4, fontSize: 11, color: '#aaa' }}>
            ساعت آخرین پیام در لیست گفتگوها:
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type="text"
              placeholder="مثلاً ۱۲:۴۹ یا ۲۰:۱۵"
              value={currentConv.updatedAt}
              onChange={(e) => onUpdateTimestamp(selectedConvId, e.target.value)}
              style={{ margin: 0, direction: 'ltr', flex: 1 }}
            />
            <button
              style={{ width: 'auto', margin: 0, whiteSpace: 'nowrap' }}
              onClick={() => onUpdateTimestamp(selectedConvId, getCurrentIranTime())}
            >
              ساعت الان ایران
            </button>
          </div>
        </div>
      )}

      {/* Category Tab Badges */}
      <div className="section">
        <h3>نشان پیام‌های خوانده‌نشده تب‌های بالا</h3>
        <div style={{ fontSize: 11, color: '#aaa', marginBottom: 8 }}>
          عدد نشان هر دسته در بالای صفحه (خالی = بدون نشان):
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          <div>
            <label style={{ fontSize: 11, color: '#ddd' }}>همه:</label>
            <input
              type="text"
              value={state.tabBadges.all}
              onChange={(e) => onUpdateTabBadge('all', e.target.value)}
              placeholder="مثلاً ۲"
              style={{ margin: '2px 0 0 0', direction: 'rtl' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#ddd' }}>شخصی:</label>
            <input
              type="text"
              value={state.tabBadges.personal}
              onChange={(e) => onUpdateTabBadge('personal', e.target.value)}
              placeholder="مثلاً ۱"
              style={{ margin: '2px 0 0 0', direction: 'rtl' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#ddd' }}>کانال:</label>
            <input
              type="text"
              value={state.tabBadges.channel}
              onChange={(e) => onUpdateTabBadge('channel', e.target.value)}
              placeholder="مثلاً ۲"
              style={{ margin: '2px 0 0 0', direction: 'rtl' }}
            />
          </div>
        </div>
      </div>

      {/* Advertisement Control */}
      <div className="section">
        <h3>بخش تبلیغات</h3>
        <button
          style={{
            background: state.showAd ? '#552222' : '#225533',
            borderColor: state.showAd ? '#883333' : '#338844',
            color: 'white',
          }}
          onClick={onToggleShowAd}
        >
          {state.showAd ? 'حذف و مخفی کردن کادر تبلیغات' : 'نمایش مجدد کادر تبلیغات'}
        </button>
      </div>

      {/* Change Background / Wallpaper */}
      <div className="section">
        <h3>پس‌زمینه چت</h3>
        <div style={{ color: '#aaa', fontSize: 11, marginBottom: 6 }}>
          انتخاب پس‌زمینه برای چت فعال ({currentConv?.contactName || 'بدون چت'}):
        </div>
        <div className="preset-grid">
          {PRESET_WALLPAPERS.map((p) => (
            <button
              key={p.name}
              className="preset-btn"
              onClick={() => onUpdateWallpaper(selectedConvId || null, p.value)}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Custom wallpaper file or url */}
        <div className="file-input-wrapper">
          <label className="file-btn">
            بارگذاری تصویر پس‌زمینه از کامپیوتر
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleWallpaperFileUpload(e, false)}
            />
          </label>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          <input
            type="text"
            placeholder="آدرس تصویر یا گرادیان..."
            value={customWallpaperInput}
            onChange={(e) => setCustomWallpaperInput(e.target.value)}
            style={{ margin: 0, fontSize: 12 }}
          />
          <button
            style={{ width: 'auto', whiteSpace: 'nowrap', margin: 0 }}
            onClick={() => {
              if (customWallpaperInput.trim()) {
                onUpdateWallpaper(selectedConvId || null, customWallpaperInput.trim());
                setCustomWallpaperInput('');
              }
            }}
          >
            اعمال
          </button>
        </div>

        <button
          style={{ marginTop: 8, fontSize: 11, background: '#2e3a4e', borderColor: '#4a5d7c' }}
          onClick={() => {
            if (currentConv?.customWallpaper) {
              onUpdateWallpaper(null, currentConv.customWallpaper);
            }
          }}
        >
          اعمال همین پس‌زمینه برای همه چت‌ها
        </button>
      </div>

      {/* Change Profile Picture / Avatar */}
      {currentConv && (
        <div className="section">
          <h3>عکس پروفایل "{currentConv.contactName}"</h3>
          <div className="avatar-preview-row">
            <img src={currentConv.avatar} alt="Current" className="avatar-thumb" />
            <div style={{ flex: 1 }}>
              <label className="file-btn" style={{ margin: 0 }}>
                انتخاب عکس از سیستم
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleAvatarFileUpload(e, 'selected')}
                />
              </label>
            </div>
          </div>

          <div style={{ fontSize: 11, color: '#aaa', margin: '4px 0 6px' }}>تصاویر آماده:</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {PRESET_AVATARS.map((av) => (
              <img
                key={av.name}
                src={av.path}
                alt={av.name}
                title={av.name}
                onClick={() => onUpdateAvatar(selectedConvId, av.path)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  border: currentConv.avatar === av.path ? '2px solid #3b82f6' : '1px solid #555',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Create New Chat */}
      <div className="section">
        <h3>ایجاد چت جدید</h3>
        <form onSubmit={handleCreateChat}>
          <input
            type="text"
            placeholder="نام مخاطب یا کانال..."
            value={newChatName}
            onChange={(e) => setNewChatName(e.target.value)}
            style={{ direction: 'rtl' }}
            required
          />
          <input
            type="text"
            placeholder="پیام اولیه..."
            value={newChatInitialMsg}
            onChange={(e) => setNewChatInitialMsg(e.target.value)}
            style={{ direction: 'rtl' }}
          />

          <div className="toggle-row">
            <label>نوع گفتگو:</label>
            <select
              value={newChatIsChannel ? 'channel' : 'pv'}
              onChange={(e) => setNewChatIsChannel(e.target.value === 'channel')}
              style={{ width: 'auto', marginBottom: 0 }}
            >
              <option value="pv">شخصی</option>
              <option value="channel">کانال</option>
            </select>
          </div>

          <div className="toggle-row">
            <label>حالت بی‌صدا:</label>
            <input
              type="checkbox"
              checked={newChatIsMuted}
              onChange={(e) => setNewChatIsMuted(e.target.checked)}
            />
          </div>

          <div style={{ margin: '8px 0 4px', fontSize: 11 }}>عکس پروفایل چت جدید:</div>
          <div className="avatar-preview-row">
            <img src={newChatAvatar} alt="New Avatar" className="avatar-thumb" />
            <label className="file-btn" style={{ margin: 0, flex: 1 }}>
              بارگذاری عکس دلخواه
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleAvatarFileUpload(e, 'new')}
              />
            </label>
          </div>

          <button type="submit" className="primary" style={{ marginTop: 8 }}>
            ایجاد و باز کردن چت
          </button>
        </form>
      </div>

      {/* Send & Simulate Messages with Exact Timestamp */}
      {currentConv && (
        <div className="section">
          <h3>ارسال پیام با ساعت دقیق</h3>
          <div style={{ marginBottom: 6, fontSize: 11, color: '#aaa' }}>
            چت انتخاب شده: <strong>{currentConv.contactName}</strong>
          </div>

          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
            <input
              type="text"
              placeholder={`ساعت پیام (پیش‌فرض: ${getCurrentIranTime()})`}
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              style={{ margin: 0, direction: 'ltr', fontSize: 12, flex: 1 }}
            />
            <button
              style={{ width: 'auto', margin: 0, padding: '4px 8px', fontSize: 11 }}
              onClick={() => setCustomTime(getCurrentIranTime())}
            >
              ساعت الان ایران
            </button>
          </div>

          <textarea
            value={outgoingText}
            onChange={(e) => setOutgoingText(e.target.value)}
            placeholder="ارسال پیام خروجی..."
            style={{ direction: 'rtl' }}
          />
          <button className="primary" onClick={handleSend}>
            ارسال به عنوان پیام من (Outgoing)
          </button>

          <textarea
            value={incomingText}
            onChange={(e) => setIncomingText(e.target.value)}
            placeholder="شبیه‌سازی پیام دریافتی از مخاطب..."
            style={{ direction: 'rtl', marginTop: 6 }}
          />
          <button
            style={{ background: '#059669', borderColor: '#10b981', color: 'white' }}
            onClick={handleSimulate}
          >
            شبیه‌سازی پیام دریافتی (Incoming)
          </button>
        </div>
      )}

      {/* Edit Contact Names */}
      {currentConv && (
        <div className="section">
          <h3>تغییر نام مخاطب</h3>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {editingId === selectedConvId ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{ flex: 1, margin: 0, direction: 'rtl' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (editName.trim()) {
                        onUpdateConversation(selectedConvId, { contactName: editName.trim() });
                      }
                      setEditingId(null);
                    }
                  }}
                />
                <button
                  style={{ width: 'auto', margin: 0 }}
                  onClick={() => {
                    if (editName.trim()) {
                      onUpdateConversation(selectedConvId, { contactName: editName.trim() });
                    }
                    setEditingId(null);
                  }}
                >
                  تایید
                </button>
              </>
            ) : (
              <>
                <span style={{ flex: 1, direction: 'rtl', fontWeight: 'bold' }}>
                  {currentConv.contactName}
                </span>
                <button
                  style={{ width: 'auto', margin: 0 }}
                  onClick={() => {
                    setEditingId(selectedConvId);
                    setEditName(currentConv.contactName || '');
                  }}
                >
                  تغییر نام
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Reset */}
      <div className="section">
        <h3>بازنشانی</h3>
        <button className="danger" onClick={onReset}>
          خالی کردن داده‌ها و شروع مجدد
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
