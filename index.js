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
        aliases: {
          "POST /register": "auth.register",  // Ruta para registrar un usuario
          "POST /login": "auth.login",        // Ruta para autenticar un usuario
          "POST /user-info": "auth.getUserInfo", // Ruta para obtener la info del usuario autenticado
        },
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

broker.createService(require("./services/authService")); // Servicio de autenticación
// Iniciar el broker
broker.start();


// const { ServiceBroker } = require("moleculer");

// // Crear broker
// const broker = new ServiceBroker({
//     logger: console,
//     transporter: "NATS", // Puedes cambiar el transportador según tu configuración
// });

// // Cargar servicios
// broker.loadService("./services/hello.service.js");
// broker.loadService("./services/user.service.js");

// // Iniciar el broker y llamar al servicio
// broker.start()