import { expect } from 'chai';
import 'mocha';

/** Managers */
import { TeamManager } from '../../src/managers/TeamManager';
import { CPUManager } from '../../src/managers/CPUManager';
import { ArenaManager } from '../../src/managers/ArenaManager';

/** Sample setup */
import { sampleConfig } from '../../seed/battleConfig';
import { LooseObject } from '../../src/interface/LooseObject';
import { ActionTurn } from '../../src/models/ActionTurn';
import { SwitchTurn } from '../../src/models/SwitchTurn';

const cloneObject = (obj : LooseObject) : LooseObject => {
  return JSON.parse(JSON.stringify(obj));
}

describe('CPU Manager', () => {
  describe('Basic CPU Behavior', () => {
    it('correctly chooses the moveset available to enemy team', () => {
      const configClone = cloneObject(sampleConfig);
      const playerTeam : LooseObject = {
        '1': { name: 'hero1', attack: 10, defense: 10, health: 100, speed: 50, heroId: '1', effects: [], moves: [] }
      }
      const sampleMoveSet = [{
        name: 'Move 1',
        power: 10,
        priority: 0
      }, {
        name: 'Move 2',
        power: 15,
        priority: 0
      }]
      const enemyTeam : LooseObject = {
        '2': { name: 'enemy1', attack: 10, defense: 10, health: 1, speed: 50, heroId: '1', effects: [], moveSet: sampleMoveSet },
      }
      configClone.playerTeam = playerTeam;
      configClone.enemyTeam = enemyTeam;
      const teamManager = new TeamManager(configClone);
      const arenaManager = new ArenaManager(configClone);
      const cpuManager = new CPUManager(configClone);
      const enemyTurn : ActionTurn = cpuManager.getCPUTurn(arenaManager, teamManager) as ActionTurn;
      expect(enemyTurn.priority).to.equal(0);
      expect(enemyTurn._getMove().getName()).to.equal(sampleMoveSet[0].name);
      expect(enemyTurn._getMove().getPower()).to.equal(sampleMoveSet[0].power);
      expect(enemyTurn._getMove().getPriority()).to.equal(sampleMoveSet[0].priority);
    })

    it('handles the case in which there are no moves to choose from', () => {
      const configClone = cloneObject(sampleConfig);
      const playerTeam : LooseObject = {
        '1': { name: 'hero1', attack: 10, defense: 10, health: 100, speed: 50, heroId: '1', effects: [], moveSet: [] }
      }
      const sampleMoveSet : LooseObject[] = [];
      const enemyTeam : LooseObject = {
        '2': { name: 'enemy1', attack: 10, defense: 10, health: 1, speed: 50, heroId: '1', effects: [], moveSet: sampleMoveSet },
      }
      configClone.playerTeam = playerTeam;
      configClone.enemyTeam = enemyTeam;
      const teamManager = new TeamManager(configClone);
      const arenaManager = new ArenaManager(configClone);
      const cpuManager = new CPUManager(configClone);
      const enemyTurn : ActionTurn = cpuManager.getCPUTurn(arenaManager, teamManager) as ActionTurn;
      expect(enemyTurn).to.equal(null);
    })

    it('handles switching heroes', () => {
      const configClone = cloneObject(sampleConfig);
      const enemyTeam : LooseObject = {
        '2': { name: 'enemy1', attack: 10, defense: 10, health: 0, speed: 1, heroId: '1', effects: [], moveSet: [] },
        '3': { name: 'enemy2', attack: 10, defense: 10, health: 10, speed: 1, heroId: '1', effects: [], moveSet: [] }
      }
      configClone.enemyTeam = enemyTeam;
      const teamManager = new TeamManager(configClone);
      const arenaManager = new ArenaManager(configClone);
      const cpuManager = new CPUManager(configClone);
      const enemyTurn : SwitchTurn = cpuManager.getCPUTurn(arenaManager, teamManager) as SwitchTurn;
      expect(enemyTurn._getNewActiveHero()).to.equal('3');
      expect(enemyTurn._getSide()).to.equal('enemy');
    })
  })
  describe('Customized CPU Behavior', () => {
    it ('correctly utilizes custom move calculators', () => {
      const simpleMoveCalculator = (params : LooseObject) => {
        const { playerHero, enemyHero } = params;
        return {
          move: enemyHero.getMoveSet()[1],
          sourceHeroId: enemyHero.getHeroId(),
          targetHeroIds: [playerHero.getHeroId()],
          priority: 10
        };
      }
      const configClone = cloneObject(sampleConfig);
      const playerTeam : LooseObject = {
        '1': { name: 'target', attack: 10, defense: 10, health: 100, speed: 50, heroId: '1', effects: [], moves: [] }
      }
      const sampleMoveSet = [{
        name: 'Move 1',
        power: 10,
        priority: 0
      }, {
        name: 'Move 2',
        power: 15,
        priority: 0
      }]
      const enemyTeam : LooseObject = {
        '2': { name: 'enemy1', attack: 10, defense: 10, health: 1, speed: 50, heroId: '2', effects: [], moveSet: sampleMoveSet },
      }
      configClone.playerTeam = playerTeam;
      configClone.enemyTeam = enemyTeam;
      configClone.moveCalculator = simpleMoveCalculator;
      const teamManager = new TeamManager(configClone);
      const arenaManager = new ArenaManager(configClone);
      const cpuManager = new CPUManager(configClone);
      const enemyTurn : ActionTurn = cpuManager.getCPUTurn(arenaManager, teamManager) as ActionTurn;
      expect(enemyTurn._getMove().getName()).to.equal(sampleMoveSet[1].name);
      expect(enemyTurn._getMove().getPower()).to.equal(sampleMoveSet[1].power);
      expect(enemyTurn.priority).to.equal(10);
      expect(enemyTurn._getSourceHeroId()).to.equal('2');
      expect(enemyTurn._getTargetHeroIds()).to.deep.equal(['1']);
    })

    it('correctly utilizes custom switching behavior', () => {
      const simpleSwitcher = (params : LooseObject) => {
        const { enemyTeam } = params;
        return {
          newActiveHero: '4',
          priority: -1,
          side: 'enemy'
        }
      }
      const enemyTeam : LooseObject = {
        '2': { name: 'enemy1', attack: 10, defense: 10, health: 0, speed: 50, heroId: '2', effects: [], moveSet: [] },
        '4': { name: 'enemy4', attack: 10, defense: 10, health: 100, speed: 10, heroId: '4', effects: [], moveSet: [] }
      }
      const configClone = cloneObject(sampleConfig);
      configClone.enemyTeam = enemyTeam;
      configClone.switchCalculator = simpleSwitcher;

      const teamManager = new TeamManager(configClone);
      const arenaManager = new ArenaManager(configClone);
      const cpuManager = new CPUManager(configClone);

      const enemyTurn : SwitchTurn = cpuManager.getCPUTurn(arenaManager, teamManager) as SwitchTurn;
      expect(enemyTurn._getNewActiveHero()).to.equal('4');
      expect(enemyTurn._getSide()).to.equal('enemy');
    })
  })
})