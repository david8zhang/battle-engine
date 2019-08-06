import { Move } from "./Move";

/** Interfaces */
import { IArenaManager } from "../interface/IArenaManager";
import { ITeamManager } from "../interface/ITeamManager";
import { IAbstractTurn } from "../interface/IAbstractTurn";
import { LooseObject } from "../interface/LooseObject";
import { TurnQueue } from "../managers/TurnManager";
import { Hero } from "./Hero";
import { EffectTurn } from "./EffectTurn";
import { MessageTurn } from "./MessageTurn";
import { ArenaManager } from "../managers/ArenaManager";
import { TeamManager } from "../managers/TeamManager";
import Utils from "../utils/utils";

export class ActionTurn implements IAbstractTurn {
  private move : Move = null;
  private targetHeroIds : string[] = [];
  private sourceHeroId : string = '';
  public priority : number = 0;
  private intermediateSnapshots : boolean = false;

  constructor(config : LooseObject) {
    if (config.move) this.move = new Move(config.move);
    if (config.targetHeroIds) this.targetHeroIds = config.targetHeroIds;
    if (config.sourceHeroId) this.sourceHeroId = config.sourceHeroId;
    if (config.priority) this.priority = config.priority;
    if (config.interSnaps) this.intermediateSnapshots = config.interSnaps
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
    return (heroes : LooseObject[], arenaManager : ArenaManager, teamManager : TeamManager) => {
      const actionLog : LooseObject[] = [];
      heroes.forEach((h : LooseObject) => {
        const damage = Math.floor(h.getMaxHealth() * effect.dmgPercent) || 1;
        h.setHealth(h.getHealth() - damage);

        const action : LooseObject = {
          type: 'Effect',
          message:  `${h.getName()} took ${damage} damage from ${effect.name}`,
          result: {
            damage,
            targetHeroId: h.getHeroId(),
            effect: effect.name
          }
        }
        if (this.intermediateSnapshots) {
          action.snapshot = {
            playerTeam: JSON.parse(JSON.stringify(teamManager.getActivePlayerTeam())),
            enemyTeam: JSON.parse(JSON.stringify(teamManager.getActiveEnemyTeam()))
          }
        }
        actionLog.push(action)
      })
      return actionLog;
    }
  }

