<template>
  <v-sheet border rounded>
    <v-data-table
      :headers="headers"
      :hide-default-footer="shifts.length < 11"
      item-value="shift_id"
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
            @click="edit(item.shift_id)"
          />

          <v-icon
            color="medium-emphasis"
            icon="mdi-delete"
            size="small"
            @click="remove(item.shift_id)"
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
      :subtitle="`${isEditing ? 'Обновить существующую' : 'Создать новую'} смену`"
      :title="`${isEditing ? 'Редактировать' : 'Добавить'} смену`"
    >
      <template #text>
        <v-row>
          <v-col cols="12">
            <v-select
              v-model="formModel.employee_id"
              item-title="short_name"
              item-value="employee_id"
              :items="employees"
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
    shift_id: null,
    employee_id: null,
    start_time: "",
    end_time: "",
  };
}

const shifts = ref([]);
const employees = ref([]);
const formModel = ref(createNewRecord());
const dialog = shallowRef(false);
const isEditing = toRef(() => !!formModel.value.shift_id);

const headers = [
  { title: "Сотрудник", key: "employee_name", align: "start" },
  { title: "Начало смены", key: "start_time" },
  { title: "Конец смены", key: "end_time" },
  { title: "Действия", key: "actions", align: "end", sortable: false },
];

async function loadEmployees() {
  if (!db) return;
  try {
    const query = `
      SELECT 
        employee_id, 
        surname || ' ' || substring("name" from 1 for 1) || '.' || COALESCE(substring(patronymic from 1 for 1) || '.', '') AS short_name 
      FROM employee 
      WHERE role_id IN (3, 4)
      ORDER BY surname ASC;
    `;
    const res = await db.query(query);
    employees.value = res.rows;
  } catch (error) {
    console.error(error);
  }
}
async function loadData() {
  if (!db) return;
  try {
    const query = `
      SELECT 
        s.shift_id, 
        s.employee_id, 
        s.start_time, 
        s.end_time,
        e.surname || ' ' || substring(e."name" from 1 for 1) || '.' || COALESCE(substring(e.patronymic from 1 for 1) || '.', '') AS employee_name
      FROM shift s
      JOIN employee e ON s.employee_id = e.employee_id
      ORDER BY s.start_time DESC;
    `;
    const res = await db.query(query);
    shifts.value = res.rows;
  } catch (error) {
    console.error(error);
  }
}

onMounted(async () => {
  await loadEmployees();
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

function edit(shift_id) {
  const found = shifts.value.find((s) => s.shift_id === shift_id);
  if (found) {
    formModel.value = {
      shift_id: found.shift_id,
      employee_id: found.employee_id,
      start_time: formatForInput(found.start_time),
      end_time: formatForInput(found.end_time),
    };
    dialog.value = true;
  }
}

async function remove(shift_id) {
  if (!confirm("Вы уверены?")) return;
  try {
    await db.query("DELETE FROM shift WHERE shift_id = $1;", [shift_id]);
    await loadData();
  } catch (error) {
    console.error(error);
  }
}

async function save() {
  if (
    !formModel.value.employee_id ||
    !formModel.value.start_time ||
    !formModel.value.end_time
  ) {
    alert("Заполните все поля");
    return;
  }

  const start = new Date(formModel.value.start_time);
  const end = new Date(formModel.value.end_time);

  if (end <= start) {
    alert(
      "Ошибка: время окончания смены должно быть строго больше времени начала",
    );
    return;
  }

  try {
    await (isEditing.value
      ? db.query(
          "UPDATE shift SET employee_id = $1, start_time = $2, end_time = $3 WHERE shift_id = $4;",
          [
            formModel.value.employee_id,
            formModel.value.start_time,
            formModel.value.end_time,
            formModel.value.shift_id,
          ],
        )
      : db.query(
          "INSERT INTO shift (employee_id, start_time, end_time) VALUES ($1, $2, $3);",
          [
            formModel.value.employee_id,
            formModel.value.start_time,
            formModel.value.end_time,
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
  await loadEmployees();
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
