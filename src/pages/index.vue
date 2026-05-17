<template>
  <div>
    <h1>ER диаграмма</h1>

    <img
      alt="ER диаграмма"
      height="100%"
      src="../assets/ERD.png"
      width="100%"
    />
    <v-btn text="Загрузить тестовые данные" @click="handleReset" />
  </div>
</template>
<script setup lang="ts">
import { inject } from "vue";
import { PGLiteKey, resetData } from "@/plugins/db";

const db = inject(PGLiteKey);
async function handleReset() {
  await resetData(db);
}
</script>
