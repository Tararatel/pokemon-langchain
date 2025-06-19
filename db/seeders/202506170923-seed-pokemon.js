/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const pokemons = [
      {
        name: 'pikachu',
        type: 'electric',
        height: 40, // в сантиметрах
        weight: 60, // в килограммах
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'bulbasaur',
        type: 'grass, poison',
        height: 70,
        weight: 69,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'charmander',
        type: 'fire',
        height: 60,
        weight: 85,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'squirtle',
        type: 'water',
        height: 50,
        weight: 90,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'jigglypuff',
        type: 'normal, fairy',
        height: 50,
        weight: 55,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'gastly',
        type: 'ghost, poison',
        height: 130,
        weight: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'eevee',
        type: 'normal',
        height: 30,
        weight: 65,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'snorlax',
        type: 'normal',
        height: 210,
        weight: 429,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'mewtwo',
        type: 'psychic',
        height: 200,
        weight: 1220,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'gengar',
        type: 'ghost, poison',
        height: 150,
        weight: 405,
        createdAt: now,
        updatedAt: now,
      },
    ];

    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkInsert('Pokemons', pokemons, { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Pokemons', null, {});
  },
};
