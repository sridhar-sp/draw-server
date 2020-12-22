export const BaseResponseProperties = {
  code: {
    type: "integer",
  },
  message: {
    type: "string",
  },
};

export const BaseResponse = {
  Unauthorized: {
    type: "object",
    required: ["code", "message", "data"],
    properties: {
      ...BaseResponseProperties,
    },
    example: {
      code: 422,
      message: "Unauthorized",
    },
  },
};
