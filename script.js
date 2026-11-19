const htmlRoot = document.documentElement;
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const iconSun = document.getElementById('icon-sun');
const iconMoon = document.getElementById('icon-moon');

// Sidebar elements
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const openSidebarBtn = document.getElementById('open-sidebar-btn');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');
const conversationListEl = document.getElementById('conversation-list');

// Settings modal & API Key elements
const settingsModal = document.getElementById('settings-modal');
const openSettingsBtn = document.getElementById('open-settings-btn');
const headerKeyBtn = document.getElementById('header-key-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const apiKeyInput = document.getElementById('api-key');
const saveBtn = document.getElementById('save-btn');
const forgetBtn = document.getElementById('forget-btn');
const keyDot = document.getElementById('key-dot');
const headerKeyLabel = document.getElementById('header-key-label');
const sidebarKeyStatus = document.getElementById('sidebar-key-status');

// Avatar elements
const avatarUploadInput = document.getElementById('avatar-upload');
const resetAvatarBtn = document.getElementById('reset-avatar-btn');
const sidebarLogoSlot = document.getElementById('sidebar-logo-slot');
const footerAvatarSlot = document.getElementById('footer-avatar-slot');

// Chat & Composer elements
const questionInput = document.getElementById('user-question');
const fileInput = document.getElementById('file-input');
const fileInfo = document.getElementById('file-info');
const fileNameSpan = document.getElementById('file-name');
const removeFileBtn = document.getElementById('remove-file-btn');

const sendBtn = document.getElementById('send-btn');
const newChatBtn = document.getElementById('new-chat-btn');
const restoreHistoryBtn = document.getElementById('restore-history-btn');
const clearHistoryBtn = document.getElementById('clear-history-btn');

const chatHistory = document.getElementById('chat-history');
const statusText = document.getElementById('status-text');
const statusDot = document.getElementById('status-dot');

let apiKey = '';
let conversations = []; // [{ id, title, messages }]
let currentChatId = null;
let conversationHistory = [];
let attachedFile = null;
let customAvatarDataUrl = null;

// Default Cyberpunk Capri SVG (Crimson Red #FF1E42 + Neon Green #00FF66 + Obsidian #07080B)
const DEFAULT_CAPRI_SVG = `<img src="capri-logo.jpg" alt="Capri Avatar">`;

function getCapriAvatarHTML() {
    if (customAvatarDataUrl) {
        return `<img src="${customAvatarDataUrl}" alt="Capri Avatar">`;
    }
    return DEFAULT_CAPRI_SVG;
}

function updateAvatarDisplays() {
    sidebarLogoSlot.innerHTML = getCapriAvatarHTML();
    footerAvatarSlot.innerHTML = getCapriAvatarHTML();
}
// ================= SAFE MARKDOWN FORMATTER (Fixes raw **text**) =================
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatMarkdown(rawText) {
    const codeBlocks = [];
    // 1. Extract fenced code blocks ```lang ... ```
    let text = rawText.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
        const idx = codeBlocks.length;
        const safeCode = escapeHtml(code.trimEnd());
        const label = lang ? escapeHtml(lang) : 'code';
        codeBlocks.push(`
            <div class="code-block">
                <div class="code-header">
                    <span>${label}</span>
                    <button type="button" class="copy-code-btn">Copy</button>
                </div>
                <pre><code>${safeCode}</code></pre>
            </div>
        `);
        return `@@CODEBLOCK_${idx}@@`;
    });

    // 2. Escape remaining HTML
    text = escapeHtml(text);

    // 3. Inline code `...`
    text = text.replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>');

    // 4. Bold **...** and Italic *...*
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');

    // 5. Line-by-line headings, lists, and paragraphs
    const lines = text.split('\n');
    let html = '';
    let inUl = false;
    let inOl = false;

    const closeLists = () => {
        if (inUl) { html += '</ul>'; inUl = false; }
        if (inOl) { html += '</ol>'; inOl = false; }
    };

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith('@@CODEBLOCK_')) {
            closeLists();
            html += trimmed;
        } else if (trimmed.startsWith('### ')) {
            closeLists();
            html += `<h3>${trimmed.slice(4)}</h3>`;
        } else if (trimmed.startsWith('## ')) {
            closeLists();
            html += `<h2>${trimmed.slice(3)}</h2>`;
        } else if (trimmed.startsWith('# ')) {
            closeLists();
            html += `<h1>${trimmed.slice(2)}</h1>`;
        } else if (/^[-*]\s+/.test(trimmed)) {
            if (inOl) { html += '</ol>'; inOl = false; }
            if (!inUl) { html += '<ul>'; inUl = true; }
            html += `<li>${trimmed.replace(/^[-*]\s+/, '')}</li>`;
        } else if (/^\d+\.\s+/.test(trimmed)) {
            if (inUl) { html += '</ul>'; inUl = false; }
            if (!inOl) { html += '<ol>'; inOl = true; }
            html += `<li>${trimmed.replace(/^\d+\.\s+/, '')}</li>`;
        } else if (trimmed === '') {
            closeLists();
        } else {
            closeLists();
            html += `<p>${line}</p>`;
        }
    }
    closeLists();

    // 6. Restore code blocks
    codeBlocks.forEach((block, idx) => {
        html = html.replace(`@@CODEBLOCK_${idx}@@`, block);
    });

    return html;
}

