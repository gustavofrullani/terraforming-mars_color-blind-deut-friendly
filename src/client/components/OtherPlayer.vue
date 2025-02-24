<script lang="ts">

import Vue from 'vue';

import StackedCards from '@/client/components/StackedCards.vue';
import {PlayerMixin} from '@/client/mixins/PlayerMixin';
import {PublicPlayerModel} from '@/common/models/PlayerModel';
import {vueRoot} from '@/client/components/vueRoot';
import Card from '@/client/components/card/Card.vue';
import Button from '@/client/components/common/Button.vue';
import {CardType} from '@/common/cards/CardType';

export default Vue.extend({
  name: 'OtherPlayer',
  props: {
    player: {
      type: Object as () => PublicPlayerModel,
    },
    playerIndex: {
      type: Number,
    },
  },
  components: {
    Button,
    'stacked-cards': StackedCards,
    Card,
  },
  methods: {
    ...PlayerMixin.methods,
    hideMe() {
      vueRoot(this).setVisibilityState('pinned_player_' + this.playerIndex, false);
    },
    isVisible() {
      return vueRoot(this).getVisibilityState(
        'pinned_player_' + this.playerIndex,
      );
    },
  },
  computed: {
    CardType(): typeof CardType {
      return CardType;
    },
  },
});
</script>
<template>
  <div v-show="isVisible()" class="other_player_cont menu">
      <Button size="big" type="close" @click="hideMe" :disableOnServerBusy="false" align="right" />
      <div v-if="player.tableau.length > 0" class="player_home_block">
          <span class="player_name" :class="'player_bg_color_' + player.color"> {{ player.name }} played cards </span>
          <div>
              <div v-for="card in getCardsByType(player.tableau, [CardType.CORPORATION])" :key="card.name" class="cardbox">
                  <Card :card="card" :actionUsed="isCardActivated(card, player)"/>
              </div>
              <div v-for="card in getCardsByType(player.tableau, [CardType.CEO])" :key="card.name" class="cardbox">
                  <Card :card="card" :actionUsed="isCardActivated(card, player)"/>
              </div>

              <div v-for="card in sortActiveCards(getCardsByType(player.tableau, [CardType.ACTIVE]))" :key="card.name" class="cardbox">
                  <Card :card="card" :actionUsed="isCardActivated(card, player)"/>
              </div>
              <stacked-cards :cards="getCardsByType(player.tableau, [CardType.AUTOMATED, CardType.PRELUDE])" :player="player"></stacked-cards>
              <stacked-cards :cards="getCardsByType(player.tableau, [CardType.EVENT])" :player="player"></stacked-cards>
          </div>
      </div>
      <div v-if="player.selfReplicatingRobotsCards.length > 0" class="player_home_block">
          <span> Self-Replicating Robots cards </span>
          <div>
              <div v-for="card in getCardsByType(player.selfReplicatingRobotsCards, [CardType.ACTIVE])" :key="card.name" class="cardbox">
                  <Card :card="card" />
              </div>
          </div>
      </div>
  </div>
</template>
