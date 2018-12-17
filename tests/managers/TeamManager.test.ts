import { expect } from 'chai';
import 'mocha';

/** Managers */
import { TeamManager } from '../../src/managers/TeamManager'
import { Hero } from '../../src/models/Hero';
import { LooseObject } from '../../src/interface/LooseObject';

/** Seed Data */
import { sampleConfig, samplePlayerHeroes, sampleEnemyHeroes } from '../../seed/battleConfig';

describe('Team Manager', () => {
  describe('with no battle config', () => {
    it('initializes a random player team if no battle config', () => {
      const battleConfig = {};
      const teamManager = new TeamManager(battleConfig);
      const playerTeam : LooseObject = teamManager.getPlayerTeam();
      expect(playerTeam).does.not.deep.equal({});
      const playerTeamArray = Object.keys(playerTeam).map((key) => playerTeam[key]);
      playerTeamArray.forEach((hero : Hero) => {
        expect(hero).to.have.property('name');
        expect(hero).to.have.property('health');
        expect(hero).to.have.property('attack');
        expect(hero).to.have.property('defense');
        expect(hero).to.have.property('effects');
      })
    })
    it('initializes a random enemy team if no battle config', () => {
      const battleConfig = {};
      const teamManager = new TeamManager(battleConfig);
      const enemyTeam : LooseObject = teamManager.getEnemyTeam();
      expect(enemyTeam).does.not.deep.equal({});
      const enemyTeamArray = Object.keys(enemyTeam).map((key) => enemyTeam[key]);
      enemyTeamArray.forEach((hero : Hero) => {
        expect(hero).to.have.property('name');
        expect(hero).to.have.property('health');
        expect(hero).to.have.property('attack');
        expect(hero).to.have.property('defense');
        expect(hero).to.have.property('effects');
      })
    })
    it('initializes an active player as the first id', () => {
      const battleConfig = {};
      const teamManager = new TeamManager(battleConfig);
      const playerTeam : LooseObject = teamManager.getPlayerTeam();
      const firstId = Object.keys(playerTeam)[0];
      expect(teamManager.getActivePlayerHero().getHeroId()).equals(firstId);
    })
    it('initializes an active enemy as the first id', () => {
      const battleConfig = {};
      const teamManager = new TeamManager(battleConfig);
      const enemyTeam : LooseObject = teamManager.getEnemyTeam();
      const firstId = Object.keys(enemyTeam)[0];
      expect(teamManager.getActiveEnemyHero().getHeroId()).equals(firstId);
    })
  })
  describe('with battle config', () => {
    it('generates a player/enemy teams when player generator is passed', () => {
      const teamManager = new TeamManager(sampleConfig);
      const playerTeam : LooseObject = teamManager.getPlayerTeam();
      const enemyTeam : LooseObject = teamManager.getEnemyTeam();
      expect(playerTeam).to.deep.equal(samplePlayerHeroes);
      expect(enemyTeam).to.deep.equal(sampleEnemyHeroes);
    })
    it('generates a random hero set if one is provided and one is not', () => {
      const newConfig = { ...sampleConfig }
      delete newConfig['playerGenerator'];
      const teamManager = new TeamManager(sampleConfig);
      const playerTeam : LooseObject = teamManager.getPlayerTeam();
      const enemyTeam : LooseObject = teamManager.getEnemyTeam();
      expect(playerTeam).does.not.deep.equal({})
      expect(enemyTeam).to.deep.equal(sampleEnemyHeroes);
    })
  })
})