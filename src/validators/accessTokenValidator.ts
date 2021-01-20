import { NextFunction, Response } from "express";
import ErrorResponse from "../models/ErrorResponse";
import logger from "../logger/logger";

const TAG = "AccessTokenValidator";

const accessTokenValidator = function (req: any, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;

  const accessToken = extractToken(authorization);
  if (!accessToken) {
    logger.logInfo(TAG, "accessTokenValidator :: No access token at headers");
    res.status(401).json(ErrorResponse.unAuthorised());
    return;
  }

  req.accessToken = accessToken;

  next();
};

const extractToken = function (authorizationValue: any) {
  if (!authorizationValue || !(typeof authorizationValue === "string") || authorizationValue.trim() === "") return null;

  const authFields = authorizationValue.split(" ");

  if (!authFields || authFields.length != 2 || authFields[0] !== "Bearer") return null;

  return authFields[1];
};

export default accessTokenValidator;
