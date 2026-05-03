<template>
  <v-sheet border rounded>
    <v-data-table
      :headers="headers"
      :hide-default-footer="tickets.length < 11"
      :items="tickets"
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

      <template #item.buy_time="{ value }">
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
      :subtitle="`${isEditing ? 'Обновите существующий' : 'Создайте новый'} билет`"
      :title="`${isEditing ? 'Редактируйте' : 'Добавьте'} билет`"
    >
      <template #text>
        <v-row>
          <v-col cols="12" md="6">
            <v-select
              v-model="formModel.trip"
              :items="['1', '2', '3']"
              label="Номер рейса"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="formModel.employee"
              :items="['Морозова Е.И.', 'Соколова Д.А.']"
              label="Кассир"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="formModel.customer"
              :items="[
                'Иванов И.И.',
                'Петров П.П.',
                'Иванова А.И.',
                'Никушина В.В.',
              ]"
              label="Клиент"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="formModel.bus_stop_in"
              :items="[
                'Чита',
                'Улёты',
                'Хилок',
                'Петровск-Забайкальский',
                'Мухоршибирь',
                'Улан-Удэ',
              ]"
              label="Станция посадки"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="formModel.bus_stop_out"
              :items="[
                'Чита',
                'Улёты',
                'Хилок',
                'Петровск-Забайкальский',
                'Мухоршибирь',
                'Улан-Удэ',
              ]"
              label="Станция высадки"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="formModel.buy_time"
              label="Дата покупки билета"
              type="datetime-local"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-number-input
              v-model="formModel.price"
              label="Цена билета"
              :min="0"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-number-input
              v-model="formModel.seat_number"
              label="Номер места"
              :min="1"
            />
          </v-col>

          <v-col cols="12">
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
import { onMounted, ref, shallowRef, toRef } from "vue";

function createNewRecord() {
  return {
    trip: "",
    employee: "",
    customer: "",
    bus_stop_in: "",
    bus_stop_out: "",
    buy_time: null,
    price: 0,
    seat_number: 1,
    status: "Активный",
  };
}

const tickets = ref([]);
const formModel = ref(createNewRecord());
const dialog = shallowRef(false);
const isEditing = toRef(() => !!formModel.value.id);

const headers = [
  { title: "Номер рейса", key: "trip", align: "start" },
  { title: "Кассир", key: "employee" },
  { title: "Клиент", key: "customer" },
  { title: "Станция посадки", key: "bus_stop_in" },
  { title: "Станция высадки", key: "bus_stop_out" },
  { title: "Время покупки", key: "buy_time" },
  { title: "Цена билета", key: "price" },
  { title: "Номер места", key: "seat_number" },
  { title: "Статус", key: "status" },
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
  const found = tickets.value.find((ticket) => ticket.id === id);

  formModel.value = {
    id: found.id,
    trip: found.trip,
    employee: found.employee,
    customer: found.customer,
    bus_stop_in: found.bus_stop_in,
    bus_stop_out: found.bus_stop_out,
    buy_time: found.buy_time,
    price: found.price,
    seat_number: found.seat_number,
    status: found.status,
  };

  dialog.value = true;
}

function remove(id) {
  const index = tickets.value.findIndex((ticket) => ticket.id === id);
  tickets.value.splice(index, 1);
}

function save() {
  if (isEditing.value) {
    const index = tickets.value.findIndex(
      (ticket) => ticket.id === formModel.value.id,
    );
    tickets.value[index] = formModel.value;
  } else {
    formModel.value.id = tickets.value.length + 1;
    tickets.value.push(formModel.value);
  }

  dialog.value = false;
}

function reset() {
  dialog.value = false;
  formModel.value = createNewRecord();
  tickets.value = [
    {
      id: 1,
      trip: "1",
      employee: "Морозова Е.И.",
      customer: "Иванов И.И.",
      bus_stop_in: "Чита",
      bus_stop_out: "Хилок",
      buy_time: "2026-05-01T08:15",
      price: 850,
      seat_number: 12,
      status: "Завершен",
    },
    {
      id: 2,
      trip: "1",
      employee: "Морозова Е.И.",
      customer: "Петров П.П.",
      bus_stop_in: "Чита",
      bus_stop_out: "Улан-Удэ",
      buy_time: "2026-05-01T08:15",
      price: 1500,
      seat_number: 14,
      status: "Завершен",
    },
    {
      id: 3,
      trip: "1",
      employee: "Соколова Д.А.",
      customer: "Никушина В.В.",
      bus_stop_in: "Улёты",
      bus_stop_out: "Мухоршибирь",
      buy_time: "2026-05-02T10:05",
      price: 900,
      seat_number: 5,
      status: "Завершен",
    },
    {
      id: 4,
      trip: "1",
      employee: "Морозова Е.И.",
      customer: "Иванова А.И.",
      bus_stop_in: "Петровск-Забайкальский",
      bus_stop_out: "Улан-Удэ",
      buy_time: "2026-05-03T11:30",
      price: 600,
      seat_number: 22,
      status: "Активный",
    },
    {
      id: 5,
      trip: "2",
      employee: "Соколова Д.А.",
      customer: "Иванов И.И.",
      bus_stop_in: "Чита",
      bus_stop_out: "Улёты",
      buy_time: "2026-05-03T14:45",
      price: 350,
      seat_number: 2,
      status: "Активный",
    },
    {
      id: 6,
      trip: "2",
      employee: "Морозова Е.И.",
      customer: "Петров П.П.",
      bus_stop_in: "Хилок",
      bus_stop_out: "Улан-Удэ",
      buy_time: "2026-05-04T16:10",
      price: 1100,
      seat_number: 8,
      status: "Активный",
    },
    {
      id: 7,
      trip: "2",
      employee: "Соколова Д.А.",
      customer: "Никушина В.В.",
      bus_stop_in: "Чита",
      bus_stop_out: "Петровск-Забайкальский",
      buy_time: "2026-05-04T14:45",
      price: 1200,
      seat_number: 15,
      status: "Отменен",
    },
    {
      id: 8,
      trip: "3",
      employee: "Морозова Е.И.",
      customer: "Иванова А.И.",
      bus_stop_in: "Мухоршибирь",
      bus_stop_out: "Улан-Удэ",
      buy_time: "2026-05-05T07:50",
      price: 400,
      seat_number: 4,
      status: "Активный",
    },
    {
      id: 9,
      trip: "3",
      employee: "Соколова Д.А.",
      customer: "Иванов И.И.",
      bus_stop_in: "Улёты",
      bus_stop_out: "Хилок",
      buy_time: "2026-05-05T12:00",
      price: 550,
      seat_number: 18,
      status: "Активный",
    },
    {
      id: 10,
      trip: "3",
      employee: "Морозова Е.И.",
      customer: "Петров П.П.",
      bus_stop_in: "Чита",
      bus_stop_out: "Улан-Удэ",
      buy_time: "2026-05-06T18:30",
      price: 1500,
      seat_number: 1,
      status: "Активный",
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
