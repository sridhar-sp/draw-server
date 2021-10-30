import express, { NextFunction, Response } from "express";
import CreateGameRequest from "../../models/CreateGameRequest";
import GameService from "../../services/GameService";
import ErrorResponse from "../../models/ErrorResponse";
import logger from "../../logger/logger";

const TAG = "GameRoute";
const router = express.Router();
const gameService = new GameService();

router.post("/createGame", validateRequest, async (req: express.Request, res: express.Response) => {
  logger.logInfo(TAG, `createGame called`);
  const request = CreateGameRequest.create(req.body.noOfRounds, req.body.maxDrawingTime, req.body.maxWordSelectionTime, 0);
  const response = await gameService.createGame(request);
  res.status(response.code).send(response);
});

router.post("/createGame/v2", validateRequest, validateV2Request, async (req: express.Request, res: express.Response) => {
  logger.logInfo(TAG, `createGame called`);
  const request = CreateGameRequest.create(req.body.noOfRounds, req.body.maxDrawingTime, req.body.maxWordSelectionTime, req.body.wordSelectionSource);
  const response = await gameService.createGame(request);
  res.status(response.code).send(response);
});

function validateRequest(req: express.Request, res: express.Response, next: NextFunction) {
  const missingValues = [];

  if (!req.body.noOfRounds) missingValues.push("noOfRounds");
  if (!req.body.maxDrawingTime) missingValues.push("maxDrawingTime");
  if (!req.body.maxWordSelectionTime) missingValues.push("maxWordSelectionTime");

  if (missingValues.length > 0) {
    const errorResponse = ErrorResponse.createErrorResponse(400, `Missing values [${missingValues.join()}]`);
    res.status(errorResponse.code).send(errorResponse);
    return;
  }

  const dataTypeError = [];

  if (typeof req.body.noOfRounds !== "number") dataTypeError.push("noOfRounds should be number");
  if (typeof req.body.maxDrawingTime !== "number") dataTypeError.push("maxDrawingTime should be number");
  if (typeof req.body.maxWordSelectionTime !== "number") dataTypeError.push("maxWordSelectionTime should be number");

  if (dataTypeError.length > 0) {
    const errorResponse = ErrorResponse.createErrorResponse(400, `Wrong values [${dataTypeError.join()}]`);
    res.status(errorResponse.code).send(errorResponse);
    return;
  }

  next();
}

function validateV2Request(req: express.Request, res: express.Response, next: NextFunction) {
  if (!req.body.wordSelectionSource) {
    const errorResponse = ErrorResponse.createErrorResponse(400, "Missing wordSelectionSource value");
    res.status(errorResponse.code).send(errorResponse);
    return;
  }

  if (typeof req.body.wordSelectionSource !== "number") {
    const errorResponse = ErrorResponse.createErrorResponse(400, `wordSelectionSource should be number`);
    res.status(errorResponse.code).send(errorResponse);
    return;
  }

  next();
}

module.exports = router;
