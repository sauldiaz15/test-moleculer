const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

module.exports = {
  name: "auth",
  actions: {
    // Acción para registrar un nuevo usuario
    async register(ctx) {
      const { username, email, password } = ctx.params;

      // Verifica si el correo electrónico ya está registrado
      const userExist = await this.checkUserExist(email);
      if (userExist) {
        throw new Error("El correo electrónico ya está registrado");
      }

      // Encripta la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear el nuevo usuario (puedes integrar con una base de datos como MySQL o MongoDB)
      const user = {
        id: Date.now(),
        username,
        email,
        password: hashedPassword,
      };

      // Aquí deberías guardar el usuario en la base de datos
      // Por ejemplo, `await UserModel.create(user)`

      return { message: "Usuario registrado exitosamente" };
    },

    // Acción para autenticar un usuario y generar un JWT
    async login(ctx) {
      const { email, password } = ctx.params;

      // Verifica si el usuario existe
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      // Verifica si la contraseña es correcta
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error("Contraseña incorrecta");
      }

      // Genera un token JWT
      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        process.env.JWT_SECRET || "mi_secreto", // Usar una variable de entorno para el secreto
        { expiresIn: "1h" } // El token expirará en 1 hora
      );

      return { token };
    },

    // Acción para obtener los datos del usuario (solo si tiene un token válido)
    async getUserInfo(ctx) {
      const token = ctx.params.token;
      if (!token) {
        throw new Error("Token requerido");
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "mi_secreto");
        // Si el token es válido, devuelve los datos del usuario
        return {
          id: decoded.id,
          username: decoded.username,
          email: decoded.email,
        };
      } catch (error) {
        throw new Error("Token inválido o expirado");
      }
    },

    // Función auxiliar para verificar si el usuario existe en la base de datos
    async getUserByEmail(email) {
      // Aquí debes buscar el usuario en tu base de datos
      // Simulando un usuario en la base de datos
      const usersDB = [
        { id: 1, username: "juan", email: "juan@example.com", password: "$2a$10$NqK.CdTk8ktEjNd4kj.IvOeheKBW6sOUoAApsv3TcHjTjRbf.7LOq" }, // contraseña: 'password'
      ];

      return usersDB.find(user => user.email === email);
    },

    // Función auxiliar para verificar si el usuario ya existe
    async checkUserExist(email) {
      // Aquí debes buscar si el correo ya está registrado en tu base de datos
      const user = await this.getUserByEmail(email);
      return !!user;
    }
  },
};
