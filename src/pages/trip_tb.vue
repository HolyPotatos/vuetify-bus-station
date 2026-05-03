<template>
  <v-sheet border rounded>
    <v-data-table
      :headers="headers"
      :hide-default-footer="trips.length < 11"
      :items="trips"
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

            Рейсы
          </v-toolbar-title>

          <v-btn
            border
            class="me-2"
            prepend-icon="mdi-plus"
            rounded="lg"
            text="Добавить рейс"
            @click="add"
          />
        </v-toolbar>
      </template>

      <template #item.start_time="{ value }">
        {{ formatDate(value) }}
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
      :subtitle="`${isEditing ? 'Обновление существующего' : 'Создание нового'} рейса`"
      :title="`${isEditing ? 'Редактирование' : 'Добавление'} рейса`"
    >
      <template #text>
        <v-row>
          <v-col cols="12" md="6">
            <v-select
              v-model="formModel.bus"
              :items="[
                'A123BА77',
                'Х555KX99',
                'M782HH150',
                'X001EE777',
                'B456OT123',
              ]"
              label="Автобус"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="formModel.route"
              :items="['Чита - Борзя', 'Чита - Улан-Удэ', 'Чита - Иркутск']"
              label="Маршрут"
            />
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="formModel.start_time"
              label="Время отправления"
              type="datetime-local"
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
    bus: "",
    route: "",
    start_time: null,
  };
}

const trips = ref([]);
const formModel = ref(createNewRecord());
const dialog = shallowRef(false);
const isEditing = toRef(() => !!formModel.value.id);

const headers = [
  { title: "Номер рейса", key: "id", align: "start" },
  { title: "Автобус", key: "bus" },
  { title: "Маршрут", key: "route" },
  { title: "Дата и время отправления", key: "start_time" },
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
  const found = trips.value.find((trip) => trip.id === id);

  formModel.value = {
    id: found.id,
    bus: found.bus,
    route: found.route,
    start_time: found.start_time,
  };

  dialog.value = true;
}

function remove(id) {
  const index = trips.value.findIndex((trip) => trip.id === id);
  trips.value.splice(index, 1);
}

function save() {
  if (isEditing.value) {
    const index = trips.value.findIndex(
      (trip) => trip.id === formModel.value.id,
    );
    trips.value[index] = formModel.value;
  } else {
    formModel.value.id = trips.value.length + 1;
    trips.value.push(formModel.value);
  }

  dialog.value = false;
}

function reset() {
  dialog.value = false;
  formModel.value = createNewRecord();
  trips.value = [
    {
      id: 1,
      bus: "A123BА77",
      route: "Чита - Борзя",
      start_time: "2026-05-06T10:00",
    },
    {
      id: 2,
      bus: "M782HH150",
      route: "Чита - Иркутск",
      start_time: "2026-05-05T10:00",
    },
    {
      id: 3,
      bus: "B456OT123",
      route: "Чита - Борзя",
      start_time: "2026-05-05T10:00",
    },
  ];
}

function formatDate(date_string) {
  if (!date_string) return "";

  const date = new Date(date_string);

  return date.toLocaleString("ru-RU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>
