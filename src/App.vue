<template>
  <v-app>
    <v-main>
      <MainLayout />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { initDb, provideDb } from "@/plugins/db";
import MainLayout from "./components/MainLayout.vue";

const db = provideDb();
onMounted(async () => {
  await initDb(db);
});
</script>
