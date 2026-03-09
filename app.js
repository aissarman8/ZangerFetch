/* ============================================================
   ZANGER AI — app.js
   Language toggle, scroll animations, stats counter, chat + Gemini AI
============================================================ */

// ── State ──────────────────────────────────────────────────
let currentLang = 'ru';

// ── Gemini System Prompt ────────────────────────────────────
const SYSTEM_PROMPT = `Ты — строгий, высокопрофессиональный юрист из Республики Казахстан. Твоё имя Zetef (ZF).
Твоя задача — давать максимально сжатые, сухие ответы строго по фактам и законам РК.

Твои правила общения:
1. НИКАКОЙ ВОДЫ. Отвечай коротко, структурированно и только по делу.
2. НИКОГДА не выдавай окончательный план действий сразу, если ситуация описана в общих чертах. Сначала задай 1-2 конкретных уточняющих вопроса, чтобы вытянуть из пользователя важные детали.
3. Иногда (не в каждом сообщении, но к месту) позволяй себе легкий, интеллигентный сарказм — например, по поводу того, что люди не читают договоры перед подписанием, или по поводу бюрократии. Но не переходи на грубость.
4. Отвечай на том же языке, на котором пишет пользователь (русский или казахский).
5. Если даешь ответ, обязательно ссылайся на точные статьи законов РК (статьи, новости, налоговый кодекс, Конституция и так далее).
6. Обязательно добавляй в конце дисклеймер: "P.S. Это информационная консультация, а не официальное юридическое заключение.`;

// ── Language Data ───────────────────────────────────────────
const chatPlaceholders = {
  ru: 'Опишите вашу ситуацию...',
  kz: 'Жағдайыңызды сипаттаңыз...'
};

const chatStatusText = {
  ru: 'Онлайн · Готов к консультации',
  kz: 'Желіде · Кеңесуге дайын'
};

