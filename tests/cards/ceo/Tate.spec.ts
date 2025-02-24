import {expect} from 'chai';
import {Game} from '../../../src/server/Game';
import {TestPlayer} from '../../TestPlayer';
import {forceGenerationEnd} from '../../TestingUtils';
import {getTestPlayer, newTestGame} from '../../TestGame';
import {cast, runAllActions} from '../../TestingUtils';
import {ICard} from '../../../src/server/cards/ICard';
import {SelectCard} from '../../../src/server/inputs/SelectCard';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {SelectOption} from '../../../src/server/inputs/SelectOption';
import {Tag} from '../../../src/common/cards/Tag';

import {Tate} from '../../../src/server/cards/ceos/Tate';

describe('Tate', function() {
  let card: Tate;
  let player: TestPlayer;
  let game: Game;

  beforeEach(() => {
    card = new Tate();
    player = TestPlayer.BLUE.newPlayer();
    game = newTestGame(1);
    player = getTestPlayer(game, 0);
    player.megaCredits = 6;
  });

  it('Takes OPG action', function() {
    // Sanity:
    expect(player.megaCredits).eq(6);
    expect(player.cardsInHand).is.empty;

    const orOptions = cast(card.action(player), OrOptions);
    // Select tag [0] (Tag.BUILDING)
    orOptions.options[0].cb();
    const selectOption = cast(orOptions.options[0], SelectOption);
    const selectCard = cast(selectOption.cb(), SelectCard<ICard>);

    // Buy two cards:
    selectCard.cb([selectCard.cards[0], selectCard.cards[1]]);
    runAllActions(player.game);

    expect(player.megaCredits).eq(0);
    expect(player.cardsInHand).has.length(2);
    expect(player.cardsInHand[0].tags).contains(Tag.BUILDING);
    expect(player.cardsInHand[1].tags).contains(Tag.BUILDING);
  });

  it('Takes OPG action, only buy one card', function() {
    // Sanity:
    expect(player.megaCredits).eq(6);
    expect(player.cardsInHand).is.empty;

    // Select tag [0] (Tag.BUILDING)
    const orOptions = cast(card.action(player), OrOptions);
    orOptions.options[0].cb();
    const selectOption = cast(orOptions.options[0], SelectOption);
    const selectCard = cast(selectOption.cb(), SelectCard<ICard>);

    // Buy two cards:
    selectCard.cb([selectCard.cards[0]]);
    runAllActions(player.game);

    expect(player.megaCredits).eq(3);
    expect(player.cardsInHand).has.length(1);
    expect(player.cardsInHand[0].tags).contains(Tag.BUILDING);
  });

  it('Can only act once per game', function() {
    card.action(player);
    forceGenerationEnd(game);
    expect(card.isDisabled).is.true;
    expect(card.canAct(player)).is.false;
  });
});
