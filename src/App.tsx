import React from 'react';
import { useAppState } from './hooks/useAppState';
import ConversationList from './pages/ConversationList';
import Conversation from './pages/Conversation';
import Dashboard from './dashboard/Dashboard';
import './styles/global.css';

const App: React.FC = () => {
  const {
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
  } = useAppState();

  const phoneClasses = [
    'phone-frame',
    state.screenshotMode ? 'screenshot-mode' : 'scaled',
  ].join(' ');

  return (
    <div className="app-container">
      {/* Phone Frame */}
      <div className={phoneClasses}>
        {state.viewMode === 'list' ? (
          <ConversationList
            conversations={state.conversations}
            onSelect={openConversation}
            tabBadges={state.tabBadges}
            showAd={state.showAd}
            onDismissAd={toggleShowAd}
            onCreateNew={() => {
              const name = prompt('نام مخاطب یا کانال جدید را وارد کنید:');
              if (name && name.trim()) {
                const newId = addConversation({
                  contactName: name.trim(),
                  initialMessage: 'سلام!',
                });
                openConversation(newId);
              }
            }}
          />
        ) : activeConversation ? (
          <Conversation
            conversation={activeConversation}
            onBack={goBack}
            onSend={sendMessage}
          />
        ) : null}
      </div>

      {/* Dashboard (hidden in screenshot mode) */}
      {!state.screenshotMode && state.showDashboard && (
        <Dashboard
          state={state}
          onSelectConversation={openConversation}
          onGoBack={goBack}
          onSendMessage={sendMessage}
          onSimulateIncoming={simulateIncoming}
          onReset={resetData}
          onToggleScreenshot={toggleScreenshotMode}
          onUpdateConversation={updateConversation}
          onAddConversation={addConversation}
          onDeleteConversation={deleteConversation}
          onClearAllConversations={clearAllConversations}
          onUpdateWallpaper={updateWallpaper}
          onUpdateAvatar={updateAvatar}
          onToggleShowAd={toggleShowAd}
          onUpdateTabBadge={updateTabBadge}
          onUpdateUnreadCount={updateUnreadCount}
          onUpdateTimestamp={updateTimestamp}
        />
      )}

      {/* Toggle dashboard button */}
      {!state.screenshotMode && (
        <button
          onClick={toggleDashboard}
          style={{
            position: 'fixed',
            top: 10,
            right: 10,
            zIndex: 1000,
            background: '#333',
            color: '#eee',
            border: '1px solid #555',
            borderRadius: 6,
            padding: '6px 14px',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          {state.showDashboard ? 'Hide Panel' : 'Show Panel'}
        </button>
      )}
    </div>
  );
};

export default App;
