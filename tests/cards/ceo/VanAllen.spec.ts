import {expect} from 'chai';
import {Game} from '../../../src/server/Game';
import {getTestPlayer, newTestGame} from '../../TestGame';
import {TestPlayer} from '../../TestPlayer';
import {cast} from '../../TestingUtils';
import {OrOptions} from '../../../src/server/inputs/OrOptions';

import {VanAllen} from '../../../src/server/cards/ceos/VanAllen';

describe('Van Allen', function() {
  let card: VanAllen;
  let player: TestPlayer;
  let game: Game;

  beforeEach(() => {
    card = new VanAllen();
    game = newTestGame(2, {ceoExtension: true});
    player = getTestPlayer(game, 0);
  });

  it('Cannot claim for free if VanAllen is not in play', function() {
    player.megaCredits = 0;
    player.setTerraformRating(35); // Can claim Terraformer milestone
    const actions = cast(player.getActions(), OrOptions);
    const claimMilestoneAction = actions.options.find((option) => option.title === 'Claim a milestone');
    expect(claimMilestoneAction).is.undefined;
  });


  it('Can claim milestones for free, and gains 3 M€ upon claim', function() {
    player.playedCards.push(card);

    player.megaCredits = 0;

    player.setTerraformRating(35); // Can claim Terraformer milestone

    const actions = cast(player.getActions(), OrOptions);
    const claimMilestoneAction = cast(actions.options.find((option) => option.title === 'Claim a milestone'), OrOptions);

    expect(claimMilestoneAction).is.not.undefined;

    claimMilestoneAction!.options![0].cb();
    game.deferredActions.runAll(() => {});
    expect(player.megaCredits).eq(3); // No M€ cost incurred, gains 3 M€ instead
    const claimedMilestone = player.game.claimedMilestones;
    expect(claimedMilestone.find((cm) => cm.milestone.name === 'Terraformer' && cm.player === player)).is.not.undefined;
  });
});
