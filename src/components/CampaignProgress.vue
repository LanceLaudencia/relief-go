<template>
  <div class="campaign-progress">
    <p class="amounts">
      <strong>{{ formatPeso(raised) }}</strong>
      <span> raised of {{ formatPeso(goal) }}</span>
    </p>
    <ion-progress-bar :value="progress"></ion-progress-bar>
    <p class="percent">{{ percent }}% funded (verified donations only)</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonProgressBar } from '@ionic/vue';
import { formatPeso, calculateProgress } from '../utils/format';

const props = defineProps<{
  raised: number;
  goal: number;
}>();

const progress = computed(() => calculateProgress(props.raised, props.goal));
const percent = computed(() => Math.round(progress.value * 100));
</script>

<style scoped>
.amounts {
  margin: 0 0 8px;
  color: #1f2933;
}

.amounts span {
  color: #52606d;
}

.percent {
  margin: 6px 0 0;
  font-size: 0.85rem;
  color: #52606d;
}
</style>