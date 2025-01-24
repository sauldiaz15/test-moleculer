const ApiGateway = require("moleculer-web");
const jwt = require("jsonwebtoken");

module.exports = (broker) => {
  // Crear el servicio API Gateway
  broker.createService(ApiGateway, {
    name: "api", // Nombre del servicio
    settings: {
      port: 3000, // Puerto en el que se ejecutará el API Gateway
      routes: [
        {
          path: "/api", // Ruta base
          aliases: {
            "POST /register": "auth.register", // Ruta para registrar un usuario
            "POST /login": "auth.login", // Ruta para autenticar un usuario
            "POST /user-info": "user.getUserInfo", // Ruta protegida para obtener info del usuario autenticado
            "GET /userS-info": "user.listUsers", // Ruta protegida para listar usuarios
          },
          whitelist: ["**"], // Permitir todas las acciones definidas en servicios
          bodyParsers: {
            json: true,
            urlencoded: { extended: true },
          },
          // Middleware para validar token en rutas protegidas
          use: [
            async (req, res, next) => {
              // Excluir las rutas públicas (como login y register)
              if (req.url = "/api/register" || req.url == "/api/login") {
                return next();
              }

              try {
                const authHeader = req.headers.authorization;
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                  res.writeHead(401, { "Content-Type": "application/json" });
                  return res.end(JSON.stringify({ error: "Token no proporcionado" }));
                }

                const token = authHeader.split(" ")[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key");
                req.$ctx.meta.user = decoded; // Agregar el usuario autenticado al contexto de la solicitud
                next(); // Continuar al siguiente middleware o acción
              } catch (err) {
                res.writeHead(401, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ error: "Token inválido o expirado" }));
              }
            },
          ],
        },
      ],
    },
  });
};
