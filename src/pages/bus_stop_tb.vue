<template>
  <v-sheet border rounded>
    <v-data-table
      :headers="headers"
      :hide-default-footer="bus_stops.length < 11"
      :items="bus_stops"
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

            Остановки
          </v-toolbar-title>

          <v-btn
            border
            class="me-2"
            prepend-icon="mdi-plus"
            rounded="lg"
            text="Добавить остановку"
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
      :subtitle="`${isEditing ? 'Обновите существующую' : 'Создайте новую'} остановку автобуса`"
      :title="`${isEditing ? 'Редактировать' : 'Добавить'} остановку автобуса`"
    >
      <template #text>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="formModel.title"
              label="Название остановки"
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
  };
}

const bus_stops = ref([]);
const formModel = ref(createNewRecord());
const dialog = shallowRef(false);
const isEditing = toRef(() => !!formModel.value.id);

const headers = [
  { title: "Название остановки", key: "title", align: "start" },
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
  const found = bus_stops.value.find((bus_stop) => bus_stop.id === id);

  formModel.value = {
    id: found.id,
    title: found.title,
  };

  dialog.value = true;
}

function remove(id) {
  const index = bus_stops.value.findIndex((bus_stop) => bus_stop.id === id);
  bus_stops.value.splice(index, 1);
}

function save() {
  if (isEditing.value) {
    const index = bus_stops.value.findIndex(
      (bus_stop) => bus_stop.id === formModel.value.id,
    );
    bus_stops.value[index] = formModel.value;
  } else {
    formModel.value.id = bus_stops.value.length + 1;
    bus_stops.value.push(formModel.value);
  }

  dialog.value = false;
}

function reset() {
  dialog.value = false;
  formModel.value = createNewRecord();
  bus_stops.value = [
    {
      id: 1,
      title: "Чита",
    },
    {
      id: 2,
      title: "Улёты",
    },
    {
      id: 3,
      title: "Хилок",
    },
    {
      id: 4,
      title: "Петровск-Забайкальский",
    },
    {
      id: 5,
      title: "Мухоршибирь",
    },
    {
      id: 6,
      title: "Улан-Удэ",
    },
  ];
}
</script>
