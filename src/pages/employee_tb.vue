<template>
  <v-sheet border rounded>
    <v-data-table
      :headers="headers"
      :hide-default-footer="employees.length < 11"
      item-value="employee_id"
      :items="employees"
    >
      <template #top>
        <v-toolbar flat>
          <v-toolbar-title>
            <v-icon
              color="medium-emphasis"
              icon="mdi-account-tie"
              size="x-small"
              start
            />
            Сотрудники
          </v-toolbar-title>

          <v-btn
            border
            class="me-2"
            prepend-icon="mdi-plus"
            rounded="lg"
            text="Добавить сотрудника"
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
            @click="edit(item.employee_id)"
          />

          <v-icon
            color="medium-emphasis"
            icon="mdi-delete"
            size="small"
            @click="remove(item.employee_id)"
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
      :subtitle="`${isEditing ? 'Обновите существующего' : 'Создайте нового'} сотрудника`"
      :title="`${isEditing ? 'Редактируйте' : 'Добавьте'} сотрудника`"
    >
      <template #text>
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field v-model="formModel.surname" label="Фамилия" />
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field v-model="formModel.name" label="Имя" />
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field v-model="formModel.patronymic" label="Отчество" />
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="formModel.phone_number"
              label="Номер телефона"
            />
          </v-col>

          <v-col cols="12">
            <v-select
              v-model="formModel.role_id"
              item-title="title"
              item-value="role_id"
              :items="roles"
              label="Роль сотрудника"
              placeholder="Выберите роль"
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
    employee_id: null,
    role_id: null,
    surname: "",
    name: "",
    patronymic: "",
    phone_number: "",
  };
}

const employees = ref([]);
const roles = ref([]);
const formModel = ref(createNewRecord());
const dialog = shallowRef(false);
const isEditing = toRef(() => !!formModel.value.employee_id);

const headers = [
  { title: "Фамилия", key: "surname", align: "start" },
  { title: "Имя", key: "name" },
  { title: "Отчество", key: "patronymic" },
  { title: "Номер телефона", key: "phone_number" },
  { title: "Роль", key: "role_title" },
  { title: "Действия", key: "actions", align: "end", sortable: false },
];

async function loadRoles() {
  if (!db) return;
  try {
    const res = await db.query(
      'SELECT role_id, title FROM "role" ORDER BY role_id ASC;',
    );
    roles.value = res.rows;
  } catch (error) {
    console.error("Ошибка при загрузке списка ролей:", error);
  }
}

async function loadData() {
  if (!db) return;
  try {
    const query = `
      SELECT 
        e.employee_id, e.role_id, e.surname, e."name", e.patronymic, e.phone_number,
        r.title AS role_title
      FROM employee e
      JOIN "role" r ON e.role_id = r.role_id
      ORDER BY e.employee_id ASC;
    `;
    const res = await db.query(query);
    employees.value = res.rows;
  } catch (error) {
    console.error("Ошибка при загрузке сотрудников:", error);
  }
}

onMounted(async () => {
  await loadRoles();
  await loadData();
});

function add() {
  formModel.value = createNewRecord();
  dialog.value = true;
}

function edit(employee_id) {
  const found = employees.value.find((e) => e.employee_id === employee_id);
  if (found) {
    formModel.value = {
      employee_id: found.employee_id,
      role_id: found.role_id,
      surname: found.surname,
      name: found.name,
      patronymic: found.patronymic,
      phone_number: found.phone_number,
    };
    dialog.value = true;
  }
}

async function remove(employee_id) {
  if (!confirm("Вы уверены, что хотите удалить сотрудника?")) return;
  try {
    await db.query("DELETE FROM employee WHERE employee_id = $1;", [
      employee_id,
    ]);
    await loadData();
  } catch (error) {
    console.error("Ошибка при удалении:", error);
  }
}

async function save() {
  if (!formModel.value.role_id) {
    alert("Пожалуйста, выберите роль сотрудника!");
    return;
  }

  try {
    await (isEditing.value
      ? db.query(
          `UPDATE employee 
         SET role_id = $1, surname = $2, "name" = $3, patronymic = $4, phone_number = $5 
         WHERE employee_id = $6;`,
          [
            formModel.value.role_id,
            formModel.value.surname,
            formModel.value.name,
            formModel.value.patronymic,
            formModel.value.phone_number,
            formModel.value.employee_id,
          ],
        )
      : db.query(
          `INSERT INTO employee (role_id, surname, "name", patronymic, phone_number) 
         VALUES ($1, $2, $3, $4, $5);`,
          [
            formModel.value.role_id,
            formModel.value.surname,
            formModel.value.name,
            formModel.value.patronymic,
            formModel.value.phone_number,
          ],
        ));
    await loadData();
  } catch (error) {
    console.error("Ошибка при сохранении:", error);
  } finally {
    dialog.value = false;
  }
}

async function reset() {
  await resetData(db);
  await loadRoles();
  await loadData();
}
</script>
