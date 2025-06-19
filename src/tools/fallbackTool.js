import { z } from 'zod';
import { tool } from '@langchain/core/tools';

export const fallbackTool = tool(
  async ({ query }) => `Я не знаю информации о ${query}.`,
  {
    name: 'fallback_tool',
    description: 'Используется, если нет данных о покемоне',
    schema: z.object({ query: z.string() }),
  },
);
