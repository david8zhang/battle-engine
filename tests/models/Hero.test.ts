import { expect } from 'chai';
import { Hero } from '../../src/models/Hero';
import { LooseObject } from '../../src/interface/LooseObject';
import { Move } from '../../src/models/Move';
import { EffectTurn } from '../../src/models/EffectTurn';
import { IAbstractTurn } from '../../src/interface/IAbstractTurn';

describe('Hero', () => {
  it('wraps a raw object as a hero', () => {
    const rawObject : LooseObject = {
      attack: 10,
      defense: 10,
      health: 150,
      speed: 10,
      level: 55,
      name: 'hero 1',
      heroId: '1',
      effects: [],
      moveSet: []
    }
    const newHero = new Hero(rawObject);
    expect(newHero).to.deep.equal(rawObject);
  })
  it('generates a default id', () => {
    const rawObject : LooseObject = { attack: 10, defense: 10 };
    const newHero = new Hero(rawObject);
    expect(newHero.getHeroId()).does.not.equal(null);
  })
  it('serializes moveset arrays', () => {
    const moves = [{
      power: 10,
      name: 'Move 1',
      priority: 1
    }, {
      power: 15,
      name: 'Move 2',
      priority: 0
    }, {
      power: 20,
      name: 'Move 3',
      priority: 3
    }]
    const newHero = new Hero({});
    newHero.setMoveSet(moves);
    newHero.getMoveSet().forEach((m : Move, index : number) => {
      expect(m.getName()).to.equal(moves[index].name)
      expect(m.getPower()).to.equal(moves[index].power)
      expect(m.getPriority()).to.equal(moves[index].priority)
    })
  })

  it('serializes moves and effects within constructor', () => {
    const moveSet = [{
      power: 10,
      name: 'Move 1',
      priority: 1
    }, {
      power: 15,
      name: 'Move 2',
      priority: 0
    }, {
      power: 20,
      name: 'Move 3',
      priority: 3
    }]
    const effects = [{
      duration: 4,
      name: 'Healing Effect',
      priority: 1,
      targetHeroes: ['1', '2'],
      effect: (heroes : LooseObject[]) : string[] => {
        const actionLog : string[] = [];
        heroes.forEach((h : LooseObject) => {
          h.setHealth(h.getHealth() + 10);
          actionLog.push(`${h.getName()} healed 10 hp from Healing Effect`)
        })
        return actionLog;
      } 
    }]

    const sampleConfig = { effects, moveSet }
    const newHero : Hero = new Hero(sampleConfig);
    newHero.getEffects().forEach((effect : IAbstractTurn) => {
      expect(effect.processTurn).to.be.a('function');
      expect(effect.priority).to.equal(1);
    })

    newHero.getMoveSet().forEach((m : Move, index : number) => {
      expect(m.getName()).to.equal(moveSet[index].name)
      expect(m.getPower()).to.equal(moveSet[index].power)
      expect(m.getPriority()).to.equal(moveSet[index].priority)
    })
  })
})