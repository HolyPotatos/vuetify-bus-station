<template>
  <v-sheet border rounded>
    <v-data-table
      :headers="headers"
      :hide-default-footer="trips.length < 11"
      item-value="trip_id"
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

      <template #item.departure_time="{ value }">
        {{ formatDate(value) }}
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex ga-2 justify-end">
          <v-icon
            color="medium-emphasis"
            icon="mdi-pencil"
            size="small"
            @click="edit(item.trip_id)"
          />

          <v-icon
            color="medium-emphasis"
            icon="mdi-delete"
            size="small"
            @click="remove(item.trip_id)"
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

  <v-dialog v-model="dialog" max-width="600">
    <v-card
      :subtitle="`${isEditing ? 'Обновление существующего' : 'Создание нового'} рейса`"
      :title="`${isEditing ? 'Редактирование' : 'Добавление'} рейса`"
    >
      <template #text>
        <v-row>
          <v-col cols="12" md="6">
            <v-select
              v-model="formModel.driver_id"
              item-title="driver_name"
              item-value="driver_id"
              :items="driversList"
              label="Водитель"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="formModel.bus_id"
              item-title="bus_name"
              item-value="bus_id"
              :items="busesList"
              label="Автобус"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="formModel.route_id"
              item-title="title"
              item-value="route_id"
              :items="routesList"
              label="Маршрут"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="formModel.departure_time"
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
import { inject, onMounted, ref, shallowRef, toRef } from "vue";
import { PGLiteKey, resetData } from "@/plugins/db";

const db = inject(PGLiteKey);

function createNewRecord() {
  return {
    trip_id: null,
    driver_id: null,
    bus_id: null,
    route_id: null,
    departure_time: "",
  };
}

const trips = ref([]);
const driversList = ref([]);
const busesList = ref([]);
const routesList = ref([]);
const formModel = ref(createNewRecord());
const dialog = shallowRef(false);
const isEditing = toRef(() => !!formModel.value.trip_id);

const headers = [
  { title: "Номер рейса", key: "trip_id", align: "start" },
  { title: "Водитель", key: "driver_name" },
  { title: "Автобус", key: "bus_plate" },
  { title: "Маршрут", key: "route_title" },
  { title: "Дата и время отправления", key: "departure_time" },
  { title: "Действия", key: "actions", align: "end", sortable: false },
];

async function loadRelations() {
  if (!db) return;
  try {
    const dRes = await db.query(
      `SELECT driver_id, surname || ' ' || substring("name" from 1 for 1) || '.' AS driver_name FROM driver ORDER BY surname ASC;`,
    );
    driversList.value = dRes.rows;

    const bRes = await db.query(
      `SELECT bus_id, brand || ' (' || plate_number || ')' AS bus_name FROM bus ORDER BY plate_number ASC;`,
    );
    busesList.value = bRes.rows;

    const rRes = await db.query(
      `SELECT route_id, title FROM route ORDER BY title ASC;`,
    );
    routesList.value = rRes.rows;
  } catch (error) {
    console.error(error);
  }
}

async function loadData() {
  if (!db) return;
  try {
    const query = `
      SELECT 
        t.trip_id,
        t.driver_id,
        t.bus_id,
        t.route_id,
        t.departure_time,
        d.surname || ' ' || substring(d."name" from 1 for 1) || '.' AS driver_name,
        b.plate_number AS bus_plate,
        r.title AS route_title
      FROM trip t
      JOIN driver d ON t.driver_id = d.driver_id
      JOIN bus b ON t.bus_id = b.bus_id
      JOIN route r ON t.route_id = r.route_id
      ORDER BY t.departure_time DESC;
    `;
    const res = await db.query(query);
    trips.value = res.rows;
  } catch (error) {
    console.error(error);
  }
}

onMounted(async () => {
  await loadRelations();
  await loadData();
});

function add() {
  formModel.value = createNewRecord();
  dialog.value = true;
}

function formatForInput(date_string) {
  if (!date_string) return "";
  const d = new Date(date_string);
  const pad = (n) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function edit(trip_id) {
  const found = trips.value.find((t) => t.trip_id === trip_id);
  if (found) {
    formModel.value = {
      trip_id: found.trip_id,
      driver_id: found.driver_id,
      bus_id: found.bus_id,
      route_id: found.route_id,
      departure_time: formatForInput(found.departure_time),
    };
    dialog.value = true;
  }
}

async function remove(trip_id) {
  if (!confirm("Вы уверены?")) return;
  try {
    await db.query("DELETE FROM trip WHERE trip_id = $1;", [trip_id]);
    await loadData();
  } catch (error) {
    console.error(error);
  }
}

async function save() {
  if (
    !formModel.value.driver_id ||
    !formModel.value.bus_id ||
    !formModel.value.route_id ||
    !formModel.value.departure_time
  ) {
    alert("Заполните все поля");
    return;
  }

  try {
    await (isEditing.value
      ? db.query(
          "UPDATE trip SET driver_id = $1, bus_id = $2, route_id = $3, departure_time = $4 WHERE trip_id = $5;",
          [
            formModel.value.driver_id,
            formModel.value.bus_id,
            formModel.value.route_id,
            formModel.value.departure_time,
            formModel.value.trip_id,
          ],
        )
      : db.query(
          "INSERT INTO trip (driver_id, bus_id, route_id, departure_time) VALUES ($1, $2, $3, $4);",
          [
            formModel.value.driver_id,
            formModel.value.bus_id,
            formModel.value.route_id,
            formModel.value.departure_time,
          ],
        ));
    await loadData();
  } catch (error) {
    console.error(error);
  } finally {
    dialog.value = false;
  }
}

async function reset() {
  await resetData(db);
  await loadRelations();
  await loadData();
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
