const { Service } = require("moleculer");
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

module.exports = {
  name: "user",

  actions: {
    // Crear un usuario (no requiere autenticación)
    async create(ctx) {
      const { username, email, password } = ctx.params;

      try {
        const user = await prisma.user.create({
          data: {
            username,
            email,
            password, // Ya cifrada en el servicio de autenticación
          },
        });

        return user;
      } catch (error) {
        throw new Error("Error al crear el usuario: " + error.message);
      }
    },

    // Encontrar un usuario por email (no requiere autenticación)
    async findByEmail(ctx) {
      const { email } = ctx.params;

      try {
        const user = await prisma.user.findUnique({
          where: { email },
        });

        return user;
      } catch (error) {
        throw new Error("Error al buscar el usuario: " + error.message);
      }
    },

    // Listar todos los usuarios (requiere autenticación)
    async listUsers(ctx) {
      try {
        const users = await prisma.user.findMany();
        return users;
      } catch (error) {
        throw new Error("Error al listar los usuarios: " + error.message);
      }
    },

    // Obtener un usuario por ID (requiere autenticación)
    async getUserInfo(ctx) {
      const { id } = ctx.params;

      try {
        const user = await prisma.user.findUnique({
          where: { id: Number(id) },
        });

        return user;
      } catch (error) {
        throw new Error("Error al obtener el usuario: " + error.message);
      }
    },
  },
};