// ================= SIDEBAR & MODAL CONTROLS =================
openSidebarBtn.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
        sidebar.classList.add('open');
        sidebarOverlay.classList.add('active');
    } else {
        sidebar.classList.toggle('collapsed');
    }
});

function closeMobileSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
}

closeSidebarBtn.addEventListener('click', closeMobileSidebar);
sidebarOverlay.addEventListener('click', closeMobileSidebar);

function openModal() {
    settingsModal.style.display = 'flex';
    apiKeyInput.focus();
}

function closeModal() {
    settingsModal.style.display = 'none';
}

openSettingsBtn.addEventListener('click', openModal);
headerKeyBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) closeModal();
});

// ================= THEME & KEY STATUS =================
function setStatus(text, state = 'ready') {
    statusText.textContent = text;
    statusDot.className = 'status-dot';
    if (state === 'thinking') statusDot.classList.add('thinking');
    if (state === 'error') statusDot.classList.add('error');
}

function updateKeyIndicators() {
    if (apiKey) {
        keyDot.className = 'key-dot saved';
        headerKeyLabel.textContent = 'API Key: Ready';
        sidebarKeyStatus.textContent = 'API Key: Connected';
    } else {
        keyDot.className = 'key-dot missing';
        headerKeyLabel.textContent = 'Set API Key';
        sidebarKeyStatus.textContent = 'API Key: Not set';
    }
}

function applyTheme(theme) {
    htmlRoot.setAttribute('data-theme', theme);
    localStorage.setItem('capriTheme', theme);
    if (theme === 'light') {
        iconSun.style.display = 'none';
        iconMoon.style.display = 'block';
    } else {
        iconSun.style.display = 'block';
        iconMoon.style.display = 'none';
    }
}

themeToggleBtn.addEventListener('click', () => {
    const current = htmlRoot.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
});

// ================= CONVERSATIONS SIDEBAR LOGIC =================
function saveConversationsToStorage() {
    localStorage.setItem('capriConversations', JSON.stringify(conversations));
    if (conversationHistory.length > 0) {
        localStorage.setItem('chatHistory', JSON.stringify(conversationHistory));
    }
}

function renderSidebarList() {
    conversationListEl.innerHTML = '';

    if (conversations.length === 0) {
        conversationListEl.innerHTML = `<p class="empty-history-hint">No saved chats yet.</p>`;
        return;
    }

    conversations.forEach(conv => {
        const item = document.createElement('div');
        item.classList.add('conv-item');
        if (conv.id === currentChatId) item.classList.add('active');

        const titleSpan = document.createElement('span');
        titleSpan.classList.add('conv-title');
        titleSpan.textContent = conv.title;

        const delBtn = document.createElement('button');
        delBtn.classList.add('conv-delete-btn');
        delBtn.type = 'button';
        delBtn.title = 'Delete conversation';
        delBtn.textContent = '✕';
        delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            conversations = conversations.filter(c => c.id !== conv.id);
            saveConversationsToStorage();
            if (currentChatId === conv.id) {
                currentChatId = null;
                conversationHistory = [];
                renderChat();
            }
            renderSidebarList();
        });

        item.appendChild(titleSpan);
        item.appendChild(delBtn);

        item.addEventListener('click', () => {
            currentChatId = conv.id;
            conversationHistory = [...conv.messages];
            renderSidebarList();
            renderChat();
            closeMobileSidebar();
            setStatus('Status: Conversation loaded', 'ready');
        });

        conversationListEl.appendChild(item);
    });
}

