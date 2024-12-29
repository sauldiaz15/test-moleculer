const { Service } = require("moleculer");

module.exports = {
  name: "hello",

  actions: {
    sayHello: {
      rest: {
        method: "POST", // Permite solicitudes POST
        path: "/say-hello", // Ruta personalizada para la acción
      },
      params: {
        name: { type: "string" }, // Validación de parámetros
      },
      async handler(ctx) {
        const name = ctx.params.name;

        // Simulación de operación asíncrona
        await new Promise((resolve) => setTimeout(resolve, 1000));

        return `¡Hola, ${name}! Bienvenido a Moleculer.`;
      },
    },
  }, // Cierre de Actions
};

