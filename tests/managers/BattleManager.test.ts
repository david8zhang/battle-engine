import { expect } from 'chai';
import 'mocha';

/** Managers */
import { BattleManager } from '../../src/managers/BattleManager';

import { sampleConfig } from '../../seed/battleConfig';
import { LooseObject } from '../../src/interface/LooseObject';
import { Hero } from '../../src/models/Hero';
import { Move } from '../../src/models/Move';

const cloneObject = (obj : LooseObject) : LooseObject => {
  return JSON.parse(JSON.stringify(obj));
}

describe('BattleManager', () => {
  describe('getter functions', () => {
    it('correctly deserializes objects', () => {
      const configClone = cloneObject(sampleConfig);
      const { playerTeam, enemyTeam } = configClone;
      const battleManager : BattleManager = new BattleManager(configClone);
  
      const activeHero = playerTeam['1'];
      const activeEnemy = enemyTeam['3'];
      expect(battleManager.getActivePlayerHero()).to.deep.equal(activeHero);
      expect(battleManager.getActiveEnemyHero()).to.deep.equal(activeEnemy);
    })
    it('correctly turns teams into arrays', () => {
      const configClone = cloneObject(sampleConfig);
      const { playerTeam, enemyTeam } = configClone;
      const battleManager : BattleManager = new BattleManager(configClone);

      const playerTeamArray = Object.keys(playerTeam).map((k : string) => playerTeam[k]);
      const enemyTeamArray = Object.keys(enemyTeam).map((k : string) => enemyTeam[k]);

      expect(battleManager.getEnemyTeam()).to.deep.equal(enemyTeamArray);
      expect(battleManager.getPlayerTeam()).to.deep.equal(playerTeamArray);
    })
  })
  describe('Full game', () => {
    it('correctly processes a full length game', () => {
      const configClone = cloneObject(sampleConfig);
      const sampleMoveSet : LooseObject[] = [{
        name: 'Move1',
        power: 10,
        priority: 0
      }, {
        name: 'Move2',
        power: 10,
        priority: 0
      }]
      const effects : LooseObject[] = [];
      const simplifiedPlayerTeam = {
        '1': { name: 'hero1', attack: 10, defense: 10, health: 4, speed: 50, heroId: '1', effects, moveSet: sampleMoveSet },
        '2': { name: 'hero2', attack: 15, defense: 15, health: 4, speed: 25, heroId: '2', effects, moveSet: sampleMoveSet },
      }
      const simplifiedEnemyTeam = {
        '3': { name: 'enemy1', attack: 10, defense: 10, health: 4, speed: 50, heroId: '3', effects, moveSet: sampleMoveSet },
        '4': { name: 'enemy2', attack: 15, defense: 15, health: 2, speed: 25, heroId: '4', effects, moveSet: sampleMoveSet },
      }
      configClone.playerTeam = simplifiedPlayerTeam;
      configClone.enemyTeam = simplifiedEnemyTeam;
      const battleManager : BattleManager = new BattleManager(configClone);
  
      /** Do the player turn */
      const expectedActionLog1 = [{
        type: 'Action',
        message: 'hero1 used Move1 and dealt 2 to enemy1',
        result: {
          damage: 2,
          move: 'Move1',
          targetHeroId: '3',
          sourceHeroId: '1'
        }
      }, {
        type: 'Action',
        message: 'enemy1 used Move1 and dealt 2 to hero1',
        result: {
          damage: 2,
          move: 'Move1',
          targetHeroId: '1',
          sourceHeroId: '3'
        }
      }]
      const actionLog : LooseObject[] = battleManager.doPlayerTurn({
        actionType: 'ActionTurn',
        move: sampleMoveSet[0],
        sourceHeroId: '1',
        targetHeroIds: ['3'],
        priority: sampleMoveSet[0].priority
      })
      expect(actionLog).to.deep.equal(expectedActionLog1);
      expect(battleManager.getActivePlayerHero().health).to.equal(simplifiedPlayerTeam['1'].health - 2);
      expect(battleManager.getActiveEnemyHero().health).to.equal(simplifiedEnemyTeam['3'].health - 2);
  
      /** Kill an enemy */
      const expectedActionLog2 = [{
        type: 'Action',
        message: 'hero1 used Move1 and dealt 2 to enemy1',
        result: {
          damage: 2,
          move: 'Move1',
          targetHeroId: '3',
          sourceHeroId: '1'
        }
      }, {
        type: 'Death',
        message: 'enemy1 died!',
        result: {
          targetHeroId: '3'
        }
      }, {
        type: 'Switch',
        message: 'Enemy sent out enemy2',
        result: {
          side: 'enemy',
          old: '3',
          new: '4'
        }
      }];
      const actionLog2 : LooseObject[] = battleManager.doPlayerTurn({
        actionType: 'ActionTurn',
        move: sampleMoveSet[0],
        sourceHeroId: '1',
        targetHeroIds: ['3'],
        priority: sampleMoveSet[0].priority
      })
      expect(actionLog2).to.deep.equal(expectedActionLog2);
      expect(battleManager.getActivePlayerHero().health).to.equal(simplifiedPlayerTeam['1'].health - 2);
      expect(battleManager.getActiveEnemyHero().heroId).to.equal('4');
  
      /** Win the battle  */
      const expectedActionLog3 = [{
        type: 'Action',
        message: 'hero1 used Move1 and dealt 2 to enemy2',
        result: {
          damage: 2,
          move: 'Move1',
          targetHeroId: '4',
          sourceHeroId: '1'
        }
      }, {
        type: 'Death',
        message: 'enemy2 died!',
        result: {
          targetHeroId: '4'
        }
      }, {
        type: 'Win',
        result: {
          side: 'player'
        }
      }];

      const actionLog3 : LooseObject[] = battleManager.doPlayerTurn({
        actionType: 'ActionTurn',
        move: sampleMoveSet[0],
        sourceHeroId: '1',
        targetHeroIds: ['4'],
        priority: sampleMoveSet[0].priority
      })
      expect(actionLog3).to.deep.equal(expectedActionLog3);
    })
    it('simulates a game where player loses', () => {
      const configClone = cloneObject(sampleConfig);
      const sampleMoveSet : LooseObject[] = [{
        name: 'Move1',
        power: 10,
        priority: 0
      }, {
        name: 'Move2',
        power: 10,
        priority: 0
      }]
      const effects : LooseObject[] = [];
      const simplifiedPlayerTeam = {
        '1': { name: 'hero1', attack: 10, defense: 10, health: 4, speed: 50, heroId: '1', effects, moveSet: sampleMoveSet },
        '2': { name: 'hero2', attack: 15, defense: 15, health: 4, speed: 25, heroId: '2', effects, moveSet: sampleMoveSet },
      }
      const simplifiedEnemyTeam = {
        '3': { name: 'enemy1', attack: 1000, defense: 10, health: 100, speed: 1000, heroId: '3', effects, moveSet: sampleMoveSet },
        '4': { name: 'enemy2', attack: 1000, defense: 15, health: 100, speed: 1000, heroId: '4', effects, moveSet: sampleMoveSet },
      }
      configClone.playerTeam = simplifiedPlayerTeam;
      configClone.enemyTeam = simplifiedEnemyTeam;
      const battleManager : BattleManager = new BattleManager(configClone);

      const expectedActionLog1 = [{
        type: 'Action',
        message: 'enemy1 used Move1 and dealt 4 to hero1',
        result: {
          damage: 4,
          targetHeroId: '1',
          sourceHeroId: '3',
          move: 'Move1'
        }
      }, {
        type: 'Death',
        message: 'hero1 died!',
        result: {
          targetHeroId: '1'
        }
      }];
      const actionLog1 = battleManager.doPlayerTurn({
        actionType: 'ActionTurn',
        move: sampleMoveSet[0],
        sourceHeroId: '1',
        targetHeroIds: ['3'],
        priority: sampleMoveSet[0].priority
      });
      expect(actionLog1).to.deep.equal(expectedActionLog1);

      /** Player Switch */
      const expectedActionLog2 = [{
        type: 'Switch',
        message: 'Player sent out hero2',
        result: {
          side: 'player',
          old: '1',
          new: '2'
        }
      }, {
        type: 'Action',
        message: 'enemy1 used Move1 and dealt 4 to hero2',
        result: {
          damage: 4,
          targetHeroId: '2',
          sourceHeroId: '3',
          move: 'Move1'
        }
      }, {
        type: 'Death',
        message: 'hero2 died!',
        result: {
          targetHeroId: '2'
        }
      }, {
        type: 'Win',
        result: {
          side: 'enemy'
        }
      }];
      const actionLog2 = battleManager.doPlayerTurn({
        actionType: 'SwitchTurn',
        newActiveHero: '2',
        side: 'player'
      });
      expect(actionLog2).to.deep.equal(expectedActionLog2);
    })
  })
  describe('No configuration game', () => {
    it('Generates a default CPU even if no configuration is passed in', () => {
      const battleManager = new BattleManager({});

      // Get the active player hero
      const playerHero = battleManager.getActivePlayerHero();

      // Get the active enemy hero
      const enemyHero = battleManager.getActiveEnemyHero();

      // Player Input
      const playerAttackTurn = {
          actionType: 'ActionTurn',
          move: playerHero.moveSet[2],
          sourceHeroId: playerHero.heroId,
          targetHeroIds: [enemyHero.heroId],
          priority: playerHero.moveSet[2].priority
      }

      const actionLog : LooseObject[] = battleManager.doPlayerTurn(playerAttackTurn);
      expect(actionLog.length).to.be.greaterThan(1);
    })
  })

  describe('Multi mode support', () => {
    it('has working multi-attack logic', () => {
      const configClone = cloneObject(sampleConfig);
      const sampleMoveSet : LooseObject[] = [
        { name: 'Move1', power: 10, priority: 0 },
        { name: 'Move2', power: 10, priority: 0 }
      ]
      const effects : LooseObject[] = [];
      const activePlayerTeam = {
        'mario-id': { name: 'mario', attack: 10, defense: 10, health: 4, speed: 10, heroId: 'mario-id', effects, moveSet: sampleMoveSet },
        'link-id': { name: 'link', attack: 10, defense: 10, health: 4, speed: 8, heroId: 'link-id', effects, moveSet: sampleMoveSet },
      }
      const activeEnemyTeam = {
        'bowser-id': { name: 'bowser', attack: 10, defense: 10, health: 4, speed: 6, heroId: 'bowser-id', effects, moveSet: sampleMoveSet },
        'ganondorf-id': { name: 'ganondorf', attack: 10, defense: 10, health: 4, speed: 4, heroId: 'ganondorf-id', effects, moveSet: sampleMoveSet },
      }
      configClone.playerTeam = activePlayerTeam;
      configClone.enemyTeam = activeEnemyTeam;
      configClone.activePlayerTeam = ['mario-id', 'link-id'];
      configClone.activeEnemyTeam = ['bowser-id', 'ganondorf-id'];
      configClone.multiMode = true;
      const battleManager : BattleManager = new BattleManager(configClone);
  
      const actionLog = battleManager.doPlayerTurnMulti([{
        actionType: 'ActionTurn',
        move: sampleMoveSet[0],
        sourceHeroId: 'mario-id',
        targetHeroIds: ['bowser-id'],
        priority: sampleMoveSet[0].priority
      }, {
        actionType: 'ActionTurn',
        move: sampleMoveSet[1],
        sourceHeroId: 'link-id',
        targetHeroIds: ['ganondorf-id'],
        priority: sampleMoveSet[1].priority
      }]);

      const expectedActionLog = [{
        type: 'Action',
        message: 'mario used Move1 and dealt 2 to bowser',
        result: {
          damage: 2,
          move: 'Move1',
          targetHeroId: 'bowser-id',
          sourceHeroId: 'mario-id'
        }
      }, {
        type: 'Action',
        message: 'link used Move2 and dealt 2 to ganondorf',
        result: {
          damage: 2,
          move: 'Move2',
          targetHeroId: 'ganondorf-id',
          sourceHeroId: 'link-id'
        }
      }]
      expect(actionLog[0]).to.deep.equal(expectedActionLog[0]);
      expect(actionLog[1]).to.deep.equal(expectedActionLog[1]);
      expect(actionLog.length).to.be.at.least(4);
      expect(battleManager.getActiveEnemyTeam()[0].health).to.equal(activeEnemyTeam['bowser-id'].health - 2);
      expect(battleManager.getActiveEnemyTeam()[1].health).to.equal(activeEnemyTeam['ganondorf-id'].health - 2);
    })
    it('correctly handles multi switch logic', () => {
      const configClone = cloneObject(sampleConfig);
      const sampleMoveSet : LooseObject[] = [
        { name: 'Move1', power: 10, priority: 0, isHeal: false, healAmt: 0 },
        { name: 'Move2', power: 10, priority: 0, isHeal: false, healAmt: 0 }
      ]
      const effects : LooseObject[] = [];
      const playerTeam = {
        'mario-id': { name: 'mario', attack: 10, defense: 10, health: 4, maxHealth: 4, level: 1, speed: 10, heroId: 'mario-id', effects, moveSet: sampleMoveSet },
        'link-id': { name: 'link', attack: 10, defense: 10, health: 4, maxHealth: 4, level: 1, speed: 8, heroId: 'link-id', effects, moveSet: sampleMoveSet },
        'pikachu-id': { name: 'pikachu', attack: 10, defense: 10, health: 4, maxHealth: 4, level: 1, speed: 8, heroId: 'pikachu-id', effects, moveSet: sampleMoveSet },
        'donkey-kong-id': { name: 'donkey kong', attack: 15, defense: 10, health: 4, maxHealth: 4, level: 1, speed: 8, heroId: 'donkey-kong-id', effects, moveSet: sampleMoveSet }
      }
      const enemyTeam = {
        'bowser-id': { name: 'bowser', attack: 10, defense: 10, health: 4, maxHealth: 4, level: 1, speed: 6, heroId: 'bowser-id', effects, moveSet: sampleMoveSet },
        'ganondorf-id': { name: 'ganondorf', attack: 10, defense: 10, health: 4, maxHealth: 4, level: 1, speed: 4, heroId: 'ganondorf-id', effects, moveSet: sampleMoveSet },
        'ridley-id': { name: 'ridley', attack: 10, defense: 10, health: 4, maxHealth: 4, level: 1, speed: 4, heroId: 'ridley-id', effects, moveSet: sampleMoveSet },
        'krool-id': { name: 'king k rool', attack: 10, defense: 10, health: 4, maxHealth: 4, level: 1, speed: 4, heroId: 'ridley-id', effects, moveSet: sampleMoveSet }
      }
      configClone.playerTeam = playerTeam;
      configClone.enemyTeam = enemyTeam;
      configClone.activePlayerTeam = ['mario-id', 'link-id'];
      configClone.activeEnemyTeam = ['bowser-id', 'ganondorf-id'];
      configClone.multiMode = true;
      const battleManager : BattleManager = new BattleManager(configClone);

      const actionLog = battleManager.doPlayerTurn({
        actionType: 'MultiSwitchTurn',
        side: 'player',
        newActiveTeam: ['pikachu-id', 'donkey-kong-id']
      });

      const multiSwitchActionLog = [{
        type: 'MultiSwitch',
        message: 'pikachu, donkey kong switched out!',
        result: {
          side: 'player',
          oldActiveHeroTeam: [{ ...playerTeam['mario-id'], maxHealth: 4 }, { ...playerTeam['link-id'], maxHealth: 4 }],
          newActiveHeroTeam: [{ ...playerTeam['pikachu-id'], maxHealth: 4 }, { ...playerTeam['donkey-kong-id'], maxHealth: 4 }]
        }
      }]
      expect(actionLog).to.deep.equal(multiSwitchActionLog);
      expect(battleManager.getActivePlayerTeam()[0]).to.deep.equal(playerTeam['pikachu-id']);
      expect(battleManager.getActivePlayerTeam()[1]).to.deep.equal(playerTeam['donkey-kong-id']);
    })
    it('correctly handles CPU switch out logic', () => {
      const configClone = cloneObject(sampleConfig);
      const sampleMoveSet : LooseObject[] = [
        { name: 'Move1', power: 10, priority: 0, healAmt: 0, isHeal: false },
        { name: 'Move2', power: 10, priority: 0, healAmt: 0, isHeal: false }
      ]
      const effects : LooseObject[] = [];
      const playerTeam = {
        'mario-id': { name: 'mario', attack: 1000, defense: 10, health: 4, maxHealth: 4, level: 1, speed: 10, heroId: 'mario-id', effects, moveSet: sampleMoveSet },
        'link-id': { name: 'link', attack: 1000, defense: 10, health: 4, maxHealth: 4, level: 1, speed: 8, heroId: 'link-id', effects, moveSet: sampleMoveSet },
        'pikachu-id': { name: 'pikachu', attack: 1000, defense: 10, health: 4, maxHealth: 4, level: 1, speed: 8, heroId: 'pikachu-id', effects, moveSet: sampleMoveSet },
        'donkey-kong-id': { name: 'donkey kong', attack: 1000, defense: 10, health: 4, maxHealth: 4, level: 1, speed: 8, heroId: 'donkey-kong-id', effects, moveSet: sampleMoveSet }
      }
      const enemyTeam = {
        'bowser-id': { name: 'bowser', attack: 10, defense: 10, health: 4, maxHealth: 4, level: 1, speed: 6, heroId: 'bowser-id', effects, moveSet: sampleMoveSet },
        'ganondorf-id': { name: 'ganondorf', attack: 10, defense: 10, health: 4, maxHealth: 4, level: 1, speed: 4, heroId: 'ganondorf-id', effects, moveSet: sampleMoveSet },
        'ridley-id': { name: 'ridley', attack: 10, defense: 10, health: 4, maxHealth: 4, level: 1, speed: 4, heroId: 'ridley-id', effects, moveSet: sampleMoveSet },
        'krool-id': { name: 'king k rool', attack: 10, defense: 10, health: 4, maxHealth: 4, level: 1, speed: 4, heroId: 'ridley-id', effects, moveSet: sampleMoveSet }
      }
      configClone.playerTeam = playerTeam;
      configClone.enemyTeam = enemyTeam;
      configClone.activePlayerTeam = ['mario-id', 'link-id'];
      configClone.activeEnemyTeam = ['bowser-id', 'ganondorf-id'];
      configClone.multiMode = true;
      const battleManager : BattleManager = new BattleManager(configClone);
      const actionLog = battleManager.doPlayerTurnMulti([{
        actionType: 'ActionTurn',
        move: sampleMoveSet[0],
        sourceHeroId: 'mario-id',
        targetheroIds: ['bowser-id'],
        priority: sampleMoveSet[0].priority
      }, {
        actionType: 'ActionTurn',
        move: sampleMoveSet[1],
        sourceHeroId: 'link-id',
        targetHeroIds: ['ganondorf-id'],
        priority: sampleMoveSet[1].priority
      }])
      expect(actionLog[2]).to.deep.equal({
        type: 'MultiSwitch',
        message: 'ridley switched out!',
        result: {
          side: 'enemy',
          oldActiveHeroTeam: [enemyTeam['bowser-id'], { ...enemyTeam['ganondorf-id'], health: 0 }],
          newActiveHeroTeam: [enemyTeam['bowser-id'], enemyTeam['ridley-id']]
        }
      })
    })
    it('process effects only for active heroes', () => {
      const configClone = cloneObject(sampleConfig);
      const sampleMoveSet : LooseObject[] = [
        { name: 'Move1', power: 10, priority: 0 },
        { name: 'Move2', power: 10, priority: 0 }
      ]
      const effects : LooseObject[] = [{
        duration: 3,
        name: 'Poison Effect',
        priority: 0,
        targetHeroes: ['donkey-kong-id'],
        effect: (heroes : LooseObject[]) : LooseObject[] => {
          const actionLog : LooseObject[] = [];
          heroes.forEach((h : LooseObject) => {
            h.setHealth(h.getHealth() - 10)
            actionLog.push({
              type: 'Effect',
              message:  `${h.getName()} took 10 damage from Poison Effect`,
              result: {
                hp: -10,
                targetHeroId: h.getHeroId(),
                effect: 'Poison Effect'
              }
            })
          })
          return actionLog;
        }
      }];
      const activePlayerTeam = {
        'mario-id': { name: 'mario', attack: 10, defense: 10, health: 4, level: 1, speed: 10, heroId: 'mario-id', effects, moveSet: sampleMoveSet },
        'link-id': { name: 'link', attack: 10, defense: 10, health: 4, level: 1, speed: 8, heroId: 'link-id', effects, moveSet: sampleMoveSet },
        'donkey-kong-id': { name: 'donkey-kong', attack: 10, defense: 10, health: 4, level: 1, speed: 4, heroId: 'donkey-kong-id', effects, moveSet: sampleMoveSet }
      }
      const activeEnemyTeam = {
        'bowser-id': { name: 'bowser', attack: 10, defense: 10, health: 4, level: 1, speed: 6, heroId: 'bowser-id', effects, moveSet: sampleMoveSet },
        'ganondorf-id': { name: 'ganondorf', attack: 10, defense: 10, health: 4, level: 1, speed: 4, heroId: 'ganondorf-id', effects, moveSet: sampleMoveSet },
      }
      configClone.playerTeam = activePlayerTeam;
      configClone.enemyTeam = activeEnemyTeam;
      configClone.activePlayerTeam = ['mario-id', 'link-id'];
      configClone.activeEnemyTeam = ['bowser-id', 'ganondorf-id'];
      configClone.multiMode = true;
      const battleManager : BattleManager = new BattleManager(configClone);

      const actionLog = battleManager.doPlayerTurn({
        actionType: 'ActionTurn',
        move: sampleMoveSet[0],
        sourceHeroId: 'mario-id',
        targetHeroIds: ['bowser-id'],
        priority: sampleMoveSet[0].priority
      });

      actionLog.forEach((action : LooseObject) => {
        expect(action).to.not.deep.equal({
          type: 'Effect',
          message: 'donkey-kong took 10 damage from Poison Effect',
          result: {
            hp: -10,
            targetHeroId: 'donkey-kong-id',
            effect: 'Poison Effect'
          }
        });
      })
    })
    it('process effects that kill', () => {
      const configClone = cloneObject(sampleConfig);
      const sampleMoveSet : LooseObject[] = [
        { name: 'Move1', power: 10, priority: 0 },
        { name: 'Move2', power: 10, priority: 0 }
      ]
      const effects : LooseObject[] = [{
        duration: 3,
        name: 'Poison Effect',
        priority: 0,
        targetHeroes: ['link-id'],
        effect: (heroes : LooseObject[]) : LooseObject[] => {
          const actionLog : LooseObject[] = [];
          heroes.forEach((h : LooseObject) => {
            const newHealth = h.getHealth() - 10 > 0 ? h.getHealth() - 10 : 0
            h.setHealth(newHealth);
            actionLog.push({
              type: 'Effect',
              message:  `${h.getName()} took 10 damage from Poison Effect`,
              result: {
                hp: -10,
                targetHeroId: h.getHeroId(),
                effect: 'Poison Effect'
              }
            })
          })
          return actionLog;
        }
      }];
      const activePlayerTeam = {
        'mario-id': { name: 'mario', attack: 10, defense: 10, health: 4, level: 1, speed: 10, heroId: 'mario-id', effects, moveSet: sampleMoveSet },
        'link-id': { name: 'link', attack: 10, defense: 10, health: 4, level: 1, speed: 8, heroId: 'link-id', effects, moveSet: sampleMoveSet },
        'donkey-kong-id': { name: 'donkey-kong', attack: 10, defense: 10, health: 4, level: 1, speed: 4, heroId: 'donkey-kong-id', effects, moveSet: sampleMoveSet }
      }
      const activeEnemyTeam = {
        'bowser-id': { name: 'bowser', attack: 10, defense: 10, health: 4, level: 1, speed: 6, heroId: 'bowser-id', effects, moveSet: sampleMoveSet },
        'ganondorf-id': { name: 'ganondorf', attack: 10, defense: 10, health: 4, level: 1, speed: 4, heroId: 'ganondorf-id', effects, moveSet: sampleMoveSet },
      }
      configClone.playerTeam = activePlayerTeam;
      configClone.enemyTeam = activeEnemyTeam;
      configClone.activePlayerTeam = ['mario-id', 'link-id'];
      configClone.activeEnemyTeam = ['bowser-id', 'ganondorf-id'];
      configClone.multiMode = true;
      const battleManager : BattleManager = new BattleManager(configClone);


      const actionLog = battleManager.doPlayerTurn({
        actionType: 'ActionTurn',
        move: sampleMoveSet[0],
        sourceHeroId: 'mario-id',
        targetHeroIds: ['bowser-id'],
        priority: sampleMoveSet[0].priority
      })

      expect(actionLog[2]).to.deep.equal({
        type: 'Death',
        message: 'link died!',
        result: {
          targetHeroId: 'link-id'
        }
      })
    })
    it('processes effects over a duration', () => {
      const configClone = cloneObject(sampleConfig);
      const sampleMoveSet : LooseObject[] = [
        { name: 'Move1', power: 0, priority: 0 },
        { name: 'Move2', power: 0, priority: 0 }
      ]
      const defaultEffects : LooseObject[] = [];
      const effects : LooseObject[] = [{
        duration: 3,
        name: 'Poison Effect',
        priority: 0,
        targetHeroes: ['link-id'],
        effect: (heroes : LooseObject[]) : LooseObject[] => {
          const actionLog : LooseObject[] = [];
          heroes.forEach((h : LooseObject) => {
            const newHealth = h.getHealth() - 1 > 0 ? h.getHealth() - 1 : 0
            h.setHealth(newHealth);
            actionLog.push({
              type: 'Effect',
              message:  `${h.getName()} took 1 damage from Poison Effect`,
              result: {
                hp: -1,
                targetHeroId: h.getHeroId(),
                effect: 'Poison Effect'
              }
            })
          })
          return actionLog;
        }
      }];
      const activePlayerTeam = {
        'mario-id': { name: 'mario', attack: 10, defense: 10, health: 100, level: 1, speed: 10, heroId: 'mario-id', effects, moveSet: sampleMoveSet },
        'link-id': { name: 'link', attack: 10, defense: 10, health: 100, level: 1, speed: 8, heroId: 'link-id', effects: defaultEffects, moveSet: sampleMoveSet },
        'donkey-kong-id': { name: 'donkey-kong', attack: 10, defense: 10, health: 4, level: 1, speed: 4, heroId: 'donkey-kong-id', effects: defaultEffects, moveSet: sampleMoveSet }
      }
      const activeEnemyTeam = {
        'bowser-id': { name: 'bowser', attack: 0, defense: 10, health: 4, level: 1, speed: 6, heroId: 'bowser-id', effects: defaultEffects, moveSet: sampleMoveSet },
        'ganondorf-id': { name: 'ganondorf', attack: 0, defense: 10, health: 4, level: 1, speed: 4, heroId: 'ganondorf-id', effects: defaultEffects, moveSet: sampleMoveSet },
      }
      configClone.playerTeam = activePlayerTeam;
      configClone.enemyTeam = activeEnemyTeam;
      configClone.activePlayerTeam = ['mario-id', 'link-id'];
      configClone.activeEnemyTeam = ['bowser-id', 'ganondorf-id'];
      configClone.multiMode = true;
      const battleManager : BattleManager = new BattleManager(configClone);


      const marioAttackTurn = {
        actionType: 'ActionTurn',
        move: sampleMoveSet[0],
        sourceHeroId: 'mario-id',
        targetHeroIds: ['bowser-id'],
        priority: sampleMoveSet[0].priority
      }

      const effectLogRecord = {
        type: 'Effect',
        message: 'link took 1 damage from Poison Effect',
        result: {
          hp: -1,
          targetHeroId: 'link-id',
          effect: 'Poison Effect'
        }
      }

      // Do three turns
      const actionLog1 = battleManager.doPlayerTurn(marioAttackTurn);
      const effectsLog1 = actionLog1.filter((a : LooseObject) => a.type === 'Effect');
      expect(effectsLog1.length).to.equal(1);
      expect(effectsLog1[0]).to.deep.equal(effectLogRecord);

      const actionLog2 = battleManager.doPlayerTurn(marioAttackTurn);
      const effectsLog2 = actionLog2.filter((a : LooseObject) =>  a.type === 'Effect');
      expect(effectsLog2.length).to.equal(1);
      expect(effectsLog2[0]).to.deep.equal(effectLogRecord);

      const actionLog3 = battleManager.doPlayerTurn(marioAttackTurn);
      const effectsLog3 = actionLog3.filter((a : LooseObject) => a.type === 'Effect');
      expect(effectsLog3.length).to.equal(1);
      expect(effectsLog3[0]).to.deep.equal(effectLogRecord);

      // Effect wears off after duration finishes
      const actionLog4 = battleManager.doPlayerTurn(marioAttackTurn);
      const effectsLog4 = actionLog4.filter((a : LooseObject) => a.type === 'Effect');
      expect(effectsLog4.length).to.equal(0);
    })
    it('processes healing moves', () => {
      const configClone = cloneObject(sampleConfig);
      const sampleMoveSet : LooseObject[] = [
        { name: 'Move1', power: 10, priority: 0 },
        { name: 'Heal', healAmt: 0.25, priority: 0, isHeal: true }
      ]
      const effects : LooseObject[] = [];
      const activePlayerTeam = {
        'mario-id': { name: 'mario', attack: 10, defense: 10, health: 4, maxHealth: 4, speed: 10, heroId: 'mario-id', effects, moveSet: sampleMoveSet },
        'link-id': { name: 'link', attack: 10, defense: 10, health: 4, maxHealth: 4, speed: 8, heroId: 'link-id', effects, moveSet: sampleMoveSet },
      }
      const activeEnemyTeam = {
        'bowser-id': { name: 'bowser', attack: 10, defense: 10, health: 4, maxHealth: 4, speed: 6, heroId: 'bowser-id', effects, moveSet: sampleMoveSet },
        'ganondorf-id': { name: 'ganondorf', attack: 10, defense: 10, health: 4, maxHealth: 4, speed: 4, heroId: 'ganondorf-id', effects, moveSet: sampleMoveSet },
      }
      configClone.playerTeam = activePlayerTeam;
      configClone.enemyTeam = activeEnemyTeam;
      configClone.activePlayerTeam = ['mario-id', 'link-id'];
      configClone.activeEnemyTeam = ['bowser-id', 'ganondorf-id'];
      configClone.multiMode = true;
      const battleManager : BattleManager = new BattleManager(configClone);

      const actionLog = battleManager.doPlayerTurnMulti([{
        actionType: 'ActionTurn',
        move: sampleMoveSet[1],
        sourceHeroId: 'mario-id',
        targetHeroIds: ['link-id'],
        priority: sampleMoveSet[0].priority
      }, {
        actionType: 'ActionTurn',
        move: sampleMoveSet[1],
        sourceHeroId: 'link-id',
        targetHeroIds: ['mario-id'],
        priority: sampleMoveSet[1].priority
      }]);

      expect(actionLog[0]).to.deep.equal({
        type: 'Action',
        message: 'mario used Heal and healed 0 to link',
        result: {
          healAmt: 0,
          sourceHeroId: 'mario-id',
          targetHeroId: 'link-id',
          move: 'Heal'
        }
      })
    })
    describe('Passive action types', () => {
      const configClone = cloneObject(sampleConfig);
      const sampleMoveSet : LooseObject[] = [
        {
          name: 'Poison Effect',
          power: 0,
          priority: 1,
          target: 'enemies',
          isHeal: false,
          healAmt: 0,
          staminaCost: 20,
          effects: [
            {
              name: 'Poison Effect',
              duration: 4,
              target: 'enemies',
              type: 'damage',
              dmgPercent: 0.05
            }
          ]
        },
        {
          name: 'Heal Effect',
          power: 0,
          priority: 1,
          target: 'ally',
          isHeal: false,
          healAmt: 0,
          staminaCost: 20,
          effects: [
            {
              name: 'Heal Effect',
              duration: 4,
              target: 'ally',
              type: 'heal',
              healPercent: 0.05
            }
          ]
        },
        {
          name: 'Hone Skill',
          power: 0,
          priority: 1,
          target: 'ally',
          isHeal: false,
          healAmt: 0,
          staminaCost: 20,
          effects: [
            {
              name: 'Attack Boost',
              duration: -1,
              target: 'ally',
              type: 'buff',
              stat: 'attack',
              buffPercent: 1.5
            }
          ]
        },
        {
          name: 'Terrify',
          power: 0,
          priority: 1,
          target: 'enemy',
          isHeal: false,
          healAmt: 0,
          staminaCost: 20,
          effects: [
            {
              name: 'Attack Debuff',
              duration: -1,
              target: 'ally',
              type: 'debuff',
              stat: 'attack',
              debuffPercent: 0.75
            }
          ]
        }
      ]
      const effects : LooseObject[] = [];
      const activePlayerTeam = {
        'mario-id': { name: 'mario', attack: 10, defense: 10, health: 4, maxHealth: 4, speed: 10, heroId: 'mario-id', effects, moveSet: sampleMoveSet },
        'link-id': { name: 'link', attack: 10, defense: 10, health: 4, maxHealth: 4, speed: 8, heroId: 'link-id', effects, moveSet: sampleMoveSet },
      }
      const activeEnemyTeam = {
        'bowser-id': { name: 'bowser', attack: 10, defense: 10, health: 4, maxHealth: 4, speed: 6, heroId: 'bowser-id', effects, moveSet: sampleMoveSet },
        'ganondorf-id': { name: 'ganondorf', attack: 10, defense: 10, health: 4, maxHealth: 4, speed: 4, heroId: 'ganondorf-id', effects, moveSet: sampleMoveSet },
      }
      configClone.playerTeam = activePlayerTeam;
      configClone.enemyTeam = activeEnemyTeam;
      configClone.activePlayerTeam = ['mario-id', 'link-id'];
      configClone.activeEnemyTeam = ['bowser-id', 'ganondorf-id'];
      configClone.multiMode = true;
      
      it('processes moves with effects', () => {
        const battleManager : BattleManager = new BattleManager(configClone);
        const actionLog = battleManager.doPlayerTurnMulti([{
          actionType: 'ActionTurn',
          move: sampleMoveSet[0],
          sourceHeroId: 'mario-id',
          targetHeroIds: ['bowser-id', 'ganondorf-id'],
          priority: sampleMoveSet[0].priority
        }, {
          actionType: 'ActionTurn',
          move: sampleMoveSet[1],
          sourceHeroId: 'link-id',
          targetHeroIds: ['mario-id'],
          priority: sampleMoveSet[1].priority
        }])
  
        const messages = actionLog.map((action : LooseObject) => action.message)
        expect(messages).to.deep.equal([
          'mario used Poison Effect',
          'bowser took 1 damage from Poison Effect',
          'ganondorf took 1 damage from Poison Effect',
          'link used Heal Effect',
          'mario is already at full health!',
          'bowser used Poison Effect',
          'mario took 1 damage from Poison Effect',
          'link took 1 damage from Poison Effect',
          'ganondorf used Poison Effect',
          'mario is already under the influence of Poison Effect!',
          'link is already under the influence of Poison Effect!'
        ])
  
        const playerTeam = battleManager.getPlayerTeam();
        const enemyTeam = battleManager.getEnemyTeam();
        const mario = playerTeam[0];
        const link = playerTeam[1];
  
        const bowser = enemyTeam[0];
        const ganondorf = enemyTeam[1]
  
        expect(mario.effects.length).to.equal(2);
        expect(link.effects.length).to.equal(1);
        expect(bowser.effects.length).to.equal(1);
        expect(ganondorf.effects.length).to.equal(1);
  
        expect(mario.health).to.equal(3);
        expect(link.health).to.equal(3);
        expect(bowser.health).to.equal(3);
        expect(ganondorf.health).to.equal(3);
      })

      it('Carries over effects properly', () => {
        const higherHealth = JSON.parse(JSON.stringify(configClone));

        const effects : LooseObject[] = [];
        const activePlayerTeam = {
          'mario-id': { name: 'mario', attack: 10, defense: 10, health: 100, maxHealth: 100, speed: 10, heroId: 'mario-id', effects, moveSet: sampleMoveSet },
          'link-id': { name: 'link', attack: 10, defense: 10, health: 100, maxHealth: 100, speed: 8, heroId: 'link-id', effects, moveSet: sampleMoveSet },
        }
        const activeEnemyTeam = {
          'bowser-id': { name: 'bowser', attack: 10, defense: 10, health: 100, maxHealth: 100, speed: 6, heroId: 'bowser-id', effects, moveSet: sampleMoveSet },
          'ganondorf-id': { name: 'ganondorf', attack: 10, defense: 10, health: 100, maxHealth: 100, speed: 4, heroId: 'ganondorf-id', effects, moveSet: sampleMoveSet },
        }
        higherHealth.playerTeam = activePlayerTeam;
        higherHealth.enemyTeam = activeEnemyTeam;
        higherHealth.activePlayerTeam = ['mario-id', 'link-id'];
        higherHealth.activeEnemyTeam = ['bowser-id', 'ganondorf-id'];
        higherHealth.multiMode = true;


        const battleManager : BattleManager = new BattleManager(higherHealth);
        const actionLog = battleManager.doPlayerTurnMulti([{
          actionType: 'ActionTurn',
          move: sampleMoveSet[0],
          sourceHeroId: 'mario-id',
          targetHeroIds: ['bowser-id', 'ganondorf-id'],
          priority: sampleMoveSet[0].priority
        }, {
          actionType: 'ActionTurn',
          move: sampleMoveSet[1],
          sourceHeroId: 'link-id',
          targetHeroIds: ['mario-id'],
          priority: sampleMoveSet[1].priority
        }])

        const messages = actionLog.map((action : LooseObject) => action.message)

        expect(messages).to.deep.equal([
          'mario used Poison Effect',
          'bowser took 5 damage from Poison Effect',
          'ganondorf took 5 damage from Poison Effect',
          'link used Heal Effect',
          'mario is already at full health!',
          'bowser used Poison Effect',
          'mario took 5 damage from Poison Effect',
          'link took 5 damage from Poison Effect',
          'ganondorf used Poison Effect',
          'mario is already under the influence of Poison Effect!',
          'link is already under the influence of Poison Effect!'
        ])

        const actionLog2 = battleManager.doPlayerTurnMulti([{
          actionType: 'ActionTurn',
          move: sampleMoveSet[0],
          sourceHeroId: 'mario-id',
          targetHeroIds: ['bowser-id', 'ganondorf-id'],
          priority: sampleMoveSet[0].priority
        }])

        const messages2 = actionLog2.map((action : LooseObject) => action.message)
        expect(messages2).to.deep.equal([
          'mario healed 5 HP from Heal Effect',
          'mario took 5 damage from Poison Effect',
          'link took 5 damage from Poison Effect',
          'bowser took 5 damage from Poison Effect',
          'ganondorf took 5 damage from Poison Effect',
          'mario used Poison Effect',
          'bowser is already under the influence of Poison Effect!',
          'ganondorf is already under the influence of Poison Effect!',
          'bowser used Poison Effect',
          'mario is already under the influence of Poison Effect!',
          'link is already under the influence of Poison Effect!',
          'ganondorf used Poison Effect',
          'mario is already under the influence of Poison Effect!',
          'link is already under the influence of Poison Effect!'
        ])
      })

      it('processes targeted effects', () => {
        const battleManager : BattleManager = new BattleManager(configClone);
        const actionLog = battleManager.doPlayerTurnMulti([{
          actionType: 'ActionTurn',
          move: sampleMoveSet[2],
          sourceHeroId: 'mario-id',
          targetHeroIds: ['link-id'],
          priority: sampleMoveSet[2].priority
        }, {
          actionType: 'ActionTurn',
          move: sampleMoveSet[3],
          sourceHeroId: 'link-id',
          targetHeroIds: ['bowser-id'],
          priority: sampleMoveSet[3].priority
        }])

        const messages = actionLog.map((action : LooseObject) => action.message)
        expect(messages).to.deep.equal([
          'mario used Hone Skill',
          "link's attack rose!",
          'link used Terrify',
          "bowser's attack fell!",
          'bowser used Poison Effect',
          'mario took 1 damage from Poison Effect',
          'link took 1 damage from Poison Effect',
          'ganondorf used Poison Effect',
          'mario is already under the influence of Poison Effect!',
          'link is already under the influence of Poison Effect!'
        ])

        const playerTeam = battleManager.getPlayerTeam();
        const enemyTeam = battleManager.getEnemyTeam();

        const link = playerTeam[1];
        const bowser = enemyTeam[0];
        const ganondorf = enemyTeam[1]

        expect(bowser.effects.length).to.equal(0);
        expect(ganondorf.effects.length).to.equal(0);

        expect(link.attack).to.equal(15);
        expect(bowser.attack).to.equal(7);
      })
    })
  })

  describe('Getters and setters', () => {
    it('Gets the active player team', () => {
      const configClone = cloneObject(sampleConfig);
      const sampleMoveSet : LooseObject[] = [
        { name: 'Move1', power: 0, priority: 0, healAmt: 0, isHeal: false },
        { name: 'Move2', power: 0, priority: 0, healAmt: 0, isHeal: false }
      ]
      const defaultEffects : LooseObject[] = [];
      const effects : LooseObject[] = [];
      const activePlayerTeam = {
        'mario-id': { name: 'mario', attack: 10, defense: 10, health: 100, maxHealth: 100, level: 1, speed: 10, heroId: 'mario-id', effects, moveSet: sampleMoveSet },
        'link-id': { name: 'link', attack: 10, defense: 10, health: 100, maxHealth: 100, level: 1, speed: 8, heroId: 'link-id', effects: defaultEffects, moveSet: sampleMoveSet }
      }
      const activeEnemyTeam = {
        'bowser-id': { name: 'bowser', attack: 0, defense: 10, health: 4, maxHealth: 4, level: 1, speed: 6, heroId: 'bowser-id', effects: defaultEffects, moveSet: sampleMoveSet },
        'ganondorf-id': { name: 'ganondorf', attack: 0, defense: 10, health: 4, maxHealth: 4, level: 1, speed: 4, heroId: 'ganondorf-id', effects: defaultEffects, moveSet: sampleMoveSet },
      }
      configClone.playerTeam = activePlayerTeam;
      configClone.enemyTeam = activeEnemyTeam;
      configClone.activePlayerTeam = ['mario-id', 'link-id'];
      configClone.activeEnemyTeam = ['bowser-id', 'ganondorf-id'];
      configClone.multiMode = true;
      const battleManager : BattleManager = new BattleManager(configClone);

      expect(battleManager.getActivePlayerTeam()).to.deep.equal(Object.keys(activePlayerTeam).map((heroId : string) => activePlayerTeam[heroId]))
      expect(battleManager.getActiveEnemyTeam()).to.deep.equal(Object.keys(activeEnemyTeam).map((heroId : string) => activeEnemyTeam[heroId]))
    })

    it('Gets the additional attributes', () => {
      const configClone = cloneObject(sampleConfig);
      const sampleMoveSet : LooseObject[] = [
        { name: 'Move1', power: 0, priority: 0, isHeal: false, healAmt: 0 },
        { name: 'Move2', power: 0, priority: 0, isHeal: false, healAmt: 0 }
      ]
      const defaultEffects : LooseObject[] = [];
      const effects : LooseObject[] = [];

      const additionalAttributes = {
        stamina: 100,
        gender: 'male',
        magic: 150
      }

      const activePlayerTeam = {
        'mario-id': { name: 'mario', attack: 10, defense: 10, health: 100, maxHealth: 100, level: 1, speed: 10, heroId: 'mario-id', effects, moveSet: sampleMoveSet, ...additionalAttributes },
        'link-id': { name: 'link', attack: 10, defense: 10, health: 100, maxHealth: 100, level: 1, speed: 8, heroId: 'link-id', effects: defaultEffects, moveSet: sampleMoveSet, ...additionalAttributes }
      }
      const activeEnemyTeam = {
        'bowser-id': { name: 'bowser', attack: 0, defense: 10, health: 4, maxHealth: 4, level: 1, speed: 6, heroId: 'bowser-id', effects: defaultEffects, moveSet: sampleMoveSet, ...additionalAttributes },
        'ganondorf-id': { name: 'ganondorf', attack: 0, defense: 10, health: 4, maxHealth: 4, level: 1, speed: 4, heroId: 'ganondorf-id', effects: defaultEffects, moveSet: sampleMoveSet, ...additionalAttributes },
      }
      configClone.playerTeam = activePlayerTeam;
      configClone.enemyTeam = activeEnemyTeam;
      configClone.activePlayerTeam = ['mario-id', 'link-id'];
      configClone.activeEnemyTeam = ['bowser-id', 'ganondorf-id'];
      configClone.multiMode = true;
      const battleManager : BattleManager = new BattleManager(configClone);

      const hero = battleManager.getActivePlayerTeam()[0]
      expect(hero).to.haveOwnProperty('stamina')
      expect(hero).to.haveOwnProperty('gender')
      expect(hero).to.haveOwnProperty('magic')
    })

    it('Correctly deserializes heroes', () => {
      const heroConfig = {
        name: 'mario',
        attack: 10,
        defense: 10,
        health: 100,
        maxHealth: 100,
        level: 1,
        speed: 10,
        heroId: 'mario-id',
        effects: [],
        moveSet: [],
        magic: 10,
        stamina: 200,
        gender: 'male',
        age: 20
      }
      const hero = new Hero(heroConfig)
      expect(BattleManager.deserializeHero(hero)).to.deep.equal(heroConfig)
    })

    it('Correctly deserializes moves', () => {
      const moveConfig = {
        name: 'Move1',
        power: 10,
        priority: 0,
        healAmt: 0,
        isHeal: false,
        target: 'enemies',
        staminaCost: 200
      }

      const move = new Move(moveConfig);
      expect(BattleManager.deserializeMoves([move])).to.deep.equal([moveConfig])
    })

    it('Correctly deserializes heroes with moveSets', () => {
      const moveSet = [{
        name: 'Move1',
        power: 10,
        priority: 0,
        healAmt: 0,
        isHeal: false,
        target: 'enemies',
        staminaCost: 200
      }]
      const heroConfig = {
        name: 'mario',
        attack: 10,
        defense: 10,
        health: 100,
        maxHealth: 100,
        level: 1,
        speed: 10,
        heroId: 'mario-id',
        effects: [],
        moveSet
      }

      const hero = new Hero(heroConfig)
      expect(BattleManager.deserializeHero(hero)).to.deep.equal(heroConfig)
    })
  })
})