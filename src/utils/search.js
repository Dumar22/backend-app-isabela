import { db } from '../models/index.js';

// Función genérica para buscar elementos en un modelo
export const searchElements = async (model, field, query) => {
  try {
    // Buscar los elementos que contengan el término de búsqueda en el campo especificado (ignorando mayúsculas y minúsculas)
    const elements = await model.findAll({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col(field)),
        'LIKE',
        `%${query.toLowerCase()}%`
      ),
    });

    return elements;
  } catch (error) {
    console.error(error);
    throw new Error(`Error al buscar elementos en el modelo ${model.name}.`);
  }
};
