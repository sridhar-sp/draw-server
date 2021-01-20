import { BaseResponseProperties, BaseResponse } from "./response/baseResponse.swagger";

const CREATE_GAME_ROUTE_INFO = {
  tags: ["HTTP"],
  summary: "Summary",
  description: "Request to create a game",
  consumes: ["application/json"],
  produces: ["application/json"],
  requestBody: {
    description: "Game options",
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["noOfRounds", "maxDrawingTime", "maxWordSelectionTime"],
          properties: {
            noOfRounds: {
              type: "integer",
            },
            maxDrawingTime: {
              type: "integer",
            },
            maxWordSelectionTime: {
              type: "integer",
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
            $ref: "#/definitions/CreateGameSuccess",
          },
        },
      },
    },
    "400 ": {
      description: "Bad Request, Wrong input types",
      content: {
        "application/json": {
          schema: {
            $ref: "#/definitions/CreateGameFailureWrongTypes",
          },
        },
      },
    },
    "400": {
      description: "Bad Request, Missing mandatory fields",
      content: {
        "application/json": {
          schema: {
            $ref: "#/definitions/CreateGameFailureMissingValues",
          },
        },
      },
    },
  },
};

const CREATE_GAME_PATH = {
  "/createGame": { post: CREATE_GAME_ROUTE_INFO },
};

const CREATE_GAME_RESPONSE = {
  CreateGameFailureMissingValues: {
    type: "object",
    required: ["code", "message", "data"],
    properties: {
      ...BaseResponseProperties,
    },
    example: {
      code: 400,
      message: "Missing values [noOfRounds,maxDrawingTime]",
    },
  },
  CreateGameFailureWrongTypes: {
    type: "object",
    required: ["code", "message", "data"],
    properties: {
      ...BaseResponseProperties,
    },
    example: {
      code: 400,
      message: "Wrong values [noOfRounds should be number,maxWordSelectionTime should be number]",
    },
  },
  CreateGameSuccess: {
    type: "object",
    required: ["code", "message", "data"],
    properties: {
      ...BaseResponseProperties,
    },
    example: {
      code: 200,
      message: "Success",
      data: {
        gameKey: "gameKey",
      },
    },
  },
};

const GAME_API_DEFINITION = {
  CreateGameFailureMissingValues: CREATE_GAME_RESPONSE.CreateGameFailureMissingValues,
  CreateGameFailureWrongTypes: CREATE_GAME_RESPONSE.CreateGameFailureWrongTypes,
  CreateGameSuccess: CREATE_GAME_RESPONSE.CreateGameSuccess,
};

export default {
  gameAPIPath: CREATE_GAME_PATH,
  gameAPIDefinition: GAME_API_DEFINITION,
};
