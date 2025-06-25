// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBuAyZ7WSG2Ga3lVwnjeB7lRUdaqHgX1Oo",
  authDomain: "shotchat-db42a.firebaseapp.com",
  projectId: "shotchat-db42a",
  storageBucket: "shotchat-db42a.firebasestorage.app",
  messagingSenderId: "74713162727",
  appId: "1:74713162727:web:051f7eeccedc6d109d9342",
  measurementId: "G-0B7YDXPS7P"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// UI Elements
const signinPage = document.getElementById('signin-page');
const signupPage = document.getElementById('signup-page');
const feedPage = document.getElementById('feed-page');
const profilePage = document.getElementById('profile-page');
const chatPage = document.getElementById('chat-page');
const directChatPage = document.getElementById('direct-chat-page');
const directChatProfile = document.getElementById('direct-chat-profile');
const directChatMessages = document.getElementById('direct-chat-messages');
const directChatForm = document.getElementById('direct-chat-form');
const directChatInput = document.getElementById('direct-chat-input');
const backToFeed = document.getElementById('back-to-feed');
const userInfo = document.getElementById('user-info');
const toSignup = document.getElementById('to-signup');
const toSignin = document.getElementById('to-signin');
const signinForm = document.getElementById('signin-form');
const signupForm = document.getElementById('signup-form');
const signinError = document.getElementById('signin-error');
const signupError = document.getElementById('signup-error');
const logoutBtn = document.getElementById('logout-btn');
const profileBtn = document.getElementById('profile-btn');
const homeBtn = document.getElementById('home-btn');
const backToHome = document.getElementById('back-to-home');
const profileForm = document.getElementById('profile-form');
const profileName = document.getElementById('profile-name');
const profileSuccess = document.getElementById('profile-success');
const myTweetsList = document.getElementById('my-tweets-list');

// Navigation
function showPage(page) {
  signinPage.style.display = 'none';
  signupPage.style.display = 'none';
  feedPage.style.display = 'none';
  profilePage.style.display = 'none';
  if (chatPage) chatPage.style.display = 'none';
  if (directChatPage) directChatPage.style.display = 'none';
  page.style.display = 'block';
}

toSignup.onclick = (e) => {
  e.preventDefault();
  showPage(signupPage);
  signinError.textContent = '';
  signupError.textContent = '';
};
toSignin.onclick = (e) => {
  e.preventDefault();
  showPage(signinPage);
  signinError.textContent = '';
  signupError.textContent = '';
};

// Sign Up
signupForm.onsubmit = async (e) => {
  e.preventDefault();
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  signupError.textContent = '';
  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    // Save name to users collection
    await db.collection('users').doc(cred.user.uid).set({ name });
    showPage(feedPage);
  } catch (err) {
    signupError.textContent = err.message;
  }
};

// Sign In
signinForm.onsubmit = async (e) => {
  e.preventDefault();
  const email = document.getElementById('signin-email').value;
  const password = document.getElementById('signin-password').value;
  signinError.textContent = '';
  try {
    await auth.signInWithEmailAndPassword(email, password);
    showPage(feedPage);
  } catch (err) {
    signinError.textContent = err.message;
  }
};

// Logout
logoutBtn.onclick = async () => {
  await auth.signOut();
  showPage(signinPage);
};

// Auth State
auth.onAuthStateChanged(async user => {
  if (user) {
    // Show user info in header
    if (userInfo) {
      let name = '';
      const userDoc = await db.collection('users').doc(user.uid).get();
      if (userDoc.exists && userDoc.data().name) {
        name = userDoc.data().name;
      }
      const username = user.email.split('@')[0];
      userInfo.innerHTML = `<div style="font-size:15px;font-weight:600;">${name || username}</div><div style="font-size:12px;color:#657786;">@${username}</div>`;
    }
    showPage(feedPage);
  } else {
    if (userInfo) userInfo.innerHTML = '';
    showPage(signinPage);
  }
});

