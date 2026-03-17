/* ============================================================
   ZANGER AI — app.js (ИСПРАВЛЕННАЯ И УЛУЧШЕННАЯ ВЕРСИЯ)
   Language toggle, scroll animations, stats counter, chat + Gemini AI
============================================================ */

// ── State ──────────────────────────────────────────────────
let currentLang = 'ru';
let chatHistory = [];

// ── Gemini System Prompt ────────────────────────────────────
const SYSTEM_PROMPT = `Ты — строгий, высокопрофессиональный юрист из Республики Казахстан. Твоё имя Zetef (ZF).
Твоя задача — давать максимально сжатые, сухие ответы строго по фактам и законам РК.

Твои правила общения:
1. НИКАКОЙ ВОДЫ. Отвечай коротко, структурированно и только по делу.
2. Если ситуация описана в общих чертах, сначала задай 1-2 конкретных уточняющих вопроса, чтобы вытянуть из пользователя важные детали для твоего дальнейшего анализа.
3. Иногда (не в каждом сообщении, но к месту) позволяй себе легкий, интеллигентный сарказм — например, по поводу того, что люди не читают договоры перед подписанием, или по поводу бюрократии. Но не переходи на грубость.
4. Отвечай на том же языке, на котором пишет пользователь (русский или казахский).
5. Если даешь ответ, обязательно ссылайся на точные статьи законов РК (статьи, новости, налоговый кодекс, Конституция и так далее).
6. Добавляй фразу "P.S. Это информационная консультация, а не юридическое заключение." ТОЛЬКО если ты даешь юридическую оценку ситуации, ссылаешься на законы или предлагаешь алгоритм действий. Если ты просто здороваешься, ведешь светскую беседу или задаешь уточняющие вопросы (без юридических выводов), писать эту фразу НЕ НУЖНО.`;

// ── Language Data ───────────────────────────────────────────
const chatPlaceholders = {
  ru: 'Опишите вашу ситуацию...',
  kz: 'Жағдайыңызды сипаттаңыз...'
};

const chatStatusText = {
  ru: 'Онлайн · Готов к консультации',
  kz: 'Желіде · Кеңесуге дайын'
};

// Сценарии
const scenarios = {
  fired: {
    user: {
      ru: 'Меня уволили без предупреждения. Это законно?',
      kz: 'Мені ескертусіз жұмыстан шығарды. Бұл заңды ма?'
    }
  },
  tax: {
    user: {
      ru: 'Какой налоговый режим выбрать для моего ТОО?',
      kz: 'ЖШС-ым үшін қандай салықтық режим таңдау керек?'
    }
  },
  rent: {
    user: {
      ru: 'Арендодатель не возвращает мой депозит. Что делать?',
      kz: 'Жалға беруші депозитімді қайтармайды. Не істеу керек?'
    }
  },
  consumer: {
    user: {
      ru: 'Как вернуть некачественный товар?',
      kz: 'Сапасыз тауарды қалай қайтаруға болады?'
    }
  }
};

// ── DOM Ready ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initLangToggle();
  initModuleTabs();
  initScrollReveal();
  initStatsCounter();
  initChat();
  initScenarioButtons();
});

// ── Navbar scroll effect ────────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

// ── Language Toggle ─────────────────────────────────────────
function initLangToggle() {
  const btnRU = document.getElementById('btnRU');
  const btnKZ = document.getElementById('btnKZ');

  btnRU.addEventListener('click', () => setLang('ru'));
  btnKZ.addEventListener('click', () => setLang('kz'));
}

function setLang(lang) {
  currentLang = lang;
  document.getElementById('btnRU').classList.toggle('active', lang === 'ru');
  document.getElementById('btnKZ').classList.toggle('active', lang === 'kz');

  document.querySelectorAll('[data-ru][data-kz]').forEach(el => {
    const val = el.getAttribute(`data-${lang}`);
    if (!val) return;
    if (el.tagName === 'INPUT') {
      el.placeholder = val;
    } else {
      el.innerHTML = val;
    }
  });

  const input = document.getElementById('chatInput');
  if (input) input.placeholder = chatPlaceholders[lang];

  const status = document.querySelector('.chat-status');
  if (status) {
    const val = status.getAttribute(`data-${lang}`);
    if (val) status.textContent = val;
  }
}

// ── Module Tabs ─────────────────────────────────────────────
function initModuleTabs() {
  document.querySelectorAll('.module-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const panel = tab.getAttribute('data-panel');

      document.querySelectorAll('.module-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.module-panel').forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const activePanel = document.getElementById(`panel-${panel}`);
      if (activePanel) {
        activePanel.classList.add('active');
        revealPanel(activePanel);
      }
    });
  });
}

// ── Scroll Reveal ───────────────────────────────────────────
let revealObserver;

function initScrollReveal() {
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

function revealPanel(panel) {
  panel.querySelectorAll('.reveal').forEach((el, i) => {
    el.classList.remove('visible');
    setTimeout(() => el.classList.add('visible'), 60 + i * 90);
  });
}

// ── Animated Stats Counter ──────────────────────────────────
function initStatsCounter() {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        statsObserver.disconnect();
      }
    });
  }, { threshold: 0.5 });

  const statsSection = document.getElementById('stats');
  if (statsSection) statsObserver.observe(statsSection);
}

