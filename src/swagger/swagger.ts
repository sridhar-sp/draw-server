import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./docs";

export default {
  ui: swaggerUi.serve,
  doc: swaggerUi.setup(swaggerDocument, { explorer: true }),
};
