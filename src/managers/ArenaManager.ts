import { LooseObject } from "../interface/LooseObject";
import { IArenaManager } from '../interface/IArenaManager';
import { EffectTurn } from "../models/EffectTurn";
import { IAbstractTurn } from "../interface/IAbstractTurn";

export class ArenaManager implements IArenaManager {
  private hazards : IAbstractTurn[]

  constructor(battleConfig : LooseObject) {
    if (battleConfig.hazards) {
      const hazards = battleConfig.hazards.map((h : LooseObject) => {
        return new EffectTurn(h);
      })
      this.hazards = hazards;
    } else {
      this.hazards = [];
    }
  }

  public addHazard(hazard : LooseObject) {
    const newHazard = new EffectTurn(hazard);
    this.hazards.push(newHazard);
  }

  public getHazards() : IAbstractTurn[] {
    return this.hazards;
  }
}