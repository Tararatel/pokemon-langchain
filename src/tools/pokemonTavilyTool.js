import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { TavilyClient } from 'tavily';

const pokemonSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Название покемона не может быть пустым')
      .describe('Название покемона'),
  })
  .passthrough();

export const pokemonTavilyTool = tool(
  async (input) => {
    console.log('Вызов pokemonTavilyTool с входными данными:', input);
    
    let name;
    if (typeof input === 'string') {
      name = input;
    } else if (input && typeof input === 'object' && 'name' in input) {
      name = input.name;
    } else {
      return 'Ошибка: Неверный формат входных данных';
    }

    try {
      const tavilyClient = new TavilyClient({ apiKey: process.env.TAVILY_API_KEY });
      const response = await tavilyClient.search(`Информация о покемоне ${name}`, {
        max_results: 3,
        include_raw_content: false,
        include_images: false,
      });

      const resultContent = response.results
        .map((r) => `${r.title}: ${r.content}`)
        .join('\n');
      return `Покемон ${name}: ${
        resultContent || 'Информация не найдена'
      }, источник: Tavily`;
    } catch (error) {
      return `Ошибка при поиске через Tavily для ${name}: ${error.message}`;
    }
  },
  {
    name: 'pokemon_tavily_tool',
    description: 'Ищет информацию о покемоне через Tavily Search API.',
    schema: pokemonSchema,
  },
);