// ================= CHAT STREAM RENDERING =================
function renderChat() {
    chatHistory.innerHTML = '';

    if (conversationHistory.length === 0) {
        chatHistory.innerHTML = `
            <div class="welcome-view">
                <div class="welcome-emblem">${getCapriAvatarHTML()}</div>
                <h1 class="welcome-title">Capri AI Online</h1>
                <p class="welcome-sub">Netrunner-grade minimal workspace powered by OpenRouter. How can I assist?</p>
                <div class="starter-grid">
                    <button class="starter-chip" type="button" data-prompt="Explain async/await and fetch in JavaScript with a clean code example.">
                        Explain async/await & fetch with code
                    </button>
                    <button class="starter-chip" type="button" data-prompt="Give me 3 short tips to optimize web performance on mobile devices.">
                        3 tips for mobile web performance
                    </button>
                    <button class="starter-chip" type="button" data-prompt="Summarize the attached .txt file and extract the key facts.">
                        Summarize my attached .txt file
                    </button>
                </div>
            </div>
        `;

        document.querySelectorAll('.starter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                questionInput.value = chip.getAttribute('data-prompt');
                questionInput.focus();
            });
        });
        return;
    }

    conversationHistory.forEach(msg => {
        const row = document.createElement('div');
        row.classList.add('msg-row', msg.role === 'user' ? 'user-row' : 'assistant-row');

        if (msg.role === 'assistant') {
            const avatar = document.createElement('div');
            avatar.classList.add('ai-avatar');
            avatar.innerHTML = getCapriAvatarHTML();
            row.appendChild(avatar);

            const bubble = document.createElement('div');
            bubble.classList.add('msg-bubble', 'rich-text');
            bubble.innerHTML = formatMarkdown(msg.content);
            row.appendChild(bubble);
        } else {
            const bubble = document.createElement('div');
            bubble.classList.add('msg-bubble');
            bubble.textContent = msg.content;
            row.appendChild(bubble);
        }

        chatHistory.appendChild(row);
    });

    // Attach Copy listeners to any rendered code blocks
    document.querySelectorAll('.copy-code-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const codeText = btn.closest('.code-block').querySelector('code').textContent;
            navigator.clipboard.writeText(codeText);
            btn.textContent = 'Copied!';
            setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
        });
    });

    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// ================= FILE ATTACHMENT (.txt max 50KB) =================
function clearAttachment() {
    attachedFile = null;
    fileInput.value = '';
    fileNameSpan.textContent = '';
    fileInfo.style.display = 'none';
}

fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) {
        clearAttachment();
        return;
    }
    if (!file.name.toLowerCase().endsWith('.txt') && file.type !== 'text/plain') {
        alert('Unsupported file type. Please select a .txt file.');
        clearAttachment();
        return;
    }
    if (file.size > 50 * 1024) {
        alert('File is too large. Maximum size is 50KB.');
        clearAttachment();
        return;
    }
    attachedFile = file;
    fileNameSpan.textContent = file.name;
    fileInfo.style.display = 'inline-flex';
});

removeFileBtn.addEventListener('click', clearAttachment);

// ================= INITIALIZATION =================
window.onload = () => {
    const savedTheme = localStorage.getItem('capriTheme') || 'dark';
    applyTheme(savedTheme);

    const savedAvatar = localStorage.getItem('capriCustomAvatar');
    if (savedAvatar) {
        customAvatarDataUrl = savedAvatar;
    }
    updateAvatarDisplays();

    const savedKey = localStorage.getItem('openRouterKey');
    if (savedKey) {
        apiKey = savedKey;
        apiKeyInput.value = savedKey;
    }
    updateKeyIndicators();

    const savedConvs = localStorage.getItem('capriConversations');
    if (savedConvs) {
        conversations = JSON.parse(savedConvs);
        if (conversations.length > 0) {
            currentChatId = conversations[0].id;
            conversationHistory = [...conversations[0].messages];
        }
    }
    renderSidebarList();
    renderChat();
};