// Mock AI scenario responses
const scenarios = {
  fired: {
    user: {
      ru: 'Меня уволили без предупреждения. Это законно?',
      kz: 'Мені ескертусіз жұмыстан шығарды. Бұл заңды ма?'
    },
    ai: {
      ru: `Согласно <strong>ст. 52 Трудового кодекса РК</strong>, работодатель обязан предупредить работника об увольнении <strong>за 1 месяц</strong> по инициативе работодателя. Увольнение без предупреждения является нарушением.

📌 <strong>Ваши права:</strong>
• Требовать восстановления на работе (ст. 181 ТК)
• Получить компенсацию за вынужденный прогул
• Обратиться в инспекцию труда в течение <strong>3 месяцев</strong>

Я могу сгенерировать жалобу в Государственную инспекцию труда прямо сейчас.`,
      kz: `<strong>ҚР Еңбек кодексінің 52-бабына</strong> сәйкес, жұмыс беруші жұмысшыны жұмыстан шығармас бұрын <strong>1 ай бұрын</strong> ескертуі тиіс. Ескертусіз жұмыстан шығару заң бұзушылық болып табылады.

📌 <strong>Сіздің құқықтарыңыз:</strong>
• Жұмысқа қалпына келтіруді талап ету (ТК 181-бабы)
• Мәжбүрлі босқа уақыт үшін өтемақы алу
• <strong>3 ай</strong> ішінде еңбек инспекциясына жүгіну

Мемлекеттік еңбек инспекциясына шағымды дәл қазір жасай аламын.`
    },
    cite: 'ТК РК ст. 52, 181'
  },
  tax: {
    user: {
      ru: 'Какой налоговый режим выбрать для моего ТОО?',
      kz: 'ЖШС-ым үшін қандай салықтық режим таңдау керек?'
    },
    ai: {
      ru: `На основе <strong>Налогового кодекса РК</strong>, выбор режима зависит от двух ключевых факторов:

🔹 <strong>Упрощённая декларация</strong> (ст. 683 НК): если доход до <strong>24 038 МРП/год</strong> и не более 30 сотрудников
🔹 <strong>Общеустановленный режим</strong>: при превышении порогов или работе с НДС-плательщиками

📌 <strong>Порог регистрации в качестве плательщика НДС:</strong> <strong>20 000 МРП</strong> за 12 месяцев (ст. 82 НК РК).

Укажите ваш ожидаемый годовой доход — дам точную рекомендацию.`,
      kz: `<strong>ҚР Салық кодексіне</strong> сай, режим таңдау екі негізгі факторға байланысты:

🔹 <strong>Жеңілдетілген декларация</strong> (СК 683-бабы): жылдық кіріс <strong>24 038 АЕК</strong>-ке дейін және 30-дан аз қызметкер болса
🔹 <strong>Жалпы белгіленген режим</strong>: шектерден асып кетсе немесе ҚҚС төлеушілермен жұмыс істесеңіз

📌 <strong>ҚҚС төлеуші ретінде тіркелу шегі:</strong> 12 айда <strong>20 000 АЕК</strong> (ҚР СК 82-бабы).

Күтілетін жылдық кірісіңізді айтыңыз — нақты ұсыныс беремін.`
    },
    cite: 'НК РК ст. 82, 683'
  },
  rent: {
    user: {
      ru: 'Арендодатель не возвращает мой депозит. Что делать?',
      kz: 'Жалға беруші депозитімді қайтармайды. Не істеу керек?'
    },
    ai: {
      ru: `По <strong>ст. 556 Гражданского кодекса РК</strong>, арендодатель обязан вернуть залоговый депозит в течение <strong>3 рабочих дней</strong> после расторжения договора при отсутствии ущерба.

📌 <strong>Ваши действия:</strong>
1️⃣ Направьте <strong>письменную претензию</strong> арендодателю с указанием срока возврата
2️⃣ При отказе — обратитесь в <strong>суд по месту жительства</strong> (госпошлина 1% от суммы)
3️⃣ Потребуйте <strong>пеню 0.1% в день</strong> за просрочку возврата

Могу подготовить претензионное письмо прямо сейчас.`,
      kz: `<strong>ҚР АК 556-бабына</strong> сай, жалға беруші залогтық депозитті залал болмаса шарт бұзылғаннан кейін <strong>3 жұмыс күні</strong> ішінде қайтаруға міндетті.

📌 <strong>Іс-қимылдарыңыз:</strong>
1️⃣ Жалға берушіге қайтару мерзімін көрсетіп <strong>жазбаша талап хат</strong> жіберіңіз
2️⃣ Бас тартқан жағдайда — <strong>тұрғылықты жер бойынша сотқа</strong> жүгініңіз (1% мемлекеттік баж салығы)
3️⃣ Кешіктіру үшін күніне <strong>0,1% тұрақсыздық айыбын</strong> талап етіңіз

Талап хатты дәл қазір дайындай аламын.`
    },
    cite: 'ГК РК ст. 556'
  },
  consumer: {
    user: {
      ru: 'Как вернуть некачественный товар?',
      kz: 'Сапасыз тауарды қалай қайтаруға болады?'
    },
    ai: {
      ru: `Согласно <strong>Закону РК «О защите прав потребителей»</strong> (ст. 28), вы имеете право вернуть товар ненадлежащего качества в течение <strong>30 дней</strong> и потребовать:

✅ Полного возврата стоимости, или
✅ Замены на аналогичный товар надлежащего качества, или
✅ Соразмерного снижения цены

📌 <strong>Гарантийный срок по умолчанию:</strong> 1 год (ст. 30 Закона о ЗПП)

<strong>Алгоритм действий:</strong>
1. Напишите претензию продавцу — срок ответа <strong>10 дней</strong>
2. При отказе — жалоба в Комитет по защите прав потребителей или суд

Составлю претензию за 30 секунд. Укажите наименование товара и дату покупки.`,
      kz: `<strong>ҚР «Тұтынушылар құқықтарын қорғау туралы» заңына</strong> (28-бап) сай, сапасыз тауарды <strong>30 күн</strong> ішінде қайтарып, мыналарды талап ете аласыз:

✅ Толық құнын қайтару, немесе
✅ Сапалы ұқсас тауарға ауыстыру, немесе
✅ Бағаны пропорционалды төмендету

📌 <strong>Әдепкі кепілдік мерзімі:</strong> 1 жыл (ТҚЗ заңының 30-бабы)

<strong>Іс-қимыл алгоритмі:</strong>
1. Сатушыға талап жазыңыз — жауап мерзімі <strong>10 күн</strong>
2. Бас тартқан жағдайда — тұтынушылар комитетіне немесе сотқа шағым

30 секундта талап дайындаймын. Тауар атауын және сатып алу күнін көрсетіңіз.`
    },
    cite: 'Закон о ЗПП ст. 28, 30'
  }
};

