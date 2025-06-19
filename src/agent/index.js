import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { GigaChat } from 'langchain-gigachat';
import { ChatOllama } from '@langchain/ollama';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { Agent } from 'node:https';
import { MemorySaver } from '@langchain/langgraph';
import { pokemonDbTool } from '../tools/pokemonDbTool.js';
import { pokemonPokeApiTool } from '../tools/pokemonPokeApiTool.js';
import { pokemonTavilyTool } from '../tools/pokemonTavilyTool.js';
import { fallbackTool } from '../tools/fallbackTool.js';
import { StateGraph } from '@langchain/langgraph';
import { z } from 'zod';

// Настройка HTTPS-агента
const httpsAgent = new Agent({
  rejectUnauthorized: false,
});

process.env.LANGSMITH_TRACING = 'true';
process.env.LANGSMITH_API_KEY = process.env.LANGSMITH_API_KEY || '<YOUR-LANGSMITH-API-KEY>';
process.env.LANGSMITH_ENDPOINT = 'https://api.smith.langchain.com';
process.env.LANGSMITH_PROJECT = 'PokemonGraph';

const localModel = new ChatOllama({
  model: 'llama3.1:8b',
  baseUrl: 'http://localhost:11434',
  maxRetries: 2,
  temperature: 0.1,
});

// Функция нормализации имени с помощью локальной модели
async function normalizePokemonName(rawName) {
  console.log(`Попытка нормализации имени: ${rawName}`);
  const prompt = new SystemMessage(
    `Ты помощник, который нормализует имена покемонов. 
     - Принимай имя на любом языке (русский, английский) или с опечатками.
     - Исправляй опечатки и транслитерируй русские имена в латиницу (например, "пикачу" → "pikachu", "питачу" → "pikachu").
     - Возвращай только нормализованное имя в нижнем регистре (например, "pikachu").
     - Не добавляй лишний текст.`,
  );
  const response = await localModel.invoke([
    prompt,
    new HumanMessage(`Нормализуй: ${rawName}`),
  ]);
  return response.content.trim().toLowerCase();
}

// Инициализация модели GigaChat как основного агента
const agentModel = new GigaChat({
  credentials: process.env.GIGACHAT_KEY,
  model: 'GigaChat-2',
  httpsAgent,
});

// Инициализация инструментов
const agentTools = [pokemonDbTool, pokemonPokeApiTool, pokemonTavilyTool, fallbackTool];

// Определение схемы состояния с помощью Zod
const AgentStateSchema = z.object({
  messages: z.array(z.any()), // Массив сообщений
  normalizedName: z.string().optional(), // Нормализованное имя покемона, необязательное поле
});

// Создание графа с прямой передачей схемы
const workflow = new StateGraph(AgentStateSchema)
  .addNode('normalize', async (state) => {
    const rawName = state.messages[state.messages.length - 1].content.split(' ').pop();
    const normalizedName = await normalizePokemonName(rawName);
    return { ...state, normalizedName };
  })
  .addNode('agent', async (state) => {
    const result = await createReactAgent({
      llm: agentModel,
      tools: agentTools,
      checkpointSaver: new MemorySaver(),
    }).invoke(
      {
        messages: [
          new SystemMessage(
            `Ты ассистент, предоставляющий информацию о покемонах. Используй нормализованное имя: "${state.normalizedName}". Следуй алгоритму:
            1. Используй pokemon_db_tool с {"name": "${state.normalizedName}"}.
            2. Если null или ошибка, используй pokemon_pokeapi_tool с {"name": "${state.normalizedName}"}.
            3. Если null или ошибка, используй pokemon_tavily_tool с {"name": "${state.normalizedName}"}.
            4. Если null или ошибка, используй fallback_tool с {"query": "${state.normalizedName}"}.
            Формат ответа: "Покемон [имя]: [информация], источник: [источник]".`,
          ),
          new HumanMessage(`Какая информация о покемоне ${state.normalizedName}`),
        ],
      },
      { configurable: { thread_id: Math.random().toString() } },
    );
    return { ...state, messages: result.messages };
  })
  .addEdge('normalize', 'agent')
  .setEntryPoint('normalize')

const app = workflow.compile();

export async function getPokemonInfo(name) {
  try {
    const result = await app.invoke({
      messages: [new HumanMessage(`Какая информация о покемоне ${name}`)],
    });
    const finalMessage = result.messages[result.messages.length - 1].content;
    console.log('Ответ графа:', finalMessage);
    return finalMessage;
  } catch (error) {
    return `Ошибка при получении информации о покемоне ${name}: ${error.message}`;
  }
}