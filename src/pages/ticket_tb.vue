<template>
  <v-sheet border rounded>
    <v-data-table
      :headers="headers"
      :hide-default-footer="tickets.length < 11"
      item-value="ticket_id"
      :items="tickets"
    >
      <template #top>
        <v-toolbar flat>
          <v-toolbar-title>
            <v-icon
              color="medium-emphasis"
              icon="mdi-ticket"
              size="x-small"
              start
            />
            Билеты
          </v-toolbar-title>

          <v-btn
            border
            class="me-2"
            prepend-icon="mdi-plus"
            rounded="lg"
            text="Добавить билет"
            @click="add"
          />
        </v-toolbar>
      </template>

      <template #item.purchase_date="{ value }">
        {{ formatDate(value) }}
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex ga-2 justify-end">
          <v-icon
            color="medium-emphasis"
            icon="mdi-pencil"
            size="small"
            @click="edit(item.ticket_id)"
          />

          <v-icon
            color="medium-emphasis"
            icon="mdi-delete"
            size="small"
            @click="remove(item.ticket_id)"
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

  <v-dialog v-model="dialog" max-width="700">
    <v-card
      :subtitle="`${isEditing ? 'Обновление существующего' : 'Создание нового'} билета`"
      :title="`${isEditing ? 'Редактирование' : 'Добавление'} билета`"
    >
      <template #text>
        <v-row>
          <v-col cols="12" md="6">
            <v-select
              v-model="formModel.trip_id"
              item-title="trip_name"
              item-value="trip_id"
              :items="tripsList"
              label="Номер рейса"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="formModel.shift_id"
              item-title="shift_name"
              item-value="shift_id"
              :items="shiftsList"
              label="Смена (Кассир)"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="formModel.customer_id"
              item-title="customer_name"
              item-value="customer_id"
              :items="customersList"
              label="Клиент"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="formModel.purchase_date"
              label="Дата и время покупки"
              type="datetime-local"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="formModel.bus_stop_in_id"
              item-title="title"
              item-value="bus_stop_id"
              :items="busStopsList"
              label="Станция посадки"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="formModel.bus_stop_out_id"
              item-title="title"
              item-value="bus_stop_id"
              :items="busStopsList"
              label="Станция высадки"
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-number-input
              v-model="formModel.price"
              label="Цена билета"
              :min="0"
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field v-model="formModel.seat_number" label="Номер места" />
          </v-col>

          <v-col cols="12" md="4">
            <v-select
              v-model="formModel.status"
              :items="['Активный', 'Отменен', 'Завершен']"
              label="Статус"
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
    ticket_id: null,
    trip_id: null,
    shift_id: null,
    customer_id: null,
    bus_stop_in_id: null,
    bus_stop_out_id: null,
    purchase_date: "",
    price: 0,
    seat_number: "",
    status: "Активный",
  };
}

const tickets = ref([]);
const tripsList = ref([]);
const shiftsList = ref([]);
const customersList = ref([]);
const busStopsList = ref([]);

const formModel = ref(createNewRecord());
const dialog = shallowRef(false);
const isEditing = toRef(() => !!formModel.value.ticket_id);

const headers = [
  { title: "Рейс", key: "trip_name", align: "start" },
  { title: "Кассир", key: "employee_name" },
  { title: "Клиент", key: "customer_name" },
  { title: "Станция посадки", key: "bus_stop_in_title" },
  { title: "Станция высадки", key: "bus_stop_out_title" },
  { title: "Время покупки", key: "purchase_date" },
  { title: "Цена", key: "price" },
  { title: "Место", key: "seat_number" },
  { title: "Статус", key: "status" },
  { title: "Действия", key: "actions", align: "end", sortable: false },
];

async function loadRelations() {
  if (!db) return;
  try {
    const tRes = await db.query(
      `SELECT trip_id, 'Рейс ' || trip_id AS trip_name FROM trip ORDER BY trip_id DESC;`,
    );
    tripsList.value = tRes.rows;

    const sRes = await db.query(`
      SELECT s.shift_id, 'Смена ' || s.shift_id || ' (' || e.surname || ' ' || substring(e."name" from 1 for 1) || '.)' AS shift_name 
      FROM shift s 
      JOIN employee e ON s.employee_id = e.employee_id 
      ORDER BY s.shift_id DESC;
    `);
    shiftsList.value = sRes.rows;

    const cRes = await db.query(`
      SELECT customer_id, surname || ' ' || substring("name" from 1 for 1) || '.' AS customer_name 
      FROM customer 
      ORDER BY surname ASC;
    `);
    customersList.value = cRes.rows;

    const bsRes = await db.query(
      `SELECT bus_stop_id, title FROM bus_stop ORDER BY title ASC;`,
    );
    busStopsList.value = bsRes.rows;
  } catch (error) {
    console.error(error);
  }
}