const customResponse = {
  ru: 'Ваш запрос принят. Zanger AI анализирует базу законодательства РК по вашей ситуации... Для наиболее точного ответа уточните детали — например, дату события, участвующие стороны и желаемый исход.',
  kz: 'Сұрағыңыз қабылданды. Zanger AI жағдайыңыз бойынша ҚР заңнамасы дерекқорын талдауда... Дәлірек жауап үшін мәліметтерді нақтылаңыз — мысалы, оқиға күні, тараптар және қалаған нәтиже.'
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

  // Update all elements with data-ru / data-kz
  document.querySelectorAll('[data-ru][data-kz]').forEach(el => {
    const val = el.getAttribute(`data-${lang}`);
    if (!val) return;
    if (el.tagName === 'INPUT') {
      el.placeholder = val;
    } else {
      el.innerHTML = val;
    }
  });

  // Chat placeholder
  const input = document.getElementById('chatInput');
  if (input) input.placeholder = chatPlaceholders[lang];

  // Chat status
  const status = document.querySelector('.chat-status');
  if (status) {
    const val = status.getAttribute(`data-${lang}`);
    if (val) status.textContent = val;
  }

  // Welcome message
  const welcome = document.getElementById('welcomeMsg');
  if (welcome) welcome.innerHTML = welcome.getAttribute(`data-${lang}`) || welcome.innerHTML;
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
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = Math.round(eased * target);
      el.textContent = target >= 1000 ? value.toLocaleString('ru-RU') : value + '+';
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target >= 1000 ? target.toLocaleString('ru-RU') + '+' : target + '+';
    }

    requestAnimationFrame(update);
  });
}

// ── Chat ────────────────────────────────────────────────────
function initChat() {
  const sendBtn = document.getElementById('chatSend');
  const input = document.getElementById('chatInput');

  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleSend();
  });
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
      appendAiMessage(escapeHtml(reply).replace(/\n/g, '<br>'), null);
    })
    .catch(err => {
      removeTyping();
      const errMsg = currentLang === 'ru'
        ? `⚠️ Ошибка: ${err.message}`
        : `⚠️ Қате: ${err.message}`;
      appendAiMessage(errMsg, null);
    });
}

function initScenarioButtons() {
  document.querySelectorAll('.scenario-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const key = btn.getAttribute('data-scenario');
      const scenario = scenarios[key];
      if (!scenario) return;

      clearChat();
      appendUserMessage(scenario.user[currentLang]);
      showTyping(() => {
        appendAiMessage(scenario.ai[currentLang], scenario.cite);
      });

      // Scroll demo into view
      document.getElementById('demo').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function clearChat() {
  const messages = document.getElementById('chatMessages');
  messages.innerHTML = '';
}

function appendUserMessage(text) {
  const messages = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'msg user';
  div.innerHTML = `
    <div class="msg-avatar">👤</div>
    <div>
      <div class="msg-bubble">${escapeHtml(text)}</div>
      <div class="msg-meta">${currentLang === 'ru' ? 'Вы · сейчас' : 'Сіз · қазір'}</div>
    </div>
  `;
  messages.appendChild(div);
  scrollToBottom(messages);
}

function showTyping(callback) {
  const messages = document.getElementById('chatMessages');
  const typing = document.createElement('div');
  typing.className = 'msg ai';
  typing.id = 'typingIndicator';
  typing.innerHTML = `
    <div class="msg-avatar">⚖️</div>
    <div class="msg-bubble" style="padding:0.6rem 1rem;">
      <div class="typing-indicator">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  messages.appendChild(typing);
  scrollToBottom(messages);

  const delay = 1200 + Math.random() * 800;
  setTimeout(() => {
    typing.remove();
    callback();
  }, delay);
}

function appendAiMessage(html, cite) {
  const messages = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'msg ai';
  div.innerHTML = `
    <div class="msg-avatar">⚖️</div>
    <div>
      <div class="msg-bubble">
        ${html}
        ${cite ? `<div style="margin-top:0.5rem;"><span class="law-cite">📖 ${cite}</span></div>` : ''}
      </div>
      <div class="msg-meta">Zanger AI · ${currentLang === 'ru' ? 'сейчас' : 'қазір'}</div>
    </div>
  `;
  messages.appendChild(div);
  scrollToBottom(messages);
}

function scrollToBottom(el) {
  el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function callGemini(userMessage) {
  // Теперь обращаемся к нашему безопасному посреднику
  const res = await fetch('/api/chat', { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userMessage: userMessage,
      systemPrompt: SYSTEM_PROMPT
    })
  });

  if (!res.ok) throw new Error(`Ошибка: ${res.status}`);

  const data = await res.json();
  console.log("Ответ от сервера:", data);
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Пустой ответ от API');
  return text;
}

// ── Async typing helpers ────────────────────────────────────────────────────
function showTypingRaw() {
  const messages = document.getElementById('chatMessages');
  const el = document.createElement('div');
  el.className = 'msg ai';
  el.id = 'typingIndicator';
  el.innerHTML = `
    <div class="msg-avatar">⚖️</div>
    <div class="msg-bubble" style="padding:0.6rem 1rem;">
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



