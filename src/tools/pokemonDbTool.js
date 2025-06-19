import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import db from '../../db/models/index.js';

const { Pokemon } = db;

// Схема для инструмента
const pokemonSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Название покемона не может быть пустым')
      .describe('Название покемона'),
  })
  .passthrough();

export const pokemonDbTool = tool(
  async (input) => {
    console.log('Вызов pokemonDbTool с входными данными:', input);

    let name;
    if (typeof input === 'string') {
      name = input;
    } else if (input && typeof input === 'object' && 'name' in input) {
      name = input.name;
    } else {
      return 'Ошибка: Неверный формат входных данных';
    }

    try {
      // Прямой поиск в базе данных с использованием нормализованного имени
      const pokemon = await Pokemon.findOne({ where: { name } });
      if (pokemon) {
        return `Покемон ${name}: тип - ${pokemon.type}, рост - ${pokemon.height} см, вес - ${pokemon.weight} кг, источник: база данных`;
      }

      return null; // Не найдено, передаём управление следующему инструменту
    } catch (error) {
      return `Ошибка при поиске в базе для ${name}: ${error.message}`;
    }
  },
  {
    name: 'pokemon_db_tool',
    description: 'Ищет информацию о покемоне в локальной базе данных.',
    schema: pokemonSchema,
  },
);
