import React, { useEffect, useContext, useState } from 'react';
import { UIKitProvider, Chat, useClient, rootStore } from 'agora-chat-uikit';
import 'agora-chat-uikit/style.css';
import { UserContext } from '../../Context/UserContext';

const appKey = '611327058#1529103';
const defaultAvatar = 'https://via.placeholder.com/40';

const getConversationId = (a, b) => [a, b].sort().join('_');

const fetchFromBackend = async (userId) => {
  const res = await fetch(`https://localhost:7046/api/ChatConversation/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch conversations');
  return await res.json();
};

const updateBackendConversation = async (from, to, lastMessage) => {
  try {
    await fetch('https://localhost:7046/api/ChatConversation/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to,
        lastMessage,
      }),
    });
  } catch (err) {
    console.error('❌ Failed to update backend:', err);
  }
};

const resetUnreadOnBackend = async (conversationId, userId) => {
  try {
    await fetch(`https://localhost:7046/api/ChatConversation/${conversationId}/read`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userId),
    });
  } catch (err) {
    console.error('❌ Failed to reset unread count:', err);
  }
};

const ChatApp = ({ currentUser, token, clientList }) => {
  const client = useClient();
  const [targetUser, setTargetUser] = useState(null);
  const [userMessages, setUserMessages] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});

  // ✅ Step 1: Fetch from backend DB on load
  useEffect(() => {
    if (!currentUser) return;

    fetchFromBackend(currentUser)
      .then((data) => {
        console.log('✅ Load from DB successful:', data);
        const messages = {};
        const counts = {};
        data.forEach((conv) => {
          const otherUser = conv.participants.find((u) => u !== currentUser);
          const prefix = conv.sender === currentUser ? 'You: ' : '';
          messages[otherUser] = prefix + (conv.lastMessage || 'No messages yet');
          counts[otherUser] = conv.unreadCount?.[currentUser] || 0;
        });
        setUserMessages(messages);
        setUnreadCounts(counts);
      })
      .catch((err) => console.error('❌ Load from DB failed:', err));
  }, [currentUser]);

  // ✅ Step 2: Agora login + real-time updates
  useEffect(() => {
    if (!client || !currentUser || !token) return;

    client.open({ user: currentUser, accessToken: token }).then(() => {
      console.log('✅ Agora login successful');

    client.addEventHandler('chat-ui-handler', {
    onTextMessage: (msg) => {
    const from = msg.from;
    const to = msg.to;
    const isSender = from === currentUser;
    const otherUser = isSender ? to : from;
    const content = msg.msg || msg.content || '';
    const time = msg.time || Date.now();

    setUserMessages((prev) => ({
    ...prev,
    [otherUser]: content,
    }));

    if (!isSender) {
    setUnreadCounts((prev) => ({
      ...prev,
      [from]: (prev[from] || 0) + 1,
    }));
    }

    // ✅ Sync to backend (always)
    updateBackendConversation(from, to, { content, time, sender: from });
    },

    onDeliveredMessage: (msg) => {
    // Fallback: handle sent messages manually
    const from = msg.from;
    const to = msg.to;
    const content = msg.msg || msg.content || '';
    const time = msg.time || Date.now();

    if (from === currentUser) {
    updateBackendConversation(from, to, { content, time, sender: from });
    }
    }
    });
    });

    return () => {
      client.removeEventHandler('chat-ui-handler');
    };
  }, [client, currentUser, token]);

  // ✅ Step 3: User clicks a chat → open + mark as read
  const handleChatClick = (user) => {
    setTargetUser(user);

    const conversationId = user.name;

    const existingConversation = rootStore.conversationStore?.conversations?.find(
      (cvs) => cvs?.conversationId === conversationId
    );

    if (!existingConversation) {
      rootStore.conversationStore.addConversation({
        chatType: 'singleChat',
        conversationId,
      });
    }

    rootStore.conversationStore.setCurrentCvs({
      chatType: 'singleChat',
      conversationId,
    });

    setUnreadCounts((prev) => ({
      ...prev,
      [conversationId]: 0,
    }));

    const convoId = getConversationId(currentUser, user.name);
    resetUnreadOnBackend(convoId, currentUser);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <div style={{ width: '250px', borderRight: '1px solid #ccc', overflowY: 'auto' }}>
        {clientList?.map((user) => {
          if (user.name === currentUser) return null;

          const latestMessage = userMessages[user.name] || 'No messages yet';
          const unread = unreadCounts[user.name] || 0;

          return (
            <div
              key={user.name}
              onClick={() => handleChatClick(user)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px',
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                backgroundColor: targetUser?.name === user.name ? '#f0f0f0' : '#fff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img
                  src={user.image || defaultAvatar}
                  alt="avatar"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    marginRight: '10px',
                  }}
                />
                <div>
                  <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    {latestMessage.length > 30 ? `${latestMessage.slice(0, 30)}...` : latestMessage}
                  </div>
                </div>
              </div>
              {unread > 0 && (
                <div
                  style={{
                    backgroundColor: '#f44336',
                    color: '#fff',
                    borderRadius: '12px',
                    padding: '2px 6px',
                    fontSize: '12px',
                  }}
                >
                  {unread}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Chat Component */}
      <div style={{ flex: 1 }}>
        <Chat />
      </div>
    </div>
  );
};

const ChatWrapper = () => {
  const { user } = useContext(UserContext);
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);

  const fetchToken = async (userAccount) => {
    try {
      const response = await fetch(
        `https://localhost:7046/api/AgoraToken/generateUserToken?userAccount=${userAccount}`
      );
      if (response.ok) {
        const data = await response.json();
        setToken(data.data);
      } else {
        console.error('❌ Token fetch failed:', response.statusText);
      }
    } catch (error) {
      console.error('❌ Token error:', error);
    }
  };

  useEffect(() => {
    if (user?.name) {
      setCurrentUser(user.name);
      fetchToken(user.name);
    }
  }, [user]);

  if (!currentUser || !token) {
    return <div>Loading chat environment...</div>;
  }

  return (
    <UIKitProvider
      initConfig={{
        appKey,
        user: currentUser,
        accessToken: token,
      }}
    >
      {user?.clientlist && (
        <ChatApp currentUser={currentUser} token={token} clientList={user.clientlist} />
      )}
    </UIKitProvider>
  );
};

export default ChatWrapper;