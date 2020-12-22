import config from "../../config";
import tokenAPI from "./token.swagger";

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: config.appName!!,
    version: "1.0.0",
    description: "Draw & Guess API Documentations",
    contact: {
      name: "Sridhar S",
      email: "sridharthechosenone@gmail.com",
      url: "https://github.com/half-blood-prince/draw-server",
    },
  },
  servers: [
    {
      url: "http://localhost:{port}/api",
      description: "Local server",
      variables: { port: { default: "3000" } },
    },
    {
      url: "https://fun-draw-guess.herokuapp.com/api",
      description: "Production server",
    },
  ],
  components: {
    schemas: {
      ...tokenAPI.tokenDefinition,
    },
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [{ name: "HTTP" }, { name: "SOCKET" }],
  paths: {
    ...tokenAPI.tokenPath,
  },
  definitions: {
    ...tokenAPI.tokenDefinition,
  },
};

export default swaggerDocument;
