import { BaseResponseProperties, BaseResponse } from "./response/baseResponse.swagger";

const TOKEN_ROUTE_INFO = {
  tags: ["HTTP"],
  summary: "Summary",
  description: "Fetch auth token by providing firebase token",
  consumes: ["application/json"],
  produces: ["application/json"],
  security: [],
  requestBody: {
    description: "Firebase token",
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["userToken"],
          properties: {
            userToken: {
              type: "string",
            },
          },
        },
      },
    },
  },
  responses: {
    "200": {
      description: "successful operation",
      content: {
        "application/json": {
          schema: {
            $ref: "#/definitions/TokenSuccessResponse",
          },
        },
      },
    },
    "422": {
      description: "Missing user token",
      content: {
        "application/json": {
          schema: {
            $ref: "#/definitions/TokenFailureMissingUserToken",
          },
        },
      },
    },
    "401": {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: {
            $ref: "#/definitions/TokenFailureUnauthorized",
          },
        },
      },
    },
  },
};

const REFRESH_TOKEN_ROUTE_INFO = {
  tags: ["HTTP"],
  summary: "Summary",
  description: "Fetch auth token by providing firebase token",
  consumes: ["application/json"],
  produces: ["application/json"],
  responses: {
    "200": {
      description: "successful operation",
      content: {
        "application/json": {
          schema: {
            $ref: "#/definitions/TokenSuccessResponse",
          },
        },
      },
    },
    "401 ": {
      description: "Unauthorized, Missing previous auth token",
      content: {
        "application/json": {
          schema: {
            $ref: "#/definitions/TokenFailureUnauthorized",
          },
        },
      },
    },
    "401": {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: {
            $ref: "#/definitions/TokenFailureUnauthorized",
          },
        },
      },
    },
  },
};

const TOKEN_PATH = {
  "/token": { post: TOKEN_ROUTE_INFO },
  "/refreshToken": { post: REFRESH_TOKEN_ROUTE_INFO },
};

const TOKEN_RESPONSE = {
  TokenFailureMissingUserToken: {
    type: "object",
    required: ["code", "message", "data"],
    properties: {
      ...BaseResponseProperties,
    },
    example: {
      code: 422,
      message: "Missing user token",
    },
  },
  TokenFailureUnauthorized: BaseResponse.Unauthorized,
  TokenSuccessResponse: {
    type: "object",
    required: ["code", "message", "data"],
    properties: {
      ...BaseResponseProperties,
      data: {
        type: "object",
        properties: {
          token: {
            type: "string",
          },
        },
      },
    },
    example: {
      code: 200,
      message: "Success",
      data: {
        token: "JWT token",
      },
    },
  },
};

const TOKEN_DEFINITION = {
  TokenSuccessResponse: TOKEN_RESPONSE.TokenSuccessResponse,
  TokenFailureMissingUserToken: TOKEN_RESPONSE.TokenFailureMissingUserToken,
  TokenFailureUnauthorized: TOKEN_RESPONSE.TokenFailureUnauthorized,
};

export default {
  tokenPath: TOKEN_PATH,
  tokenDefinition: TOKEN_DEFINITION,
};
