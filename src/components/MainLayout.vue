<template>
  <v-layout class="rounded rounded-md border">
    <v-app-bar :elevation="1" rounded>
      <template #prepend>
        <v-app-bar-nav-icon @click="drawer = !drawer" />
      </template>

      <v-app-bar-title>Автовокзал</v-app-bar-title>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer">
      <v-list active-color="primary" nav>
        <v-list-item link title="Главная" to="/" />
        <v-list-item link title="Билеты" to="/ticket" />
        <v-list-item link title="Рейсы" to="/trip" />
        <v-list-item link title="Автобусы" to="/bus" />
        <v-list-item link title="Водители" to="/driver" />
        <v-list-item link title="Перевозчики" to="/carrier" />
        <v-list-item link title="Клиенты" to="/customer" />
        <v-list-item link title="Сотрудники" to="/employee" />
        <v-list-item link title="Роли сотрудников" to="/role" />
        <v-list-item link title="Смены" to="/shift" />
        <v-list-item link title="Остановки" to="/busstop" />
        <v-list-item link title="Остановки маршрута" to="/routestop" />
        <v-list-item link title="Маршруты" to="/route" />
      </v-list>
    </v-navigation-drawer>

    <v-main class="d-flex align-center justify-center" height="100vh">
      <v-container>
        <router-view />
      </v-container>
    </v-main>
  </v-layout>
</template>
<script setup lang="ts">
import { ref } from "vue";

const drawer = ref(true);
</script>
