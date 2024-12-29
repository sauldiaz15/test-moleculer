const { ServiceBroker } = require("moleculer");
const ApiGateway = require("moleculer-web");  // Importar moleculer-web correctamente

// Crear el broker
const broker = new ServiceBroker({
  nodeID: "node-1",
  transporter: "NATS",
});

// Crear el servicio API Gateway
broker.createService(ApiGateway, {
  name: "api",  // Nombre del servicio
  settings: {
    port: 3000, // Puerto en el que se ejecutará el API Gateway
    routes: [
      {
        path: "/api", // Ruta de acceso
        whitelist: ["**"], // Todas las acciones están disponibles
        bodyParsers: {
          json: true,
          urlencoded: { extended: true },
        },
      },
    ],
  },
});

// Cargar el servicio "hello"
broker.loadService("./services/hello.service.js");
broker.loadService("./services/user.service.js");

// Iniciar el broker
broker.start();

