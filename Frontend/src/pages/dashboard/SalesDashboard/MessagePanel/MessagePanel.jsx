// MessagePanel.jsx
import React, { useEffect, useRef } from "react";
import {
  FaTimes,
  FaEnvelope,
  FaArrowLeft,
  FaUserPlus,
  FaCircle,
  FaWifi,
  FaSignal,
  FaPaperPlane,
} from "react-icons/fa";
import styles from "./MessagePanel.module.css";

const MessagePanel = ({
  isOpen,
  onClose,
  userId,
  currentUserName,
  isConnected,
  selectedChat,
  onSelectChat,
  onBack,
  conversations = [],
  availableUsers = [],
  showNewChatList,
  onToggleNewChatList,
  chatHistory = {},
  chatLoading,
  typingFrom,
  onlineUserIds = [],
  newMessage,
  onTypingInput,
  onSend,
}) => {
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key !== "Escape") return;
      if (selectedChat) onBack();
      else onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose, onBack, selectedChat]);

  const unreadTotal = conversations.reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0,
  );

  const thread = selectedChat ? chatHistory[selectedChat._id] || [] : [];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ""}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`${styles.panel} ${isOpen ? styles.open : ""}`}
      >
        {/* Connection Status */}
        <div className={styles.connectionStatus}>
          {isConnected ? (
            <>
              <FaWifi className={styles.onlineIcon} />
              <span className={styles.onlineText}>Live</span>
            </>
          ) : (
            <>
              <FaSignal className={styles.offlineIcon} />
              <span className={styles.offlineText}>Offline</span>
            </>
          )}
        </div>

        {/* ─── HEADER ─── */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            {selectedChat ? (
              <>
                <button className={styles.backBtn} onClick={onBack}>
                  <FaArrowLeft />
                </button>
                <span>{selectedChat.name}</span>
                {onlineUserIds.includes(selectedChat._id) && (
                  <FaCircle className={styles.onlineDot} />
                )}
              </>
            ) : (
              <>
                <FaEnvelope />
                <span>Messages</span>
                {unreadTotal > 0 && (
                  <span className={styles.badge}>{unreadTotal}</span>
                )}
              </>
            )}
          </div>
          <div className={styles.headerActions}>
            {!selectedChat && (
              <button
                className={styles.newChatBtn}
                onClick={onToggleNewChatList}
                title="New chat"
              >
                <FaUserPlus />
              </button>
            )}
            <button className={styles.closeBtn} onClick={onClose}>
              <FaTimes />
            </button>
          </div>
        </div>

        {/* ─── ACTIVE CHAT THREAD ─── */}
        {selectedChat ? (
          <div className={styles.threadWrapper}>
            <div className={styles.threadMessages}>
              {chatLoading ? (
                <div className={styles.emptyState}>
                  <p>Loading conversation...</p>
                </div>
              ) : thread.length === 0 ? (
                <div className={styles.emptyState}>
                  <FaEnvelope />
                  <p>Say hello to {selectedChat.name}</p>
                </div>
              ) : (
                thread.map((m, idx) => {
                  const senderId = m.sender?._id || m.sender;
                  const isMine = String(senderId) !== String(selectedChat._id);
                  const senderName = isMine
                    ? currentUserName || "You"
                    : m.sender?.name || selectedChat.name;
                  const prev = idx > 0 ? thread[idx - 1] : null;
                  const prevSenderId = prev
                    ? prev.sender?._id || prev.sender
                    : null;
                  const showName =
                    !prev || String(prevSenderId) !== String(senderId);
                  return (
                    <div
                      key={m._id}
                      className={`${styles.bubbleRow} ${isMine ? styles.bubbleRowMine : ""}`}
                    >
                      <div
                        className={`${styles.bubble} ${isMine ? styles.bubbleMine : ""}`}
                      >
                        {showName && (
                          <span className={styles.bubbleSenderName}>
                            {senderName}
                          </span>
                        )}
                        <span>{m.text}</span>
                        <span className={styles.bubbleTime}>
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              {typingFrom === selectedChat._id && (
                <div className={styles.typingIndicator}>
                  {selectedChat.name} is typing...
                </div>
              )}
            </div>
            <div className={styles.inputRow}>
              <input
                type="text"
                value={newMessage}
                placeholder="Type a message..."
                onChange={(e) => onTypingInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSend();
                }}
              />
              <button onClick={onSend} title="Send">
                <FaPaperPlane />
              </button>
            </div>
          </div>
        ) : showNewChatList ? (
          /* ─── START A NEW CHAT ─── */
          <div className={styles.list}>
            {availableUsers.map((u) => (
              <div
                key={u._id}
                className={styles.item}
                onClick={() => onSelectChat(u)}
              >
                <div className={styles.itemAvatar}>
                  {u.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className={styles.content}>
                  <span className={styles.title}>
                    {u.name}
                    {onlineUserIds.includes(u._id) && (
                      <FaCircle className={styles.onlineDot} />
                    )}
                  </span>
                  <span className={styles.message}>{u.role}</span>
                </div>
              </div>
            ))}
            {availableUsers.length === 0 && (
              <div className={styles.emptyState}>
                <p>No users available</p>
              </div>
            )}
          </div>
        ) : (
          /* ─── CONVERSATION LIST ─── */
          <div className={styles.list}>
            {conversations.filter((c) => c.user).length === 0 ? (
              <div className={styles.emptyState}>
                <FaEnvelope />
                <p>No messages yet</p>
                <button
                  className={styles.startBtn}
                  onClick={onToggleNewChatList}
                >
                  Start a conversation
                </button>
              </div>
            ) : (
              conversations
                .filter((c) => c.user)
                .map((c) => (
                  <div
                    key={c.user?._id}
                    className={`${styles.item} ${c.unreadCount > 0 ? styles.unread : ""}`}
                    onClick={() => onSelectChat(c.user)}
                  >
                    <div className={styles.itemAvatar}>
                      {c.user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className={styles.content}>
                      <span className={styles.title}>
                        {c.user.name}
                        {onlineUserIds.includes(c.user?._id) && (
                          <FaCircle className={styles.onlineDot} />
                        )}
                      </span>
                      <span className={styles.message}>
                        {c.lastMessage?.text}
                      </span>
                    </div>
                    {c.unreadCount > 0 && <div className={styles.dot} />}
                  </div>
                ))
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default MessagePanel;
