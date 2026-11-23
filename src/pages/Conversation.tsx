import React, { useState, useRef, useEffect } from 'react';
import type { Conversation as ConvType, Message } from '../types';
import { getAssetUrl } from '../utils/asset';
import '../styles/conversation.css';

interface Props {
  conversation: ConvType;
  onBack: () => void;
  onSend: (conversationId: string, text: string) => void;
}

const isEmail = (text: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.trim());

const MessageBubble: React.FC<{ msg: Message }> = ({ msg }) => {
  const isOutgoing = msg.sender === 'outgoing';
  return (
    <div className={`message-bubble ${msg.sender}`}>
      {/* Bubble tail */}
      <img
        className="bubble-tail"
        src={getAssetUrl(
          isOutgoing
            ? '/assets/icons/bubble-tail-outgoing.svg'
            : '/assets/icons/bubble-tail-incoming.svg'
        )}
        alt=""
      />
      {/* Quoted text */}
      {msg.quotedText && (
        <div className="quote-container">
          <div className="quote-bar" />
          <div className="quote-text">{msg.quotedText}</div>
        </div>
      )}
      {/* Message text */}
      <div className={`message-text${isEmail(msg.text) ? ' email-text' : ''}`}>
        {msg.text}
      </div>
      {/* Meta: time + check */}
      <div className="message-meta">
        {isOutgoing && (
          <img
            className="check-icon"
            src={getAssetUrl('/assets/icons/double-check-blue.svg')}
            alt="read"
          />
        )}
        <span className="message-time">{msg.timestamp}</span>
      </div>
    </div>
  );
};

const Conversation: React.FC<Props> = ({ conversation, onBack, onSend }) => {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages.length]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSend(conversation.id, inputText);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasText = inputText.trim().length > 0;

  return (
    <div className="conversation-view">
      {/* Header */}
      <div className="chat-header">
        <img
          className="back-btn"
          src={getAssetUrl('/assets/icons/back-arrow.svg')}
          alt="back"
          onClick={onBack}
        />
        <img
          className="contact-avatar"
          src={getAssetUrl(conversation.avatar)}
          alt={conversation.contactName}
        />
        <span className="contact-name">{conversation.contactName}</span>
        <span className="last-seen">آخرین بازدید به تازگی</span>
        <img
          className="call-icon"
          src={getAssetUrl('/assets/icons/phone-call.svg')}
          alt="call"
        />
        <img
          className="menu-icon"
          src={getAssetUrl('/assets/icons/three-dot-menu.svg')}
          alt="menu"
        />
      </div>

      {/* Chat area */}
      <div className="chat-area" ref={chatAreaRef}>
        <div
          className="chat-background"
          style={
            conversation.customWallpaper
              ? {
                  background:
                    conversation.customWallpaper.startsWith('data:') ||
                    conversation.customWallpaper.startsWith('http')
                      ? `url("${conversation.customWallpaper}") center/cover no-repeat`
                      : conversation.customWallpaper.startsWith('/') ||
                        conversation.customWallpaper.startsWith('./') ||
                        conversation.customWallpaper.endsWith('.png') ||
                        conversation.customWallpaper.endsWith('.jpg') ||
                        conversation.customWallpaper.endsWith('.jpeg') ||
                        conversation.customWallpaper.endsWith('.webp')
                      ? `url("${getAssetUrl(conversation.customWallpaper)}") center/cover no-repeat`
                      : conversation.customWallpaper,
                }
              : undefined
          }
        />
        <div className="messages-container">
          {conversation.messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Scroll to bottom */}
      <img
        className="scroll-to-bottom"
        src={getAssetUrl('/assets/icons/scroll-to-bottom.svg')}
        alt="scroll down"
        onClick={() =>
          chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
      />

      {/* Composer */}
      <div className="message-composer">
        <img
          className="emoji-btn"
          src={getAssetUrl('/assets/icons/emoji.svg')}
          alt="emoji"
        />
        <input
          className="input-area"
          type="text"
          placeholder="پیام"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {hasText ? (
          <button className="send-btn" onClick={handleSend}>
            ➤
          </button>
        ) : (
          <>
            <img
              className="attachment-btn"
              src={getAssetUrl('/assets/icons/attachment.svg')}
              alt="attach"
            />
            <img
              className="camera-btn"
              src={getAssetUrl('/assets/icons/camera.svg')}
              alt="camera"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Conversation;