async function loadData() {
  if (!db) return;
  try {
    const query = `
      SELECT 
        tk.ticket_id, tk.trip_id, tk.shift_id, tk.customer_id, tk.bus_stop_in_id, tk.bus_stop_out_id,
        tk.purchase_date, tk.price, tk.seat_number, tk.status,
        'Рейс ' || tk.trip_id AS trip_name,
        e.surname || ' ' || substring(e."name" from 1 for 1) || '.' AS employee_name,
        c.surname || ' ' || substring(c."name" from 1 for 1) || '.' AS customer_name,
        bs_in.title AS bus_stop_in_title,
        bs_out.title AS bus_stop_out_title
      FROM ticket tk
      JOIN shift s ON tk.shift_id = s.shift_id
      JOIN employee e ON s.employee_id = e.employee_id
      JOIN customer c ON tk.customer_id = c.customer_id
      JOIN bus_stop bs_in ON tk.bus_stop_in_id = bs_in.bus_stop_id
      JOIN bus_stop bs_out ON tk.bus_stop_out_id = bs_out.bus_stop_id
      ORDER BY tk.purchase_date DESC;
    `;
    const res = await db.query(query);
    tickets.value = res.rows;
  } catch (error) {
    console.error(error);
  }
}

onMounted(async () => {
  await loadRelations();
  await loadData();
});

function formatForInput(date_string) {
  if (!date_string) return "";
  const d = new Date(date_string);
  const pad = (n) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
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

function add() {
  formModel.value = createNewRecord();
  dialog.value = true;
}

function edit(ticket_id) {
  const found = tickets.value.find((t) => t.ticket_id === ticket_id);
  if (found) {
    formModel.value = {
      ticket_id: found.ticket_id,
      trip_id: found.trip_id,
      shift_id: found.shift_id,
      customer_id: found.customer_id,
      bus_stop_in_id: found.bus_stop_in_id,
      bus_stop_out_id: found.bus_stop_out_id,
      purchase_date: formatForInput(found.purchase_date),
      price: Number(found.price),
      seat_number: found.seat_number,
      status: found.status,
    };
    dialog.value = true;
  }
}

async function remove(ticket_id) {
  if (!confirm("Вы уверены?")) return;
  try {
    await db.query("DELETE FROM ticket WHERE ticket_id = $1;", [ticket_id]);
    await loadData();
  } catch (error) {
    console.error(error);
  }
}

async function save() {
  if (
    !formModel.value.trip_id ||
    !formModel.value.shift_id ||
    !formModel.value.customer_id ||
    !formModel.value.bus_stop_in_id ||
    !formModel.value.bus_stop_out_id ||
    !formModel.value.purchase_date ||
    !formModel.value.seat_number
  ) {
    alert("Пожалуйста, заполните все поля");
    return;
  }

  if (formModel.value.bus_stop_in_id === formModel.value.bus_stop_out_id) {
    alert("Станция посадки и высадки не могут совпадать");
    return;
  }

  try {
    await (isEditing.value
      ? db.query(
          `UPDATE ticket 
         SET trip_id = $1, shift_id = $2, customer_id = $3, bus_stop_in_id = $4, bus_stop_out_id = $5, purchase_date = $6, price = $7, seat_number = $8, status = $9 
         WHERE ticket_id = $10;`,
          [
            formModel.value.trip_id,
            formModel.value.shift_id,
            formModel.value.customer_id,
            formModel.value.bus_stop_in_id,
            formModel.value.bus_stop_out_id,
            formModel.value.purchase_date,
            formModel.value.price,
            formModel.value.seat_number,
            formModel.value.status,
            formModel.value.ticket_id,
          ],
        )
      : db.query(
          `INSERT INTO ticket 
         (trip_id, shift_id, customer_id, bus_stop_in_id, bus_stop_out_id, purchase_date, price, seat_number, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
          [
            formModel.value.trip_id,
            formModel.value.shift_id,
            formModel.value.customer_id,
            formModel.value.bus_stop_in_id,
            formModel.value.bus_stop_out_id,
            formModel.value.purchase_date,
            formModel.value.price,
            formModel.value.seat_number,
            formModel.value.status,
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
</script>
