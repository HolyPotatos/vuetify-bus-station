<template>
  <v-sheet border rounded>
    <v-data-table
      :headers="headers"
      :hide-default-footer="routes.length < 11"
      item-value="route_id"
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
            @click="edit(item.route_id)"
          />

          <v-icon
            color="medium-emphasis"
            icon="mdi-delete"
            size="small"
            @click="remove(item.route_id)"
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
              v-model="formModel.total_time"
              label="Общее время пути (мин)"
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
import { inject, onMounted, ref, shallowRef, toRef } from "vue";
import { PGLiteKey, resetData } from "@/plugins/db";

const db = inject(PGLiteKey);

function createNewRecord() {
  return {
    route_id: null,
    title: "",
    total_time: 1,
  };
}

const routes = ref([]);
const formModel = ref(createNewRecord());
const dialog = shallowRef(false);
const isEditing = toRef(() => !!formModel.value.route_id);

const headers = [
  { title: "Название маршрута", key: "title", align: "start" },
  { title: "Время пути (мин)", key: "total_time" },
  { title: "Действия", key: "actions", align: "end", sortable: false },
];

async function loadData() {
  if (!db) return;
  try {
    const res = await db.query("SELECT * FROM route ORDER BY route_id ASC;");
    routes.value = res.rows;
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

function edit(route_id) {
  const found = routes.value.find((route) => route.route_id === route_id);
  if (found) {
    formModel.value = {
      route_id: found.route_id,
      title: found.title,
      total_time: found.total_time,
    };
    dialog.value = true;
  }
}

async function remove(route_id) {
  if (!confirm("Вы уверены?")) return;
  try {
    await db.query("DELETE FROM route WHERE route_id = $1;", [route_id]);
    await loadData();
  } catch (error) {
    console.error(error);
  }
}

async function save() {
  if (!formModel.value.title.trim()) {
    alert("Название маршрута не может быть пустым");
    return;
  }

  try {
    await (isEditing.value
      ? db.query(
          "UPDATE route SET title = $1, total_time = $2 WHERE route_id = $3;",
          [
            formModel.value.title,
            formModel.value.total_time,
            formModel.value.route_id,
          ],
        )
      : db.query("INSERT INTO route (title, total_time) VALUES ($1, $2);", [
          formModel.value.title,
          formModel.value.total_time,
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
