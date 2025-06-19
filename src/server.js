import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPokemonInfo } from './agent/index.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Обслуживание статических файлов
app.use(express.static(path.join(__dirname, '..', 'static')));
app.use(express.json());

// API-эндпоинт для поиска покемона
app.post('/api/pokemon', async (req, res) => {
  console.log('Запрос на поиск покемона:', req.body);
  
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Имя покемона обязательно' });
    }
    const result = await getPokemonInfo(name);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});