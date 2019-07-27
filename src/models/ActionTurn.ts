import { Move } from "./Move";

/** Interfaces */
import { IArenaManager } from "../interface/IArenaManager";
import { ITeamManager } from "../interface/ITeamManager";
import { IAbstractTurn } from "../interface/IAbstractTurn";
import { LooseObject } from "../interface/LooseObject";
import { TurnQueue } from "../managers/TurnManager";
import { Hero } from "./Hero";
import { EffectTurn } from "./EffectTurn";

export class ActionTurn implements IAbstractTurn {
  private move : Move = null;
  private targetHeroIds : string[] = [];
  private sourceHeroId : string = '';
  public priority : number = 0;

  constructor(config : LooseObject) {
    if (config.move) this.move = new Move(config.move);
    if (config.targetHeroIds) this.targetHeroIds = config.targetHeroIds;
    if (config.sourceHeroId) this.sourceHeroId = config.sourceHeroId;
    if (config.priority) this.priority = config.priority;
  }

  // Debugging only
  public _getMove() : Move {
    return this.move;
  }

  // Debugging only
  public _getTargetHeroIds() : string[] {
    return this.targetHeroIds;
  }

  // Debugging only
  public _getSourceHeroId() : string {
    return this.sourceHeroId;
  }

  public _generateDamageEffect(effect : LooseObject) : Function {
    return (heroes : LooseObject[]) => {
      const actionLog : LooseObject[] = [];
      heroes.forEach((h : LooseObject) => {
        const damage = Math.floor(h.getMaxHealth() * effect.dmgPercent) || 1;
        h.setHealth(h.getHealth() - damage);
        actionLog.push({
          type: 'Effect',
          message:  `${h.getName()} took ${damage} damage from ${effect.name}`,
          result: {
            damage,
            targetHeroId: h.getHeroId(),
            effect: effect.name
          }
        })
      })
      return actionLog;
    }
  }

  public _generateBuffOrDebuffEffect(effect : LooseObject) : Function {
    return (heroes : LooseObject[]) : LooseObject[] => {
      const actionLog : LooseObject[] = [];
      heroes.forEach((h : LooseObject) => {
        switch (effect.stat) {
          case 'attack': {
            const baseStat = h.getAttack()
            let modifier = effect.buffPercent || effect.debuffPercent
            const modifiedStat : number = Math.floor(baseStat * modifier)
            h.setAttack(modifiedStat)
            break;
          }
          case 'defense': {
            const baseStat = h.getDefense()
            let modifier = effect.buffPercent || effect.debuffPercent
            const modifiedStat : number = Math.floor(baseStat * modifier)
            h.setDefense(modifiedStat)
            break;
          }
          default:
            const baseStat = h.getAdditionalStats()[effect.stat];
            let modifier = effect.buffPercent || effect.debuffPercent
            const additionalStats = h.getAdditionalStats();
            h.setAdditionalStats({
              ...additionalStats,
              [effect.stat]: Math.floor(baseStat * modifier)
            })
            break;
        }
        actionLog.push({
          type: 'Effect',
          message:  `${h.getName()}'s ${effect.stat} ${effect.buffPercent ? 'rose!' : 'fell!'}`,
          result: {
            statEffect: effect.buffPercent || effect.debuffPercent,
            targetHeroId: h.getHeroId(),
            effect: effect.name
          }
        })
      })
      return actionLog
    }
  }

  public _generateHealEffect(effect : LooseObject) : Function {
    return (heroes : LooseObject[]) : LooseObject[] => {
      const actionLog : LooseObject[] = [];
      heroes.forEach((hero : LooseObject) => {
        if (hero.getHealth() === hero.getMaxHealth()) {
          actionLog.push({
            type: 'Effect',
            message: `${hero.getName()} is already at full health!`
          })
        } else {
          let healAmt;
          if (effect.healPercent) {
            healAmt = Math.floor(hero.getMaxHealth() * effect.healPercent) || 1;
          } else {
            healAmt = effect.healAmount;
          }
  
          if (hero.getHealth() + healAmt > hero.getMaxHealth()) {
            healAmt = hero.getMaxHealth() - hero.getHealth()
          }
          hero.setHealth(Math.min(hero.getMaxHealth(), hero.getHealth() + healAmt));
          actionLog.push({
            type: 'Effect',
            message: `${hero.getName()} healed ${healAmt} HP from ${effect.name}`,
            result: {
              hp: healAmt,
              targetHeroId: hero.getHeroId(),
              effect: effect.name
            }
          })
        }
      })
      return actionLog
    }
  }

