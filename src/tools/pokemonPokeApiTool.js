import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import axios from 'axios';

const pokemonSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Название покемона не может быть пустым')
      .describe('Название покемона'),
  })
  .passthrough();

export const pokemonPokeApiTool = tool(
  async (input) => {
    console.log('Вызов pokemonPokeApiTool с входными данными:', input);

    let name;
    if (typeof input === 'string') {
      name = input;
    } else if (input && typeof input === 'object' && 'name' in input) {
      name = input.name;
    } else {
      return 'Ошибка: Неверный формат входных данных';
    }

    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`);
      const { types, height, weight } = response.data;
      const type = types.map((t) => t.type.name).join(', ');
      return `Покемон ${name}: тип - ${type}, рост - ${height * 10} см, вес - ${
        weight / 10
      } кг, источник: PokeAPI`;
    } catch (error) {
      console.log(error.message);
      return null;
    }
  },
  {
    name: 'pokemon_pokeapi_tool',
    description: 'Ищет информацию о покемоне через PokeAPI.',
    schema: pokemonSchema,
  },
);
