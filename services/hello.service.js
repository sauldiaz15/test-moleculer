// const { Service } = require("moleculer");

// module.exports = {
//   name: "hello",

//   actions: {
//     sayHello: {
//       rest: {
//         method: "POST", // Permite solicitudes POST
//         path: "/say-hello", // Ruta personalizada para la acción
//       },
//       params: {
//         name: { type: "string" }, // Validación de parámetros
//       },
//       async handler(ctx) {
//         const name = ctx.params.name;

//         // Simulación de operación asíncrona
//         await new Promise((resolve) => setTimeout(resolve, 1000));

//         return `¡Hola, ${name}! Bienvenido a Moleculer.`;
//       },
//     },
//   }, // Cierre de Actions
// };

const { Service } = require("moleculer");

// Define un mixin como ejemplo (puedes eliminarlo si no lo necesitas)
const commonMixin = {
  methods: {
    greet(name) {
      return `¡Hola, ${name}! Este es un saludo común desde el mixin.`;
    },
  },
};

module.exports = {
  name: "hello",
  mixins: [commonMixin], // Usamos `mixins` para aplicar funcionalidades compartidas

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

        // Usa el método del mixin como ejemplo
        const commonGreeting = this.greet(name);

        // Simulación de operación asíncrona
        await new Promise((resolve) => setTimeout(resolve, 1000));

        return `${commonGreeting} Bienvenido a Moleculer.`;
      },
    },
  }, // Cierre de Actions
};
