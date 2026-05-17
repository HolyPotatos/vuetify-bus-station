<template>
  <v-sheet border rounded>
    <v-data-table
      :headers="headers"
      :hide-default-footer="bus_stops.length < 11"
      item-value="bus_stop_id"
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
            @click="edit(item.bus_stop_id)"
          />

          <v-icon
            color="medium-emphasis"
            icon="mdi-delete"
            size="small"
            @click="remove(item.bus_stop_id)"
          />
        </div>
      </template>

      <template #no-data>
        <v-btn
          border
          prepend-icon="mdi-backup-restore"
          rounded="lg"
          text="Загрузить тестовые данные"
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
import { inject, onMounted, ref, shallowRef, toRef } from "vue";
import { PGLiteKey, resetData } from "@/plugins/db";

const db = inject(PGLiteKey);

function createNewRecord() {
  return {
    bus_stop_id: null,
    title: "",
  };
}

const bus_stops = ref([]);
const formModel = ref(createNewRecord());
const dialog = shallowRef(false);
const isEditing = toRef(() => !!formModel.value.bus_stop_id);

const headers = [
  { title: "Название остановки", key: "title", align: "start" },
  { title: "Действия", key: "actions", align: "end", sortable: false },
];

async function loadData() {
  if (!db) return;
  try {
    const res = await db.query(
      "SELECT * FROM bus_stop ORDER BY bus_stop_id ASC;",
    );
    bus_stops.value = res.rows;
  } catch (error) {
    console.error(error);
  }
}

onMounted(() => {
  loadData();
});

function add() {
  formModel.value = createNewRecord();
  dialog.value = true;
}

function edit(bus_stop_id) {
  const found = bus_stops.value.find(
    (bus_stop) => bus_stop.bus_stop_id === bus_stop_id,
  );
  if (found) {
    formModel.value = {
      bus_stop_id: found.bus_stop_id,
      title: found.title,
    };
    dialog.value = true;
  }
}

async function remove(bus_stop_id) {
  if (!confirm("Вы уверены?")) return;
  try {
    await db.query("DELETE FROM bus_stop WHERE bus_stop_id = $1;", [
      bus_stop_id,
    ]);
    await loadData();
  } catch (error) {
    console.error(error);
  }
}

async function save() {
  if (!formModel.value.title.trim()) {
    alert("Название остановки не может быть пустым");
    return;
  }

  try {
    await (isEditing.value
      ? db.query("UPDATE bus_stop SET title = $1 WHERE bus_stop_id = $2;", [
          formModel.value.title,
          formModel.value.bus_stop_id,
        ])
      : db.query("INSERT INTO bus_stop (title) VALUES ($1);", [
          formModel.value.title,
        ]));
    await loadData();
  } catch (error) {
    console.error(error);
  } finally {
    dialog.value = false;
  }
}

async function reset() {
  await resetData(db);
  await loadData();
}
</script>
