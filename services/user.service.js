const { Service } = require("moleculer");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = {
  name: "user",

  actions: {
    // Crear un usuario
    async createUser(ctx) {
      const { username, email } = ctx.params;

      const user = await prisma.user.create({
        data: {
          username,
          email,
        },
      });

      return user;
    },

    // Obtener un usuario por ID
    async getUser(ctx) {
      const { id } = ctx.params;

      const user = await prisma.user.findUnique({
        where: { id: Number(id) },
      });

      return user;
    },

    // Listar todos los usuarios
    async listUsers(ctx) {
      const users = await prisma.user.findMany();

      return users;
    },


    // Eliminar un usuario
    async deleteUser(ctx) {
      const { id } = ctx.params;

      const user = await prisma.user.delete({
        where: { id: Number(id) },
      });

      return user;
    },
  },
};