  public _generateBuffOrDebuffEffect(effect : LooseObject) : Function {
    return (heroes : LooseObject[], arenaManager : ArenaManager, teamManager : TeamManager) : LooseObject[] => {
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

        const newAction : LooseObject = {
          type: 'Effect',
          message:  `${h.getName()}'s ${effect.stat} ${effect.buffPercent ? 'rose!' : 'fell!'}`,
          result: {
            statEffect: effect.buffPercent || effect.debuffPercent,
            targetHeroId: h.getHeroId(),
            effect: effect.name
          }
        }
        if (this.intermediateSnapshots) {
          newAction.snapshot = {
            playerTeam: JSON.parse(JSON.stringify(teamManager.getActivePlayerTeam())),
            enemyTeam: JSON.parse(JSON.stringify(teamManager.getActiveEnemyTeam()))
          }
        }
        actionLog.push(newAction)
      })
      return actionLog
    }
  }

  public _generateHealEffect(effect : LooseObject) : Function {
    return (heroes : LooseObject[], arenaManager : ArenaManager, teamManager : TeamManager) : LooseObject[] => {
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

          const action : LooseObject = {
            type: 'Effect',
            message: `${hero.getName()} healed ${healAmt} HP from ${effect.name}`,
            result: {
              hp: healAmt,
              targetHeroId: hero.getHeroId(),
              effect: effect.name
            }
          }
          if (this.intermediateSnapshots) {
            action.snapshot = {
              playerTeam: JSON.parse(JSON.stringify(teamManager.getActivePlayerTeam())),
              enemyTeam: JSON.parse(JSON.stringify(teamManager.getActiveEnemyTeam()))
            }
          }
          actionLog.push(action)
        }
      })
      return actionLog
    }
  }

  public processEffects(playerTeam : LooseObject, enemyTeam : LooseObject, turnQueue : TurnQueue) : void {
    const effects = this.move.getEffects()
    let targets = this._getTargetHeroIds()
    if (!effects) return

    effects.forEach((effect : LooseObject) => {
      targets = targets.filter((heroId : string) => {
        const hero : Hero = playerTeam[heroId] || enemyTeam[heroId]
        const effects : string[] = hero.getEffects().map((effect : LooseObject) => effect.name)
        if (effects.includes(effect.name)) {
          turnQueue.enqueueTurn(new MessageTurn({
            message: `${hero.getName()} is already under the influence of ${effect.name}!`,
            priority: 0
          }))
          return false
        }
        return true
      })

      if (targets.length > 0) {
        const effectTurn : EffectTurn = new EffectTurn({
          duration: effect.duration,
          name: effect.name,
          targetHeroes: targets,
          priority: 0
        })
        let effectFn : Function;
        switch (effect.type) {
          case 'damage': {
            effectFn = this._generateDamageEffect(effect)
            effectTurn.setEffect(effectFn)
            turnQueue.enqueueTurn(effectTurn)
            break;
          }
          case 'buff':{
            effectFn = this._generateBuffOrDebuffEffect(effect)
            effectTurn.setEffect(effectFn)
            turnQueue.enqueueTurn(effectTurn)
            break;
          }
          case 'debuff': {
            effectFn = this._generateBuffOrDebuffEffect(effect)
            effectTurn.setEffect(effectFn)
            turnQueue.enqueueTurn(effectTurn)
            break;
          }
          case 'heal': {
            effectFn = this._generateHealEffect(effect)
            effectTurn.setEffect(effectFn)
            turnQueue.enqueueTurn(effectTurn)
            break;
          }
        }
  
        // Apply effect to enemy/player heroes
        this._getTargetHeroIds().forEach((heroId : string) => {
          if (effectTurn.duration > 0) {
            const hero : Hero = playerTeam[heroId] || enemyTeam[heroId]
            const singleTargetEffect = new EffectTurn({
              duration: effect.duration,
              name: effect.name,
              targetHeroes: [heroId],
              effect: effectFn,
              priority: 0
            })
            if (!hero.checkDuplicateEffect(singleTargetEffect.name)) {
              hero.addEffect(singleTargetEffect, singleTargetEffect.name)
            }
          }
        })
      }
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
      const effectAction : LooseObject = {
        type: 'Effect',
        message: `${sourceHero.getName()} used ${this.move.getName()}`,
        result: {
          sourceHeroId: sourceHero.getHeroId()
        },
        move: this.move.getName()
      }
      if (this.intermediateSnapshots) {
        effectAction.snapshot = {
          playerTeam: JSON.parse(JSON.stringify(Utils.convertObjectToArray(playerTeam))),
          enemyTeam: JSON.parse(JSON.stringify(Utils.convertObjectToArray(enemyTeam)))
        }
      }
      return [];
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

        const newAction : LooseObject = {
          type: 'Action',
          message,
          result
        }
        if (this.intermediateSnapshots) {
          newAction.snapshot = {
            playerTeam: JSON.parse(JSON.stringify(Utils.convertObjectToArray(playerTeam))),
            enemyTeam: JSON.parse(JSON.stringify(Utils.convertObjectToArray(enemyTeam)))
          };
        }
        actionLogs.push(newAction)

        if (targetHero.getHealth() === 0) {
          const deathAction : LooseObject = {
            type: 'Death',
            message: `${targetHero.getName()} died!`,
            result: {
              targetHeroId: targetHero.getHeroId()
            }
          }
          if (this.intermediateSnapshots) {
            deathAction.snapshot = {
              playerTeam: JSON.parse(JSON.stringify(Utils.convertObjectToArray(playerTeam))),
              enemyTeam: JSON.parse(JSON.stringify(Utils.convertObjectToArray(enemyTeam)))
            }
          }
          actionLogs.push(deathAction);
        }
      }
    })
    return actionLogs;
  }
}