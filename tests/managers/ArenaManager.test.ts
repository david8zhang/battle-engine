import { expect } from 'chai';
import 'mocha';

/** Managers */
import { ArenaManager } from '../../src/managers/ArenaManager';
import { sampleConfig, sampleHazards } from '../../seed/battleConfig';
import { LooseObject } from '../../src/interface/LooseObject';

describe('Arena Manager', () => {
  it('converts a set of hazards if provided', () => {
    const arenaManager = new ArenaManager(sampleConfig);
    expect(arenaManager.getHazards()).to.deep.equal(sampleHazards);
  })
  it('adds hazard Loose Objects correctly', () => {
    const arenaManager = new ArenaManager({});
    const newHazard : LooseObject = {
      name: 'Effect 3',
      duration: 10,
      priority: 0,
      targetHeroes: ['123', '456']
    }
    arenaManager.addHazard(newHazard)
    expect(arenaManager.getHazards()).to.deep.equal([newHazard]);
  })
})