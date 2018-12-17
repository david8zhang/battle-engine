import { expect } from 'chai';
import { Hero } from '../../src/models/Hero';
import { LooseObject } from '../../src/interface/LooseObject';

describe('Hero', () => {
  it('wraps a raw object as a hero', () => {
    const rawObject : LooseObject = {
      attack: 10,
      defense: 10,
      health: 150,
      name: 'hero 1',
      heroId: '1',
      effects: []
    }
    const newHero = new Hero(rawObject);
    expect(newHero).to.deep.equal(rawObject);
  })
  it('generates a default id', () => {
    const rawObject : LooseObject = { attack: 10, defense: 10 };
    const newHero = new Hero(rawObject);
    expect(newHero.getHeroId()).does.not.equal(null);
  })
})