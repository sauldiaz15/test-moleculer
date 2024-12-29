const { Service } = require("moleculer");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = {
  name: "user",

  actions: {
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

    async getUser(ctx) {
      const { id } = ctx.params;

      const user = await prisma.user.findUnique({
        where: { id: Number(id) },
      });

      return user;
    },
  },
};