function animateCounters() {
  document.querySelectorAll('[data-target]').forEach(el => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1800;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * target);
      el.textContent = target >= 1000 ? value.toLocaleString('ru-RU') : value + '+';
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target >= 1000 ? target.toLocaleString('ru-RU') + '+' : target + '+';
    }

    requestAnimationFrame(update);
  });
}

// ── УТИЛИТА: Markdown Форматирование ────────────────────────
function formatMarkdown(text) {
  let html = text;
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Жирный
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>'); // Курсив
  html = html.replace(/^\* (.*$)/gim, '• $1'); // Списки (*)
  html = html.replace(/^\- (.*$)/gim, '• $1'); // Списки (-)
  html = html.replace(/\n/g, '<br>'); // Переносы строк
  return html;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Chat ────────────────────────────────────────────────────
function initChat() {
  const sendBtn = document.getElementById('chatSend');
  const input = document.getElementById('chatInput');

  if(sendBtn && input) {
    sendBtn.addEventListener('click', handleSend);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); 
        handleSend();       
      }
    });
  }
}

function handleSend() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;
  
  appendUserMessage(text);
  input.value = '';

  showTypingRaw();
  callGemini(text)
    .then(reply => {
      removeTyping();
      // Экранируем HTML для безопасности, затем форматируем Markdown в красивые теги
      const safeText = escapeHtml(reply);
      const formattedReply = formatMarkdown(safeText);
      appendAiMessage(formattedReply);
    })
    .catch(err => {
      removeTyping();
      const errMsg = currentLang === 'ru'
        ? `⚠️ Ошибка соединения с сервером.`
        : `⚠️ Сервермен байланыс қатесі.`;
      appendAiMessage(errMsg);
    });
}

// Кнопки сценариев просто подставляют текст
function initScenarioButtons() {
  document.querySelectorAll('.scenario-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const key = btn.getAttribute('data-scenario');
      const scenario = scenarios[key];
      if (!scenario) return;

      const chatInput = document.getElementById('chatInput');
      chatInput.value = scenario.user[currentLang];
      chatInput.focus();
    });
  });
}

function clearChat() {
  const messages = document.getElementById('chatMessages');
  if(messages) messages.innerHTML = '';
  chatHistory = []; 
}

// НОВЫЙ ДИЗАЙН: Сообщение пользователя (справа, синее)
function appendUserMessage(text) {
  const messages = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'msg user';
  
  const now = new Date();
  const timeString = now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
  const author = currentLang === 'ru' ? 'Вы' : 'Сіз';

  div.innerHTML = `
    <div style="margin-left: auto; text-align: right; width: 100%; display: flex; flex-direction: column; align-items: flex-end;">
        <div class="msg-bubble" style="background: #2563eb; color: #fff; border-bottom-right-radius: 4px; border-bottom-left-radius: 12px; border-top-left-radius: 12px; border-top-right-radius: 12px; display: inline-block; text-align: left;">${escapeHtml(text)}</div>
        <div class="msg-meta" style="justify-content: flex-end;">${author} · ${timeString}</div>
    </div>
  `;
  messages.appendChild(div);
  scrollToBottom(messages);
}

// НОВЫЙ ДИЗАЙН: Сообщение бота (слева, светлое)
function appendAiMessage(htmlText) {
  const messages = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'msg ai';

  const now = new Date();
  const timeString = now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();

  div.innerHTML = `
    <div class="msg-avatar" style="background: #eff6ff; border: 1px solid #bfdbfe;">⚖️</div>
    <div>
        <div class="msg-bubble" style="box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
          ${htmlText}
        </div>
        <div class="msg-meta">Zetef (ZF) · ${timeString}</div>
    </div>
  `;
  messages.appendChild(div);
  scrollToBottom(messages);
}

function showTypingRaw() {
  const messages = document.getElementById('chatMessages');
  const el = document.createElement('div');
  el.className = 'msg ai';
  el.id = 'typingIndicator';
  el.innerHTML = `
    <div class="msg-avatar" style="background: #eff6ff; border: 1px solid #bfdbfe;">⚖️</div>
    <div class="msg-bubble" style="box-shadow: 0 2px 5px rgba(0,0,0,0.05); padding:0.6rem 1rem;">
      <div class="typing-indicator"><span></span><span></span><span></span></div>
    </div>
  `;
  messages.appendChild(el);
  scrollToBottom(messages);
}

function removeTyping() {
  const t = document.getElementById('typingIndicator');
  if (t) t.remove();
}

function scrollToBottom(el) {
  el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
}

// ── API Call ────────────────────────────────────────────────
async function callGemini(userMessage) {
  chatHistory.push({ role: 'user', parts: [{ text: userMessage }] });

  const res = await fetch('/api/chat', { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      history: chatHistory, 
      systemPrompt: SYSTEM_PROMPT
    })
  });

  if (!res.ok) throw new Error(`Ошибка: ${res.status}`);

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Пустой ответ от API');

  chatHistory.push({ role: 'model', parts: [{ text: text }] });

  return text;
}
