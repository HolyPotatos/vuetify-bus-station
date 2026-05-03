<template>
  <v-sheet border rounded>
    <v-data-table
      :headers="headers"
      :hide-default-footer="employees.length < 11"
      :items="employees"
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
      :subtitle="`${isEditing ? 'Обновите существующего' : 'Создайте нового'} сотрудника`"
      :title="`${isEditing ? 'Редактируйте' : 'Добавьте'} сотрудника`"
    >
      <template #text>
        <v-row>
          <v-col cols="12">
            <v-text-field v-model="formModel.surname" label="Фамилия" />
          </v-col>

          <v-col cols="12">
            <v-text-field v-model="formModel.name" label="Имя" />
          </v-col>

          <v-col cols="12">
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
              v-model="formModel.role"
              :items="[
                'Кассир',
                'Старший кассир',
                'Диспетчер',
                'Администратор базы данных',
              ]"
              label="Роль"
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
    surname: "",
    name: "",
    patronymic: "",
    phone_number: "",
    role: "",
  };
}

const employees = ref([]);
const formModel = ref(createNewRecord());
const dialog = shallowRef(false);
const isEditing = toRef(() => !!formModel.value.id);

const headers = [
  { title: "Фамилия", key: "surname", align: "start" },
  { title: "Имя", key: "name" },
  { title: "Отчество", key: "patronymic" },
  { title: "Номер телефона", key: "phone_number", align: "end" },
  { title: "Роль", key: "role", align: "end" },
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
  const found = employees.value.find((employee) => employee.id === id);

  formModel.value = {
    id: found.id,
    surname: found.surname,
    name: found.name,
    patronymic: found.patronymic,
    phone_number: found.phone_number,
    role: found.role,
  };

  dialog.value = true;
}

function remove(id) {
  const index = employees.value.findIndex((employee) => employee.id === id);
  employees.value.splice(index, 1);
}

function save() {
  if (isEditing.value) {
    const index = employees.value.findIndex(
      (employee) => employee.id === formModel.value.id,
    );
    employees.value[index] = formModel.value;
  } else {
    formModel.value.id = employees.value.length + 1;
    employees.value.push(formModel.value);
  }

  dialog.value = false;
}

function reset() {
  dialog.value = false;
  formModel.value = createNewRecord();
  employees.value = [
    {
      id: 1,
      surname: "Морозова",
      name: "Елена",
      patronymic: "Игоревна",
      phone_number: "8(912)456 78-12",
      role: "Кассир",
    },
    {
      id: 2,
      surname: "Соколов",
      name: "Денис",
      patronymic: "Андреевич",
      phone_number: "8(903)123 45-67",
      role: "Старший кассир",
    },
    {
      id: 3,
      surname: "Павлова",
      name: "Анастасия",
      patronymic: "Сергеевна",
      phone_number: "8(926)987 65-43",
      role: "Диспетчер",
    },
    {
      id: 4,
      surname: "Белов",
      name: "Максим",
      patronymic: "Николаевич",
      phone_number: "8(916)555 11-22 ",
      role: "Администратор базы данных",
    },
  ];
}
</script>
