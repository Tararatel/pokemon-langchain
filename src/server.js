/* eslint-disable no-await-in-loop */
import 'dotenv/config';
import db from '../db/models/index.js';
import { getPokemonInfo } from './agent/index.js';

async function main() {
  try {
    await db.sequelize.sync();

    const names = ['Pikachu', 'пикачу', 'питачу', 'Ипкчу', 'Диглетт', 'Эрбок', 'Джигlipuf'];
    for (const name of names) {
      console.log(`Запрашиваю информацию о покемоне: ${name}`);
      await getPokemonInfo(name);
    }
  } catch (error) {
    console.error('Ошибка при запуске:', error.message, error.stack);
  }
}

main();
