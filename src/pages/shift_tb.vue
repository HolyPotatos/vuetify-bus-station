<template>
  <v-sheet border rounded>
    <v-data-table
      :headers="headers"
      :hide-default-footer="shifts.length < 11"
      :items="shifts"
    >
      <template #top>
        <v-toolbar flat>
          <v-toolbar-title>
            <v-icon
              color="medium-emphasis"
              icon="mdi-account"
              size="x-small"
              start
            />

            Смены
          </v-toolbar-title>

          <v-btn
            border
            class="me-2"
            prepend-icon="mdi-plus"
            rounded="lg"
            text="Добавить смену"
            @click="add"
          />
        </v-toolbar>
      </template>

      <template #item.start_time="{ value }">
        {{ formatDate(value) }}
      </template>

      <template #item.end_time="{ value }">
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
      :subtitle="`${isEditing ? 'Обновить существующую' : 'Создать новую'} смену`"
      :title="`${isEditing ? 'Редактировать' : 'Добавить'} смену`"
    >
      <template #text>
        <v-row>
          <v-col cols="12">
            <v-select
              v-model="formModel.employee"
              :items="[
                'Морозова Е.И.',
                'Соколов Д.А.',
                'Павлова А.С.',
                'Белов М.Н.',
              ]"
              label="Сотрудник"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="formModel.start_time"
              label="Время начала смены"
              type="datetime-local"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="formModel.end_time"
              label="Время конца смены"
              type="datetime-local"
            />
          </v-col>
        </v-row>
      </template>

      <v-divider />

      <v-card-actions class="bg-surface-light">
        <v-btn text="Cancel" variant="plain" @click="dialog = false" />

        <v-spacer />

        <v-btn text="Save" @click="save" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup>
import { onMounted, ref, shallowRef, toRef } from "vue";

function createNewRecord() {
  return {
    employee: "",
    start_time: null,
    end_time: null,
  };
}

const shifts = ref([]);
const formModel = ref(createNewRecord());
const dialog = shallowRef(false);
const isEditing = toRef(() => !!formModel.value.id);

const headers = [
  { title: "Сотрудник", key: "employee", align: "start" },
  { title: "Начало смены", key: "start_time" },
  { title: "Конец смены", key: "end_time" },
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
  const found = shifts.value.find((shift) => shift.id === id);

  formModel.value = {
    id: found.id,
    employee: found.employee,
    start_time: found.start_time,
    end_time: found.end_time,
  };

  dialog.value = true;
}

function remove(id) {
  const index = shifts.value.findIndex((shift) => shift.id === id);
  shifts.value.splice(index, 1);
}

function save() {
  if (isEditing.value) {
    const index = shifts.value.findIndex(
      (shift) => shift.id === formModel.value.id,
    );
    shifts.value[index] = formModel.value;
  } else {
    formModel.value.id = shifts.value.length + 1;
    shifts.value.push(formModel.value);
  }

  dialog.value = false;
}

function reset() {
  dialog.value = false;
  formModel.value = createNewRecord();
  shifts.value = [
    {
      id: 1,
      employee: "Морозова Е.И.",
      start_time: "2026-05-03T10:00",
      end_time: "2026-05-03T20:00",
    },
    {
      id: 2,
      employee: "Морозова Е.И.",
      start_time: "2026-05-04T10:00",
      end_time: "2026-05-04T20:00",
    },
    {
      id: 3,
      employee: "Морозова Е.И.",
      start_time: "2026-05-05T10:00",
      end_time: "2026-05-05T20:00",
    },
    {
      id: 4,
      employee: "Соколов Д.А.",
      start_time: "2026-05-06T10:00",
      end_time: "2026-05-06T20:00",
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
