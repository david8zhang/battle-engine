import { LooseObject } from "./LooseObject";
import { TurnQueue } from "../managers/TurnManager";

export interface ITurnManager {
  addPlayerTurn(playerInput : LooseObject) : void
  processTurnQueue() : LooseObject[]
}