// ================= API KEY & AVATAR ACTIONS =================
saveBtn.addEventListener('click', () => {
    apiKey = apiKeyInput.value.trim();
    if (apiKey) {
        localStorage.setItem('openRouterKey', apiKey);
        updateKeyIndicators();
        setStatus('Status: API Key saved', 'ready');
        closeModal();
    }
});

forgetBtn.addEventListener('click', () => {
    apiKey = '';
    apiKeyInput.value = '';
    localStorage.removeItem('openRouterKey');
    updateKeyIndicators();
    setStatus('Status: API Key removed', 'ready');
});

avatarUploadInput.addEventListener('change', () => {
    const imgFile = avatarUploadInput.files[0];
    if (!imgFile) return;
    const reader = new FileReader();
    reader.onload = () => {
        customAvatarDataUrl = reader.result;
        localStorage.setItem('capriCustomAvatar', customAvatarDataUrl);
        updateAvatarDisplays();
        renderChat();
    };
    reader.readAsDataURL(imgFile);
});

resetAvatarBtn.addEventListener('click', () => {
    customAvatarDataUrl = null;
    avatarUploadInput.value = '';
    localStorage.removeItem('capriCustomAvatar');
    updateAvatarDisplays();
    renderChat();
});

// ================= BONUS CONTROLS (New, Restore, Clear) =================
newChatBtn.addEventListener('click', () => {
    currentChatId = null;
    conversationHistory = [];
    clearAttachment();
    renderSidebarList();
    renderChat();
    closeMobileSidebar();
    setStatus('Status: Ready (New chat)', 'ready');
});

restoreHistoryBtn.addEventListener('click', () => {
    if (conversations.length > 0) {
        currentChatId = conversations[0].id;
        conversationHistory = [...conversations[0].messages];
        renderSidebarList();
        renderChat();
        setStatus('Status: History restored', 'ready');
    } else {
        const fallback = localStorage.getItem('chatHistory');
        if (fallback) {
            conversationHistory = JSON.parse(fallback);
            renderChat();
            setStatus('Status: History restored', 'ready');
        } else {
            alert('No saved history found.');
        }
    }
});

clearHistoryBtn.addEventListener('click', () => {
    conversations = [];
    currentChatId = null;
    conversationHistory = [];
    localStorage.removeItem('capriConversations');
    localStorage.removeItem('chatHistory');
    renderSidebarList();
    renderChat();
    setStatus('Status: All history cleared', 'ready');
});

// ================= SEND PROMPT TO OPENROUTER =================
questionInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendBtn.click();
    }
});

sendBtn.addEventListener('click', async () => {
    const question = questionInput.value.trim();

    if (!apiKey) {
        openModal();
        return;
    }
    if (!question) {
        alert('Please type a question!');
        return;
    }

    let promptToSend = question;
    if (attachedFile) {
        const fileText = await attachedFile.text();
        promptToSend = `${question}\n\n--- Attached File: ${attachedFile.name} ---\n${fileText}`;
    }

    // Create a new sidebar conversation entry if starting fresh
    if (!currentChatId) {
        currentChatId = 'chat_' + Date.now();
        const shortTitle = question.length > 34 ? question.slice(0, 34) + '...' : question;
        conversations.unshift({
            id: currentChatId,
            title: shortTitle,
            messages: []
        });
    }

    conversationHistory.push({ role: 'user', content: promptToSend });
    renderChat();

    questionInput.value = '';
    setStatus('Status: Thinking...', 'thinking');
    sendBtn.disabled = true;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'openrouter/free',
                messages: conversationHistory,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error('API error. Check your key or rate limit.');
        }

        const data = await response.json();
        const answer = data.choices[0].message.content;

        conversationHistory.push({ role: 'assistant', content: answer });

        // Sync active conversation into sidebar list & localStorage
        const activeConv = conversations.find(c => c.id === currentChatId);
        if (activeConv) {
            activeConv.messages = [...conversationHistory];
        }
        saveConversationsToStorage();

        clearAttachment();
        renderSidebarList();
        renderChat();
        setStatus('Status: Connected & Ready', 'ready');

    } catch (error) {
        conversationHistory.pop();
        renderChat();
        setStatus('Status: Error — please try again', 'error');
        alert('Something went wrong: ' + error.message);
    } finally {
        sendBtn.disabled = false;
    }
});