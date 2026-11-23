import React from 'react';
import type { Conversation, TabBadges } from '../types';
import { getAssetUrl } from '../utils/asset';
import '../styles/conversationList.css';

interface Props {
  conversations: Conversation[];
  onSelect: (id: string) => void;
  onCreateNew?: () => void;
  tabBadges?: TabBadges;
  showAd?: boolean;
  onDismissAd?: () => void;
}

const ConversationList: React.FC<Props> = ({
  conversations,
  onSelect,
  onCreateNew,
  tabBadges,
  showAd = true,
  onDismissAd,
}) => {
  return (
    <div className="conversation-list">
      {/* Header */}
      <div className="list-header">
        <img
          className="hamburger"
          src={getAssetUrl('/assets/icons/hamburger.svg')}
          alt="menu"
        />
        <span className="app-title">ایتا</span>
        <img
          className="eitaa-logo"
          src={getAssetUrl('/assets/icons/eitaa-logo.svg')}
          alt="eitaa"
        />
        <img
          className="search-icon"
          src={getAssetUrl('/assets/icons/search.svg')}
          alt="search"
        />
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        <img
          className="apps-icon"
          src={getAssetUrl('/assets/icons/apps-grid.svg')}
          alt="apps"
        />
        <div className="separator" />

        <div className="active-indicator" />

        <span className="tab tab-all">همه</span>
        {tabBadges?.all ? (
          <>
            <img
              className="unread-badge badge-all"
              src={getAssetUrl('/assets/icons/unread-badge-all.svg')}
              alt=""
            />
            <span className="unread-badge-text badge-all-text">{tabBadges.all}</span>
          </>
        ) : null}

        <span className="tab tab-personal active">شخصی</span>
        {tabBadges?.personal ? (
          <>
            <img
              className="unread-badge badge-personal"
              src={getAssetUrl('/assets/icons/unread-badge-channel.svg')}
              alt=""
            />
            <span className="unread-badge-text badge-personal-text">
              {tabBadges.personal}
            </span>
          </>
        ) : null}

        <span className="tab tab-channel">کانال</span>
        {tabBadges?.channel ? (
          <>
            <img
              className="unread-badge badge-channel"
              src={getAssetUrl('/assets/icons/unread-badge-channel.svg')}
              alt=""
            />
            <span className="unread-badge-text badge-channel-text">
              {tabBadges.channel}
            </span>
          </>
        ) : null}
      </div>

      {/* Ad Section */}
      {showAd && (
        <div className="ad-section">
          <img
            className="ad-image"
            src={getAssetUrl('/assets/images/ad-image.png')}
            alt="ad"
          />
          <span className="ad-title">تروریست واقعی کیه؟ 🔰</span>
          <span className="ad-subtitle">این فیلم را از دست نده 👇👇</span>
          <span
            className="ad-label"
            onClick={onDismissAd}
            style={{ cursor: onDismissAd ? 'pointer' : 'default' }}
            title={onDismissAd ? 'حذف این تبلیغ' : undefined}
          >
            تبلیغات {onDismissAd ? '✕' : ''}
          </span>
        </div>
      )}

      {/* Conversation Rows */}
      <div className="conversation-rows">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className="conversation-row"
            onClick={() => onSelect(conv.id)}
          >
            <img className="avatar" src={getAssetUrl(conv.avatar)} alt={conv.contactName} />
            <div className="title-area">
              {conv.isMuted && (
                <img
                  className="mute-icon"
                  src={getAssetUrl('/assets/icons/mute.svg')}
                  alt="muted"
                />
              )}
              <span
                className={`contact-name${/^[A-Za-z]/.test(conv.contactName) ? ' latin' : ''}`}
              >
                {conv.contactName}
              </span>
              {conv.isChannel && (
                <img
                  className="channel-badge"
                  src={getAssetUrl('/assets/icons/channel-badge.svg')}
                  alt="channel"
                />
              )}
            </div>
            <span className="last-message">{conv.lastMessage}</span>
            <span className="timestamp">{conv.updatedAt}</span>

            {conv.unreadCount > 0 ? (
              <div className="unread-badge">
                <span>{conv.unreadCount.toLocaleString('fa-IR')}</span>
              </div>
            ) : conv.messages.length > 0 &&
              conv.messages[conv.messages.length - 1].sender === 'outgoing' ? (
              <img
                className="read-check"
                src={getAssetUrl('/assets/icons/double-check-blue.svg')}
                alt="read"
              />
            ) : null}

            <div className="row-separator" />
          </div>
        ))}
      </div>

      {/* Floating Compose Button with pencil icon */}
      <div className="fab-compose" onClick={onCreateNew} title="ایجاد گفتگوی جدید">
        <svg viewBox="0 0 24 24">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
        </svg>
      </div>
    </div>
  );
};

export default ConversationList;
