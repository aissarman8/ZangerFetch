export default async function handler(req, res) {
  // Проверяем, что запрос правильный
  if (req.method !== 'POST') return res.status(405).send('Метод не разрешен');

  const { userMessage, systemPrompt } = req.body;
  // Ключ теперь будет браться из скрытых настроек Vercel
  const apiKey = process.env.GEMINI_API_KEY; 

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  try {
    const googleRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 8192 }
      })
    });

    const data = await googleRes.json();
    res.status(200).json(data); // Отправляем ответ обратно на сайт
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
}export default async function handler(req, res) {
  // Проверяем, что запрос правильный
  if (req.method !== 'POST') return res.status(405).send('Метод не разрешен');

  const { userMessage, systemPrompt } = req.body;
  // Ключ теперь будет браться из скрытых настроек Vercel
  const apiKey = process.env.GEMINI_API_KEY; 

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  try {
    const googleRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 8192 }
      })
    });

    const data = await googleRes.json();
    res.status(200).json(data); // Отправляем ответ обратно на сайт
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
}