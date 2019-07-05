import { expect } from 'chai';
import 'mocha';

/** Managers */
import { BattleManager } from '../../src/managers/BattleManager';

import { sampleConfig } from '../../seed/battleConfig';
import { LooseObject } from '../../src/interface/LooseObject';

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
        { name: 'Move1', power: 10, priority: 0 },
        { name: 'Move2', power: 10, priority: 0 }
      ]
      const effects : LooseObject[] = [];
      const playerTeam = {
        'mario-id': { name: 'mario', attack: 10, defense: 10, health: 4, level: 1, speed: 10, heroId: 'mario-id', effects, moveSet: sampleMoveSet },
        'link-id': { name: 'link', attack: 10, defense: 10, health: 4, level: 1, speed: 8, heroId: 'link-id', effects, moveSet: sampleMoveSet },
        'pikachu-id': { name: 'pikachu', attack: 10, defense: 10, health: 4, level: 1, speed: 8, heroId: 'pikachu-id', effects, moveSet: sampleMoveSet },
        'donkey-kong-id': { name: 'donkey kong', attack: 15, defense: 10, health: 4, level: 1, speed: 8, heroId: 'donkey-kong-id', effects, moveSet: sampleMoveSet }
      }
      const enemyTeam = {
        'bowser-id': { name: 'bowser', attack: 10, defense: 10, health: 4, level: 1, speed: 6, heroId: 'bowser-id', effects, moveSet: sampleMoveSet },
        'ganondorf-id': { name: 'ganondorf', attack: 10, defense: 10, health: 4, level: 1, speed: 4, heroId: 'ganondorf-id', effects, moveSet: sampleMoveSet },
        'ridley-id': { name: 'ridley', attack: 10, defense: 10, health: 4, level: 1, speed: 4, heroId: 'ridley-id', effects, moveSet: sampleMoveSet },
        'krool-id': { name: 'king k rool', attack: 10, defense: 10, health: 4, level: 1, speed: 4, heroId: 'ridley-id', effects, moveSet: sampleMoveSet }
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
          oldActiveHeroTeam: [playerTeam['mario-id'], playerTeam['link-id']],
          newActiveHeroTeam: [playerTeam['pikachu-id'], playerTeam['donkey-kong-id']]
        }
      }]
      expect(actionLog).to.deep.equal(multiSwitchActionLog);
      expect(battleManager.getActivePlayerTeam()[0]).to.deep.equal(playerTeam['pikachu-id']);
      expect(battleManager.getActivePlayerTeam()[1]).to.deep.equal(playerTeam['donkey-kong-id']);
    })
    it('correctly handles CPU switch out logic', () => {
      const configClone = cloneObject(sampleConfig);
      const sampleMoveSet : LooseObject[] = [
        { name: 'Move1', power: 10, priority: 0 },
        { name: 'Move2', power: 10, priority: 0 }
      ]
      const effects : LooseObject[] = [];
      const playerTeam = {
        'mario-id': { name: 'mario', attack: 1000, defense: 10, health: 4, level: 1, speed: 10, heroId: 'mario-id', effects, moveSet: sampleMoveSet },
        'link-id': { name: 'link', attack: 1000, defense: 10, health: 4, level: 1, speed: 8, heroId: 'link-id', effects, moveSet: sampleMoveSet },
        'pikachu-id': { name: 'pikachu', attack: 1000, defense: 10, health: 4, level: 1, speed: 8, heroId: 'pikachu-id', effects, moveSet: sampleMoveSet },
        'donkey-kong-id': { name: 'donkey kong', attack: 1000, defense: 10, health: 4, level: 1, speed: 8, heroId: 'donkey-kong-id', effects, moveSet: sampleMoveSet }
      }
      const enemyTeam = {
        'bowser-id': { name: 'bowser', attack: 10, defense: 10, health: 4, level: 1, speed: 6, heroId: 'bowser-id', effects, moveSet: sampleMoveSet },
        'ganondorf-id': { name: 'ganondorf', attack: 10, defense: 10, health: 4, level: 1, speed: 4, heroId: 'ganondorf-id', effects, moveSet: sampleMoveSet },
        'ridley-id': { name: 'ridley', attack: 10, defense: 10, health: 4, level: 1, speed: 4, heroId: 'ridley-id', effects, moveSet: sampleMoveSet },
        'krool-id': { name: 'king k rool', attack: 10, defense: 10, health: 4, level: 1, speed: 4, heroId: 'ridley-id', effects, moveSet: sampleMoveSet }
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
  })
})