<template>
  <v-sheet border rounded>
    <v-data-table
      :headers="headers"
      :hide-default-footer="routes.length < 11"
      :items="routes"
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

            Маршруты
          </v-toolbar-title>

          <v-btn
            border
            class="me-2"
            prepend-icon="mdi-plus"
            rounded="lg"
            text="Добавить маршрут"
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
      :subtitle="`${isEditing ? 'Обновите существующий' : 'Создайте новый'} маршрут`"
      :title="`${isEditing ? 'Редактируйте' : 'Добавьте'} маршрут`"
    >
      <template #text>
        <v-row>
          <v-col cols="12">
            <v-text-field v-model="formModel.title" label="Название маршрута" />
          </v-col>

          <v-col cols="12">
            <v-number-input
              v-model="formModel.traveltime"
              label="Общее время пути"
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
    title: "",
    traveltime: 1,
  };
}

const routes = ref([]);
const formModel = ref(createNewRecord());
const dialog = shallowRef(false);
const isEditing = toRef(() => !!formModel.value.id);

const headers = [
  { title: "Название маршрута", key: "title", align: "start" },
  { title: "Время пути (мин)", key: "traveltime" },
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
  const found = routes.value.find((route) => route.id === id);

  formModel.value = {
    id: found.id,
    title: found.title,
    traveltime: found.traveltime,
  };

  dialog.value = true;
}

function remove(id) {
  const index = routes.value.findIndex((route) => route.id === id);
  routes.value.splice(index, 1);
}

function save() {
  if (isEditing.value) {
    const index = routes.value.findIndex(
      (route) => route.id === formModel.value.id,
    );
    routes.value[index] = formModel.value;
  } else {
    formModel.value.id = routes.value.length + 1;
    routes.value.push(formModel.value);
  }

  dialog.value = false;
}

function reset() {
  dialog.value = false;
  formModel.value = createNewRecord();
  routes.value = [
    {
      id: 1,
      title: "Чита - Борзя",
      traveltime: 410,
    },
    {
      id: 2,
      title: "Чита - Улан-Удэ",
      traveltime: 510,
    },
    {
      id: 3,
      title: "Чита - Иркутск",
      traveltime: 660,
    },
  ];
}
</script>
