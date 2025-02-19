const { ServiceBroker } = require("moleculer");

// Crear el broker
const broker = new ServiceBroker({
  nodeID: "node-1",
  transporter: "NATS", // Configura el transporte
  hotReload: true,
});

// Cargar servicios
broker.loadService("./blotter/auth.service.js");
broker.loadService("./services/user.service.js");
broker.loadService("./blotter/password.service.js");
// Cargar el API Gateway desde un archivo separado
require("./services/api.services.js")(broker); // Pasamos el broker para que lo use el API Gateway

// Iniciar el broker
broker.start();