// Profile navigation
if (profileBtn) {
  profileBtn.onclick = async () => {
    showPage(profilePage);
    profileSuccess.textContent = '';
    // Load name
    const user = auth.currentUser;
    if (user) {
      const userDoc = await db.collection('users').doc(user.uid).get();
      profileName.value = userDoc.exists && userDoc.data().name ? userDoc.data().name : '';
      // Load user's tweets
      db.collection('tweets')
        .where('email', '==', user.email)
        .orderBy('created', 'desc')
        .onSnapshot(snapshot => {
          myTweetsList.innerHTML = '';
          snapshot.docs.forEach(doc => {
            const tweet = doc.data();
            let time = '';
            if (tweet.created && tweet.created.toDate) {
              const d = tweet.created.toDate();
              time = `<div class='tweet-time' style='color:#657786;font-size:12px;margin-top:4px;'>${d.toLocaleString()}</div>`;
            }
            const div = document.createElement('div');
            div.className = 'tweet';
            let displayName = 'Unknown';
    let username = '';
    if (tweet.name && tweet.name.trim()) {
      displayName = tweet.name;
    }
    if (tweet.email) {
      username = tweet.email.split('@')[0];
      if (displayName === 'Unknown') displayName = username;
    }
    // Card header with name/username left, delete right
    const cardHeader = document.createElement('div');
    cardHeader.style.display = 'flex';
    cardHeader.style.justifyContent = 'space-between';
    cardHeader.style.alignItems = 'center';
    cardHeader.style.marginBottom = '2px';
    cardHeader.innerHTML = `
      <div>
        <span class="tweet-email" style="font-weight:bold;">${displayName}</span><br>
        <span class="tweet-username" style="font-size:12px;color:#8899a6;">@${username}</span>
      </div>
    `;
    // Add delete button
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.style.background = '#e0245e';
    delBtn.style.color = '#fff';
    delBtn.style.border = 'none';
    delBtn.style.borderRadius = '4px';
    delBtn.style.padding = '4px 10px';
    delBtn.style.cursor = 'pointer';
    delBtn.onclick = async () => {
      if (confirm('Delete this tweet?')) {
        await doc.ref.delete();
      }
    };
    cardHeader.appendChild(delBtn);
    div.appendChild(cardHeader);
    div.innerHTML += `<div class="tweet-content" style="margin-bottom:18px;">${tweet.content}</div>${time}`;
    myTweetsList.appendChild(div);
          });
        });
    }
  };
}
const chatBtn = document.getElementById('chat-btn');
const chatProfileCard = document.getElementById('chat-profile-card');
if (chatBtn) {
  chatBtn.onclick = async () => {
    // Show chat page
    showPage(chatPage);
    // Show all recent conversation profiles
    if (chatProfileCard) {
      chatProfileCard.innerHTML = '<div style="color:#aaa;">Loading recent conversations...</div>';
      const me = auth.currentUser;
      if (me) {
        try {
          const chatsSnap = await db.collection('recentChats').doc(me.uid).collection('chats').orderBy('updated', 'desc').get();
          if (chatsSnap.empty) {
            chatProfileCard.innerHTML = '<div style="color:#aaa;">No recent chats. Start a conversation!</div>';
            return;
          }
          let html = '';
          for (const doc of chatsSnap.docs) {
            const chat = doc.data();
            let name = (chat.name || '').trim();
            let username = (chat.username || (chat.email ? chat.email.split('@')[0] : '')).trim();
            // Try to fetch latest name from users collection
            try {
              const userSnap = await db.collection('users').where('email', '==', chat.email).limit(1).get();
              if (!userSnap.empty) {
                const u = userSnap.docs[0].data();
                if (u.name) name = u.name.trim();
                if (u.email) username = u.email.split('@')[0].trim();
              }
            } catch {}
            const showUsername = username && name.toLowerCase() !== username.toLowerCase();
            html += `
              <div class="chat-profile-clickable" data-uid="${chat.uid || ''}" data-email="${chat.email}" data-name="${name || username}" data-username="${username}"
                style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);padding:12px 18px 10px 18px;display:flex;flex-direction:column;align-items:flex-start;gap:2px;border:1px solid #e1e8ed;cursor:pointer;margin-bottom:12px;">
                <span style="font-weight:bold;font-size:16px;">${name || username}</span>
                ${showUsername ? `<span style=\"font-size:13px;color:#8899a6;\">@${username}</span>` : ''}
                <span style="font-size:12px;color:#bbb;">${chat.email}</span>
                <span style="font-size:12px;color:#888;margin-top:4px;">${chat.lastMessage ? chat.lastMessage : ''}</span>
              </div>
            `;
          }
          chatProfileCard.innerHTML = html;
          // Add click event to each profile card
          Array.from(document.getElementsByClassName('chat-profile-clickable')).forEach(div => {
            div.onclick = function() {
              openDirectChat({
                uid: div.getAttribute('data-uid') || '',
                email: div.getAttribute('data-email'),
                name: div.getAttribute('data-name'),
                username: div.getAttribute('data-username')
              });
            };
          });
        } catch (err) {
          console.error('Error fetching recent chats:', err);
          chatProfileCard.innerHTML = `<div style=\"color:#e0245e;\">Failed to load recent chats.<br>${err && err.message ? err.message : err}</div>`;
        }
      } else {
        chatProfileCard.innerHTML = '<div style="color:#aaa;">No recent chats. Start a conversation!</div>';
      }
    }
  };
}
if (backToHome) {
  backToHome.onclick = () => showPage(feedPage);
}
// Profile form submit
if (profileForm) {
  profileForm.onsubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;
    const name = profileName.value.trim();
    try {
      await db.collection('users').doc(user.uid).set({ name }, { merge: true });
      // Update all tweets with new name
      const tweetsSnap = await db.collection('tweets').where('email', '==', user.email).get();
      const batch = db.batch();
      tweetsSnap.forEach(doc => {
        batch.update(doc.ref, { name });
      });
      await batch.commit();
      profileSuccess.textContent = 'Name saved and all your tweets updated!';
      setTimeout(() => profileSuccess.textContent = '', 2000);
    } catch (err) {
      profileSuccess.textContent = 'Failed to save name.';
    }
  };
}
// Tweet logic
const plusBtn = document.getElementById('plus-btn');
const tweetModal = document.getElementById('tweet-modal');
const tweetInput = document.getElementById('tweet-input');
const postTweetBtn = document.getElementById('post-tweet-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const tweetsList = document.getElementById('tweets-list');

// Open tweet modal
plusBtn.onclick = () => {
  tweetModal.style.display = 'flex';
  tweetInput.value = '';
  tweetInput.focus();
};
// Close tweet modal
closeModalBtn.onclick = () => {
  tweetModal.style.display = 'none';
};
// Post tweet
postTweetBtn.onclick = async () => {
  const content = tweetInput.value.trim();
  if (!content) return;
  const user = auth.currentUser;
  if (!user) return;
  postTweetBtn.disabled = true;
  try {
    // Get name from users collection
    let name = '';
    const userDoc = await db.collection('users').doc(user.uid).get();
    if (userDoc.exists && userDoc.data().name) {
      name = userDoc.data().name;
    }
    await db.collection('tweets').add({
      content,
      email: user.email,
      name,
      created: firebase.firestore.FieldValue.serverTimestamp()
    });
    tweetModal.style.display = 'none';
    tweetInput.value = '';
  } catch (err) {
    alert('Failed to post tweet.');
  }
  postTweetBtn.disabled = false;
};
// Render tweets
function renderTweets(docs) {
  tweetsList.innerHTML = '';
  docs.forEach(async doc => {
    const tweet = doc.data();
    const div = document.createElement('div');
    div.className = 'tweet';
    let time = '';
    if (tweet.created && tweet.created.toDate) {
      const d = tweet.created.toDate();
      time = `<div class='tweet-time' style='color:#657786;font-size:12px;margin-top:4px;'>${d.toLocaleString()}</div>`;
    }
    let displayName = 'Unknown';
    if (tweet.name && tweet.name.trim()) {
      displayName = tweet.name;
    } else if (tweet.email) {
      // Try to fetch name from users collection
      try {
        const userSnap = await db.collection('users').where('email', '==', tweet.email).limit(1).get();
        if (!userSnap.empty && userSnap.docs[0].data().name) {
          displayName = userSnap.docs[0].data().name;
          // Update the tweet document for future efficiency
          doc.ref.update({ name: displayName });
        } else {
          displayName = tweet.email.split('@')[0];
        }
      } catch {
        displayName = tweet.email.split('@')[0];
      }
    }
    let username = '';
    if (tweet.email) {
      username = tweet.email.split('@')[0];
      if (displayName === 'Unknown') displayName = username;
    }
    // Make name/username clickable for direct chat
    const nameHtml = `<span class="tweet-email" style="font-weight:bold;cursor:pointer;color:#1da1f2;" data-uid="${tweet.uid || ''}" data-email="${tweet.email || ''}" data-name="${displayName}" data-username="${username}">${displayName}</span>`;
    const usernameHtml = `<span class="tweet-username" style="font-size:12px;color:#8899a6;cursor:pointer;" data-uid="${tweet.uid || ''}" data-email="${tweet.email || ''}" data-name="${displayName}" data-username="${username}">@${username}</span>`;
    div.innerHTML = `
      <div style="margin-bottom:2px;">
        ${nameHtml}<br>
        ${usernameHtml}
      </div>
      <div class="tweet-content" style="margin-bottom:18px;">${tweet.content}</div>
      <div style="display:flex;justify-content:flex-end;align-items:center;">
        <span class='tweet-time' style='color:#657786;font-size:12px;'>${time.replace(/<[^>]+>/g, '')}</span>
      </div>
    `;
    // Add click event for direct chat
    div.querySelector('.tweet-email').onclick = div.querySelector('.tweet-username').onclick = function(e) {
      e.stopPropagation();
      openDirectChat({
        uid: tweet.uid || '',
        email: tweet.email || '',
        name: displayName,
        username: username
      });
    };
    tweetsList.appendChild(div);
  });
}
// Listen for tweets in real time (newest first)
db.collection('tweets').orderBy('created', 'desc').onSnapshot(snapshot => {
  renderTweets(snapshot.docs);
});

// Direct chat logic
let currentDirectChat = null;
async function openDirectChat(user) {
  const me = auth.currentUser;
  if (!me || !user || !user.email || user.email === me.email) return;
  // Store last messaged user in Firestore under the sender's UID
  try {
    await db.collection('recentChats').doc(me.uid).set(user);
  } catch {}
  // Show direct chat page
  showPage(directChatPage);
  // Show profile info as a card
  // Try to fetch latest name from users collection
  let profileName = user.name;
  let profileUsername = user.username;
  try {
    const userSnap = await db.collection('users').where('email', '==', user.email).limit(1).get();
    if (!userSnap.empty) {
      const u = userSnap.docs[0].data();
      if (u.name) profileName = u.name;
      if (u.email) profileUsername = u.email.split('@')[0];
    }
  } catch {}
  directChatProfile.innerHTML = `
    <div style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08);padding:12px 18px 10px 18px;display:flex;flex-direction:column;align-items:flex-start;gap:2px;border:1px solid #e1e8ed;">
      <span style="font-weight:bold;font-size:16px;">${profileName}</span>
      <span style="font-size:13px;color:#8899a6;">@${profileUsername}</span>
      <span style="font-size:12px;color:#bbb;">${user.email}</span>
    </div>
  `;
  // Chat ID: always use sorted emails
  let chatId = [me.email, user.email].sort().join('_');
  currentDirectChat = chatId;
  // Store recipient email globally for sending
  window.currentDirectChatRecipientEmail = user.email;
  // Listen for messages
  directChatMessages.innerHTML = '<div style="color:#aaa;text-align:center;">Loading...</div>';
  db.collection('messages')
    .where('chatId', '==', chatId)
    .orderBy('created', 'asc')
    .onSnapshot(snapshot => {
      directChatMessages.innerHTML = '';
      if (snapshot.empty) {
        directChatMessages.innerHTML = '<div style="color:#aaa;text-align:center;">No messages yet.</div>';
      }
      snapshot.docs.forEach(doc => {
        const msg = doc.data();
        const msgDiv = document.createElement('div');
        msgDiv.className = 'direct-chat-bubble';
        msgDiv.style.margin = '8px 0';
        msgDiv.style.padding = '8px 12px';
        msgDiv.style.borderRadius = '12px';
        msgDiv.style.background = msg.from === me.email ? '#e8f5fd' : '#f1f0f0';
        msgDiv.style.alignSelf = msg.from === me.email ? 'flex-end' : 'flex-start';
        msgDiv.style.textAlign = 'left';
        msgDiv.innerHTML = `<div style="font-size:14px;">${msg.text}</div><div style="font-size:11px;color:#999;text-align:right;">${msg.created && msg.created.toDate ? msg.created.toDate().toLocaleString() : ''}</div>`;
        directChatMessages.appendChild(msgDiv);
      });
      directChatMessages.scrollTop = directChatMessages.scrollHeight;
    });
}
// Send message
if (directChatForm) {
  directChatForm.onsubmit = async (e) => {
    e.preventDefault();
    const me = auth.currentUser;
    if (!me || !currentDirectChat) return;
    const text = directChatInput.value.trim();
    if (!text) return;
    // Get recipient email from the current direct chat context
    const recipientEmail = window.currentDirectChatRecipientEmail;
    await db.collection('messages').add({
      chatId: currentDirectChat,
      from: me.email,
      to: recipientEmail,
      text,
      created: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Update recent chats for both users
    const now = new Date();
    // Get recipient info
    let recipientInfo = { email: recipientEmail };
    try {
      const userSnap = await db.collection('users').where('email', '==', recipientEmail).limit(1).get();
      if (!userSnap.empty) {
        const u = userSnap.docs[0].data();
        recipientInfo.name = u.name || '';
        recipientInfo.username = recipientEmail.split('@')[0];
      }
    } catch {}
    // Get sender info
    let senderInfo = { email: me.email };
    try {
      const userSnap = await db.collection('users').where('email', '==', me.email).limit(1).get();
      if (!userSnap.empty) {
        const u = userSnap.docs[0].data();
        senderInfo.name = u.name || '';
        senderInfo.username = me.email.split('@')[0];
      }
    } catch {}
    // Write to both users' recentChats subcollections
    const chatId = currentDirectChat;
    await db.collection('recentChats').doc(me.uid).collection('chats').doc(chatId).set({
      ...recipientInfo,
      chatId,
      lastMessage: text,
      updated: new Date(),
    });
    // For recipient
    const recipientUserSnap = await db.collection('users').where('email', '==', recipientEmail).limit(1).get();
    if (!recipientUserSnap.empty) {
      const recipientUser = recipientUserSnap.docs[0];
      await db.collection('recentChats').doc(recipientUser.id).collection('chats').doc(chatId).set({
        ...senderInfo,
        chatId,
        lastMessage: text,
        updated: new Date(),
      });
    }
    directChatInput.value = '';
  };
}
// Back button
if (backToFeed) {
  backToFeed.onclick = () => showPage(feedPage);
}
const backFromChat = document.getElementById('back-from-chat');
if (backFromChat) {
  backFromChat.onclick = () => showPage(feedPage);
}
