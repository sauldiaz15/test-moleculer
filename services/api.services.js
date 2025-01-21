const ApiGateway = require("moleculer-web");

module.exports = {
  name: "api",
  mixins: [ApiGateway],

  settings: {
    port: 3000, // Cambia el puerto si lo necesitas
    routes: [
      {
        path: "/api",
        whitelist: ["hello.*"],
        mappingPolicy: "all",
        bodyParsers: {
          json: true,
          urlencoded: { extended: true},
        },
      },
    ],
  },
};
