<template>
  <v-sheet border rounded>
    <v-data-table
      :headers="headers"
      :hide-default-footer="route_stops.length < 11"
      :items="route_stops"
    >
      <template #top>
        <v-toolbar flat>
          <v-toolbar-title>
            <v-icon
              color="medium-emphasis"
              icon="mdi-bus"
              size="x-small"
              start
            />

            Остановки маршрута
          </v-toolbar-title>

          <v-btn
            border
            class="me-2"
            prepend-icon="mdi-plus"
            rounded="lg"
            text="Добавить остановку маршрута"
            @click="add"
          />
        </v-toolbar>
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex ga-2 justify-end">
          <v-icon
            color="medium-emphasis"
            icon="mdi-pencil"
            size="small"
            @click="edit(item.id)"
          />

          <v-icon
            color="medium-emphasis"
            icon="mdi-delete"
            size="small"
            @click="remove(item.id)"
          />
        </div>
      </template>

      <template #no-data>
        <v-btn
          border
          prepend-icon="mdi-backup-restore"
          rounded="lg"
          text="Reset data"
          variant="text"
          @click="reset"
        />
      </template>
    </v-data-table>
  </v-sheet>

  <v-dialog v-model="dialog" max-width="500">
    <v-card
      :subtitle="`${isEditing ? 'Обновите существующую' : 'Создайте новую'} остановку маршрута`"
      :title="`${isEditing ? 'Редактируйте' : 'Добавьте'} остановку маршрута`"
    >
      <template #text>
        <v-row>
          <v-col cols="12" md="6">
            <v-select
              v-model="formModel.route"
              :items="['Чита - Борзя', 'Чита - Улан-Удэ', 'Чита - Иркутск']"
              label="Маршрут"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="formModel.bus_stop"
              :items="[
                'Чита',
                'Улёты',
                'Non-Хилок',
                'Петровск-Забайкальский',
                'Мухоршибирь',
                'Улан-Удэ',
              ]"
              label="Остановка"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-number-input
              v-model="formModel.sequence"
              label="Порядковый номер"
              :min="1"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-number-input
              v-model="formModel.traveltime"
              label="Время в пути (мин)"
              :min="1"
            />
          </v-col>
        </v-row>
      </template>

      <v-divider />

      <v-card-actions class="bg-surface-light">
        <v-btn text="Отмена" variant="plain" @click="dialog = false" />

        <v-spacer />

        <v-btn text="Сохранить" @click="save" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup>
import { onMounted, ref, shallowRef, toRef } from "vue";

function createNewRecord() {
  return {
    route: "",
    bus_stop: "",
    sequence: 1,
    traveltime: 1,
  };
}

const route_stops = ref([]);
const formModel = ref(createNewRecord());
const dialog = shallowRef(false);
const isEditing = toRef(() => !!formModel.value.id);

const headers = [
  { title: "Маршрут", key: "route", align: "start" },
  { title: "Остановка", key: "bus_stop" },
  { title: "Порядковый номер", key: "sequence" },
  { title: "Время в пути (мин)", key: "traveltime", align: "end" },
  { title: "Действия", key: "actions", align: "end", sortable: false },
];

onMounted(() => {
  reset();
});

function add() {
  formModel.value = createNewRecord();
  dialog.value = true;
}

function edit(id) {
  const found = route_stops.value.find((route_stop) => route_stop.id === id);

  formModel.value = {
    id: found.id,
    route: found.route,
    bus_stop: found.bus_stop,
    sequence: found.sequence,
    traveltime: found.traveltime,
  };

  dialog.value = true;
}

function remove(id) {
  const index = route_stops.value.findIndex(
    (route_stop) => route_stop.id === id,
  );
  route_stops.value.splice(index, 1);
}

function save() {
  if (isEditing.value) {
    const index = route_stops.value.findIndex(
      (route_stop) => route_stop.id === formModel.value.id,
    );
    route_stops.value[index] = formModel.value;
  } else {
    formModel.value.id = route_stops.value.length + 1;
    route_stops.value.push(formModel.value);
  }

  dialog.value = false;
}

function reset() {
  dialog.value = false;
  formModel.value = createNewRecord();
  route_stops.value = [
    {
      id: 1,
      route: "Чита - Улан-Удэ",
      bus_stop: "Чита",
      sequence: 1,
      traveltime: 0,
    },
    {
      id: 2,
      route: "Чита - Улан-Удэ",
      bus_stop: "Улёты",
      sequence: 2,
      traveltime: 80,
    },
    {
      id: 3,
      route: "Чита - Улан-Удэ",
      bus_stop: "Хилок",
      sequence: 3,
      traveltime: 90,
    },
    {
      id: 4,
      route: "Чита - Улан-Удэ",
      bus_stop: "Петровск-Забайкальский",
      sequence: 4,
      traveltime: 90,
    },
    {
      id: 5,
      route: "Чита - Улан-Удэ",
      bus_stop: "Мухоршибирь",
      sequence: 5,
      traveltime: 75,
    },
    {
      id: 6,
      route: "Чита - Улан-Удэ",
      bus_stop: "Улан-Удэ",
      sequence: 6,
      traveltime: 75,
    },
  ];
}
</script>
