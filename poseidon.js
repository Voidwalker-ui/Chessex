/* ============================================================
   poseidon.js — Chess-X AI Assistant Widget
   Drop this file in your project root.
   Add <script src="poseidon.js" defer></script> to every page.
   ============================================================ */

(function () {
  'use strict';

  const MAX_MESSAGES = 15;      // per session
  const MAX_CHARS    = 800;     // per message
  const API_ENDPOINT = '/api/poseidon';

  // ── Inject CSS ────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    /* ── Poseidon Widget ── */
    #poseidon-btn {
      position: fixed;
      bottom: 1.75rem;
      right: 1.75rem;
      width: 56px;
      height: 56px;
      background: #1a1507;
      border: 2px solid #c8a84b;
      border-radius: 50%;
      cursor: pointer;
      z-index: 9000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
      color: #c8a84b;
      font-family: serif;
    }
    #poseidon-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 28px rgba(0,0,0,0.5);
      background: #251f0e;
    }
    #poseidon-btn .poseidon-btn-icon {
      line-height: 1;
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #poseidon-btn .poseidon-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #9b1c1c;
      color: #fff;
      font-size: 0.55rem;
      font-family: 'Cinzel', serif;
      letter-spacing: 0.05em;
      padding: 2px 5px;
      border-radius: 8px;
      font-weight: 700;
      white-space: nowrap;
    }

    /* ── Panel ── */
    #poseidon-panel {
      position: fixed;
      bottom: calc(1.75rem + 56px + 12px);
      right: 1.75rem;
      width: 380px;
      max-height: 560px;
      background: #f5efe0;
      border: 1px solid #b8a882;
      border-top: 3px solid #c8a84b;
      box-shadow: 0 12px 48px rgba(0,0,0,0.35), 4px 4px 0 #b8a882;
      display: flex;
      flex-direction: column;
      z-index: 9001;
      transform: translateY(20px);
      opacity: 0;
      pointer-events: none;
      transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1), opacity 0.22s ease;
      font-family: 'EB Garamond', Georgia, serif;
    }
    #poseidon-panel.open {
      transform: translateY(0);
      opacity: 1;
      pointer-events: all;
    }
    body.dark-mode #poseidon-panel {
      background: #1a1507;
      border-color: #3a3020;
      border-top-color: #c8a84b;
      box-shadow: 0 12px 48px rgba(0,0,0,0.6), 4px 4px 0 #3a3020;
    }

    /* ── Panel Header ── */
    #poseidon-header {
      background: #1a1507;
      padding: 0.85rem 1rem 0.75rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #c8a84b;
      flex-shrink: 0;
    }
    #poseidon-header .ph-left {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    #poseidon-header .ph-icon {
      font-size: 1.5rem;
      color: #c8a84b;
      line-height: 1;
    }
    #poseidon-header .ph-title {
      font-family: 'Cinzel', serif;
      font-size: 1rem;
      font-weight: 900;
      color: #f5f0e8;
      letter-spacing: 0.15em;
      line-height: 1;
    }
    #poseidon-header .ph-subtitle {
      font-family: 'EB Garamond', serif;
      font-style: italic;
      font-size: 0.72rem;
      color: #888;
      letter-spacing: 0.08em;
      margin-top: 0.15rem;
    }
    #poseidon-header .ph-actions {
      display: flex;
      gap: 0.4rem;
      align-items: center;
    }
    .poseidon-icon-btn {
      background: none;
      border: none;
      color: #888;
      cursor: pointer;
      font-size: 0.9rem;
      padding: 0.3rem;
      border-radius: 3px;
      line-height: 1;
      transition: color 0.15s, background 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .poseidon-icon-btn:hover { color: #c8a84b; background: rgba(255,255,255,0.08); }
    .poseidon-icon-btn[title="New conversation"]:hover { color: #6fb; }
    .poseidon-icon-btn[title="Close"]:hover { color: #f88; }

    /* ── Messages ── */
    #poseidon-messages {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      scroll-behavior: smooth;
    }
    #poseidon-messages::-webkit-scrollbar { width: 4px; }
    #poseidon-messages::-webkit-scrollbar-track { background: transparent; }
    #poseidon-messages::-webkit-scrollbar-thumb { background: #b8a882; border-radius: 2px; }

    /* Welcome message */
    .poseidon-welcome {
      text-align: center;
      padding: 0.5rem 0.5rem 0;
    }
    .poseidon-welcome .pw-trident {
      font-size: 2rem;
      line-height: 1;
      margin-bottom: 0.4rem;
    }
    .poseidon-welcome p {
      font-size: 0.88rem;
      color: #7a6e56;
      line-height: 1.55;
      font-style: italic;
    }
    body.dark-mode .poseidon-welcome p { color: #888; }

    /* Suggestion chips */
    .poseidon-suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-top: 0.6rem;
    }
    .poseidon-chip {
      font-family: 'EB Garamond', serif;
      font-size: 0.78rem;
      padding: 0.3em 0.8em;
      border: 1px solid #b8a882;
      background: #ede7d5;
      color: #3d3520;
      cursor: pointer;
      border-radius: 2px;
      transition: background 0.15s, border-color 0.15s, color 0.15s;
      line-height: 1.4;
      text-align: left;
    }
    .poseidon-chip:hover {
      background: #1a1507;
      color: #c8a84b;
      border-color: #c8a84b;
    }
    body.dark-mode .poseidon-chip {
      background: #211c0e;
      border-color: #3a3020;
      color: #d4c9a8;
    }
    body.dark-mode .poseidon-chip:hover {
      background: #c8a84b;
      color: #1a1507;
      border-color: #c8a84b;
    }

    /* Message bubbles */
    .poseidon-msg {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      max-width: 88%;
      animation: poseidonFadeIn 0.2s ease;
    }
    @keyframes poseidonFadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .poseidon-msg.user { align-self: flex-end; align-items: flex-end; }
    .poseidon-msg.assistant { align-self: flex-start; align-items: flex-start; }

    .poseidon-msg-label {
      font-size: 0.62rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #b8a882;
      font-family: 'EB Garamond', serif;
      padding: 0 0.2rem;
    }
    body.dark-mode .poseidon-msg-label { color: #4a4030; }

    .poseidon-msg-bubble {
      padding: 0.65rem 0.9rem;
      font-size: 0.92rem;
      line-height: 1.6;
      border: 1px solid transparent;
    }
    .poseidon-msg.user .poseidon-msg-bubble {
      background: #1a1507;
      color: #f5f0e8;
      border-color: #c8a84b;
    }
    .poseidon-msg.assistant .poseidon-msg-bubble {
      background: #ede7d5;
      color: #1a1507;
      border-color: #b8a882;
      border-left: 3px solid #c8a84b;
    }
    body.dark-mode .poseidon-msg.assistant .poseidon-msg-bubble {
      background: #211c0e;
      color: #f0e8d0;
      border-color: #3a3020;
      border-left-color: #c8a84b;
    }
    body.dark-mode .poseidon-msg.user .poseidon-msg-bubble {
      background: #0d0d0d;
      border-color: #c8a84b;
    }

    /* Typing indicator */
    .poseidon-typing {
      display: flex;
      gap: 5px;
      align-items: center;
      padding: 0.65rem 0.9rem;
      background: #ede7d5;
      border: 1px solid #b8a882;
      border-left: 3px solid #c8a84b;
      width: fit-content;
    }
    body.dark-mode .poseidon-typing {
      background: #211c0e;
      border-color: #3a3020;
      border-left-color: #c8a84b;
    }
    .poseidon-typing span {
      width: 6px;
      height: 6px;
      background: #b8a882;
      border-radius: 50%;
      animation: poseidonDot 1.2s ease-in-out infinite;
    }
    .poseidon-typing span:nth-child(2) { animation-delay: 0.2s; }
    .poseidon-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes poseidonDot {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30%            { transform: translateY(-5px); opacity: 1; }
    }

    /* Rate limit message */
    .poseidon-limit {
      text-align: center;
      padding: 0.75rem;
      font-size: 0.82rem;
      color: #9b1c1c;
      font-style: italic;
      border-top: 1px solid #b8a882;
      background: #f5efe0;
    }
    body.dark-mode .poseidon-limit {
      background: #1a1507;
      border-top-color: #3a3020;
      color: #c8a84b;
    }

    /* ── Input Area ── */
    #poseidon-footer {
      border-top: 1px solid #b8a882;
      padding: 0.7rem;
      background: #f0e9d6;
      flex-shrink: 0;
    }
    body.dark-mode #poseidon-footer {
      background: #211c0e;
      border-top-color: #3a3020;
    }
    #poseidon-input-row {
      display: flex;
      gap: 0.5rem;
      align-items: flex-end;
    }
    #poseidon-input {
      flex: 1;
      background: #f5efe0;
      border: 1px solid #b8a882;
      padding: 0.5rem 0.7rem;
      font-family: 'EB Garamond', serif;
      font-size: 0.92rem;
      color: #1a1507;
      resize: none;
      outline: none;
      min-height: 38px;
      max-height: 100px;
      line-height: 1.5;
      transition: border-color 0.15s;
      border-radius: 2px;
    }
    #poseidon-input:focus { border-color: #c8a84b; }
    #poseidon-input::placeholder { color: #b8a882; font-style: italic; }
    body.dark-mode #poseidon-input {
      background: #1a1507;
      border-color: #3a3020;
      color: #f0e8d0;
    }
    body.dark-mode #poseidon-input::placeholder { color: #4a4030; }
    body.dark-mode #poseidon-input:focus { border-color: #c8a84b; }

    #poseidon-send {
      background: #1a1507;
      border: 1px solid #c8a84b;
      color: #c8a84b;
      padding: 0 0.9rem;
      height: 38px;
      cursor: pointer;
      font-family: 'Cinzel', serif;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      transition: background 0.15s, color 0.15s;
      white-space: nowrap;
      border-radius: 2px;
      flex-shrink: 0;
    }
    #poseidon-send:hover:not(:disabled) {
      background: #c8a84b;
      color: #1a1507;
    }
    #poseidon-send:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    #poseidon-char-count {
      font-size: 0.65rem;
      color: #b8a882;
      text-align: right;
      margin-top: 0.25rem;
      font-family: 'EB Garamond', serif;
      transition: color 0.15s;
    }
    #poseidon-char-count.near-limit { color: #c8a84b; }
    #poseidon-char-count.at-limit   { color: #9b1c1c; }

    /* ── Error bubble ── */
    .poseidon-error {
      font-size: 0.82rem;
      color: #9b1c1c;
      padding: 0.5rem 0.8rem;
      background: #fdf0f0;
      border: 1px solid #e8c0c0;
      border-left: 3px solid #9b1c1c;
      font-style: italic;
    }
    body.dark-mode .poseidon-error {
      background: #2a1010;
      border-color: #4a2020;
      color: #f08080;
    }

    /* ── Mobile ── */
    @media (max-width: 500px) {
      #poseidon-panel {
        width: calc(100vw - 2rem);
        right: 1rem;
        bottom: calc(1rem + 56px + 10px);
        max-height: 65vh;
      }
      #poseidon-btn { bottom: 1rem; right: 1rem; }
    }

    /* ── Reduced motion ── */
    @media (prefers-reduced-motion: reduce) {
      #poseidon-panel { transition: none; }
      .poseidon-msg   { animation: none; }
      .poseidon-typing span { animation: none; opacity: 0.6; }
    }
  `;
  document.head.appendChild(style);

  // ── Suggestion chips ─────────────────────────────────────
  const SUGGESTIONS = [
    "What opening should I learn first?",
    "Explain the Sicilian Defence",
    "How do I improve at chess?",
    "What is the Lucena position?",
    "Best way to attack the king?",
    "How does the Ruy Lopez work?",
  ];

  // ── State ─────────────────────────────────────────────────
  let isOpen        = false;
  let isLoading     = false;
  let conversation  = [];   // {role, content}[]
  let msgCount      = parseInt(sessionStorage.getItem('poseidon-count') || '0', 10);

  // ── Build DOM ─────────────────────────────────────────────
  function buildWidget() {
    // Floating button
    const btn = document.createElement('button');
    btn.id = 'poseidon-btn';
    btn.setAttribute('aria-label', 'Open Poseidon chess assistant');
    btn.innerHTML = `
      <span class="poseidon-btn-icon">🔱</span>
      <span class="poseidon-badge">AI</span>
    `;

    // Panel
    const panel = document.createElement('div');
    panel.id = 'poseidon-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Poseidon chess assistant');
    panel.innerHTML = `
      <div id="poseidon-header">
        <div class="ph-left">
          <span class="ph-icon">🔱</span>
          <div>
            <div class="ph-title">POSEIDON</div>
            <div class="ph-subtitle">Chess-X AI · Gemini 1.5 Pro</div>
          </div>
        </div>
        <div class="ph-actions">
          <button class="poseidon-icon-btn" id="poseidon-new" title="New conversation" aria-label="New conversation">↺</button>
          <button class="poseidon-icon-btn" id="poseidon-close" title="Close" aria-label="Close">✕</button>
        </div>
      </div>
      <div id="poseidon-messages"></div>
      <div id="poseidon-footer">
        <div id="poseidon-input-row">
          <textarea
            id="poseidon-input"
            placeholder="Ask Poseidon anything about chess…"
            rows="1"
            maxlength="${MAX_CHARS}"
            aria-label="Message Poseidon"
          ></textarea>
          <button id="poseidon-send" aria-label="Send message">Send</button>
        </div>
        <div id="poseidon-char-count">0 / ${MAX_CHARS}</div>
      </div>
    `;

    document.body.appendChild(btn);
    document.body.appendChild(panel);

    // Wire up events
    btn.addEventListener('click', togglePanel);
    panel.querySelector('#poseidon-close').addEventListener('click', closePanel);
    panel.querySelector('#poseidon-new').addEventListener('click', resetConversation);

    const input   = panel.querySelector('#poseidon-input');
    const sendBtn = panel.querySelector('#poseidon-send');
    const counter = panel.querySelector('#poseidon-char-count');

    input.addEventListener('input', () => {
      // Auto-resize
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 100) + 'px';
      // Char count
      const len = input.value.length;
      counter.textContent = `${len} / ${MAX_CHARS}`;
      counter.className = len > MAX_CHARS * 0.9 ? (len >= MAX_CHARS ? 'at-limit' : 'near-limit') : '';
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    sendBtn.addEventListener('click', sendMessage);

    // Show welcome
    showWelcome();
  }

  // ── Welcome screen ────────────────────────────────────────
  function showWelcome() {
    const msgs = document.getElementById('poseidon-messages');
    if (!msgs) return;

    const welcome = document.createElement('div');
    welcome.className = 'poseidon-welcome';
    welcome.innerHTML = `
      <div class="pw-trident">🔱</div>
      <p>Greetings. I am Poseidon — your chess guide on Chess-X. Ask me anything about openings, tactics, endgames, or chess history.</p>
    `;

    const chips = document.createElement('div');
    chips.className = 'poseidon-suggestions';
    SUGGESTIONS.forEach(s => {
      const chip = document.createElement('button');
      chip.className = 'poseidon-chip';
      chip.textContent = s;
      chip.addEventListener('click', () => {
        const input = document.getElementById('poseidon-input');
        if (input) {
          input.value = s;
          input.dispatchEvent(new Event('input'));
        }
        sendMessage(s);
      });
      chips.appendChild(chip);
    });

    welcome.appendChild(chips);
    msgs.appendChild(welcome);
  }

  // ── Toggle / Open / Close ─────────────────────────────────
  function togglePanel() {
    isOpen ? closePanel() : openPanel();
  }

  function openPanel() {
    isOpen = true;
    const panel = document.getElementById('poseidon-panel');
    const btn   = document.getElementById('poseidon-btn');
    if (panel) panel.classList.add('open');
    if (btn)   btn.setAttribute('aria-expanded', 'true');
    setTimeout(() => {
      const input = document.getElementById('poseidon-input');
      if (input) input.focus();
    }, 250);
  }

  function closePanel() {
    isOpen = false;
    const panel = document.getElementById('poseidon-panel');
    const btn   = document.getElementById('poseidon-btn');
    if (panel) panel.classList.remove('open');
    if (btn)   btn.setAttribute('aria-expanded', 'false');
  }

  // ── Reset conversation ────────────────────────────────────
  function resetConversation() {
    conversation = [];
    msgCount = 0;
    sessionStorage.setItem('poseidon-count', '0');
    const msgs = document.getElementById('poseidon-messages');
    if (msgs) {
      msgs.innerHTML = '';
      showWelcome();
    }
    const input = document.getElementById('poseidon-input');
    if (input) { input.value = ''; input.style.height = 'auto'; }
    const counter = document.getElementById('poseidon-char-count');
    if (counter) counter.textContent = `0 / ${MAX_CHARS}`;
    setSendState(false);
  }

  // ── Append message bubble ─────────────────────────────────
  function appendMessage(role, content) {
    const msgs = document.getElementById('poseidon-messages');
    if (!msgs) return;

    const wrap = document.createElement('div');
    wrap.className = `poseidon-msg ${role}`;

    const label = document.createElement('div');
    label.className = 'poseidon-msg-label';
    label.textContent = role === 'user' ? 'You' : 'Poseidon';

    const bubble = document.createElement('div');
    bubble.className = 'poseidon-msg-bubble';
    // Render line breaks from Poseidon
    bubble.innerHTML = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    if (role === 'assistant') {
      bubble.innerHTML = '<p>' + bubble.innerHTML + '</p>';
    }

    wrap.appendChild(label);
    wrap.appendChild(bubble);
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
    return bubble;
  }

  // ── Typing indicator ──────────────────────────────────────
  function showTyping() {
    const msgs = document.getElementById('poseidon-messages');
    if (!msgs) return null;
    const wrap = document.createElement('div');
    wrap.className = 'poseidon-msg assistant';
    wrap.id = 'poseidon-typing-wrap';

    const label = document.createElement('div');
    label.className = 'poseidon-msg-label';
    label.textContent = 'Poseidon';

    const dots = document.createElement('div');
    dots.className = 'poseidon-typing';
    dots.innerHTML = '<span></span><span></span><span></span>';

    wrap.appendChild(label);
    wrap.appendChild(dots);
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
    return wrap;
  }

  function hideTyping() {
    const el = document.getElementById('poseidon-typing-wrap');
    if (el) el.remove();
  }

  // ── Send state ────────────────────────────────────────────
  function setSendState(loading) {
    isLoading = loading;
    const btn   = document.getElementById('poseidon-send');
    const input = document.getElementById('poseidon-input');
    if (btn) {
      btn.disabled  = loading;
      btn.textContent = loading ? '…' : 'Send';
    }
    if (input) input.disabled = loading;
  }

  // ── Send message ──────────────────────────────────────────
  async function sendMessage(overrideText) {
    if (isLoading) return;

    const input   = document.getElementById('poseidon-input');
    const msgs    = document.getElementById('poseidon-messages');
    const text    = (overrideText || input?.value || '').trim();

    if (!text) return;
    if (text.length > MAX_CHARS) return;

    // Rate limit check
    if (msgCount >= MAX_MESSAGES) {
      if (msgs && !msgs.querySelector('.poseidon-limit')) {
        const lim = document.createElement('div');
        lim.className = 'poseidon-limit';
        lim.textContent = `You've reached the session limit of ${MAX_MESSAGES} messages. Click ↺ to start a new conversation.`;
        msgs.appendChild(lim);
        msgs.scrollTop = msgs.scrollHeight;
      }
      return;
    }

    // Clear input
    if (input) {
      input.value = '';
      input.style.height = 'auto';
      const counter = document.getElementById('poseidon-char-count');
      if (counter) counter.textContent = `0 / ${MAX_CHARS}`;
    }

    // Remove welcome screen on first message
    const welcome = msgs?.querySelector('.poseidon-welcome');
    if (welcome) welcome.remove();

    // Add user message
    appendMessage('user', text);
    conversation.push({ role: 'user', content: text });
    msgCount++;
    sessionStorage.setItem('poseidon-count', String(msgCount));

    // Show typing
    setSendState(true);
    const typingEl = showTyping();

    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversation })
      });

      hideTyping();

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${res.status}`);
      }

      const data = await res.json();
      const reply = data.reply || 'I could not generate a response. Please try again.';

      appendMessage('assistant', reply);
      conversation.push({ role: 'assistant', content: reply });

    } catch (err) {
      hideTyping();
      console.error('Poseidon error:', err);

      const msgs = document.getElementById('poseidon-messages');
      if (msgs) {
        const errWrap = document.createElement('div');
        errWrap.className = 'poseidon-msg assistant';

        const label = document.createElement('div');
        label.className = 'poseidon-msg-label';
        label.textContent = 'Poseidon';

        const errBubble = document.createElement('div');
        errBubble.className = 'poseidon-error';
        errBubble.textContent = 'The tides are troubled — I could not reach the server. Please check your connection and try again.';

        errWrap.appendChild(label);
        errWrap.appendChild(errBubble);
        msgs.appendChild(errWrap);
        msgs.scrollTop = msgs.scrollHeight;

        // Remove failed user message from conversation so they can retry
        conversation.pop();
      }
    } finally {
      setSendState(false);
      if (input) input.focus();
    }
  }

  // ── Close on Escape ───────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closePanel();
  });

  // ── Init ──────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildWidget);
  } else {
    buildWidget();
  }

})();