  public processEffects(playerTeam : LooseObject, enemyTeam : LooseObject, turnQueue : TurnQueue) : void {
    const effects = this.move.getEffects()
    if (!effects) return

    effects.forEach((effect : LooseObject) => {
      const effectTurn : EffectTurn = new EffectTurn({
        duration: effect.duration,
        name: effect.name,
        targetHeroes: this._getTargetHeroIds(),
        priority: 0
      })
      switch (effect.type) {
        case 'damage': {
          effectTurn.setEffect(this._generateDamageEffect(effect))
          turnQueue.enqueueTurn(effectTurn)
          break;
        }
        case 'buff':{
          effectTurn.setEffect(this._generateBuffOrDebuffEffect(effect))
          turnQueue.enqueueTurn(effectTurn)
          break;
        }
        case 'debuff': {
          effectTurn.setEffect(this._generateBuffOrDebuffEffect(effect))
          turnQueue.enqueueTurn(effectTurn)
          break;
        }
        case 'heal': {
          effectTurn.setEffect(this._generateHealEffect(effect))
          turnQueue.enqueueTurn(effectTurn)
          break;
        }
      }

      // Apply effect to enemy/player heroes
      this._getTargetHeroIds().forEach((heroId : string) => {
        if (effectTurn.duration > 0) {
          const hero : Hero = playerTeam[heroId] || enemyTeam[heroId]
          if (!hero.checkDuplicateEffect(effectTurn.name)) {
            hero.addEffect(effectTurn, effectTurn.name)
          }
        }
      })
    })
  }

  public processTurn(teamManager : ITeamManager, arenaManager : IArenaManager, turnQueue : TurnQueue) : LooseObject[] {
    const playerTeam = teamManager.getPlayerTeam();
    const enemyTeam = teamManager.getEnemyTeam();
    const actionLogs : LooseObject[] = [];
    let sourceHero : Hero;

    if (playerTeam[this.sourceHeroId] !== undefined) sourceHero = playerTeam[this.sourceHeroId]
    else if (enemyTeam[this.sourceHeroId] !== undefined) sourceHero = enemyTeam[this.sourceHeroId];

    // If the source hero is dead or nonexistent, they can't attack, so just skip this action
    if (!sourceHero || sourceHero.getHealth() === 0) {
      return [];
    }

    // Attacks may have secondary effects, process them here
    this.processEffects(playerTeam, enemyTeam, turnQueue)

    // If the move has no active attacking or healing power, it's safe to assume it's a passive effect move
    if (this.move.getPower() === 0 && this.move.getHealAmt() === 0) {
      return [{
        type: 'Action',
        message: `${sourceHero.getName()} used ${this.move.getName()}`,
        sourceHeroId: this.sourceHeroId,
        move: this.move.getName()
      }];
    }

    // Deal damage to or heal all targets
    this.targetHeroIds.forEach((id) => {
      let targetHero : Hero
      if (playerTeam[id]) targetHero = playerTeam[id];
      if (enemyTeam[id]) targetHero = enemyTeam[id];
      if (targetHero.getHealth() > 0) {
        let message = '';
        let result : any = {}
        if (this.move.getIsHeal() === true) {
          const healAmt = this.move.calculateHealing(sourceHero, targetHero)
          targetHero.setHealth(targetHero.getHealth() + healAmt)
          message = `${sourceHero.getName()} used ${this.move.getName()} and healed ${healAmt} to ${targetHero.getName()}`
          result.healAmt = healAmt
        } else {
          const damage = this.move.calculateDamage(sourceHero, targetHero);
          targetHero.setHealth(targetHero.getHealth() - damage);
          message = `${sourceHero.getName()} used ${this.move.getName()} and dealt ${damage} to ${targetHero.getName()}`
          result.damage = damage
        }
        result = {
          ...result,
          sourceHeroId: this.sourceHeroId,
          targetHeroId: targetHero.getHeroId(),
          move: this.move.getName()
        }
        actionLogs.push({
          type: 'Action',
          message,
          result
        });
        if (targetHero.getHealth() === 0) {
          actionLogs.push({
            type: 'Death',
            message: `${targetHero.getName()} died!`,
            result: {
              targetHeroId: targetHero.getHeroId()
            }
          });
        }
      }
    })
    return actionLogs;
  }
}