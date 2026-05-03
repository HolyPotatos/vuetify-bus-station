<template>
  <v-sheet border rounded>
    <v-data-table
      :headers="headers"
      :hide-default-footer="employee_role.length < 11"
      :items="employee_role"
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

            Роли сотрудников
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
      :subtitle="`${isEditing ? 'Обновите существующую' : 'Создайте новую'} роль сотрудника`"
      :title="`${isEditing ? 'Редактировать' : 'Добавить'} роль сотрудника`"
    >
      <template #text>
        <v-row>
          <v-col cols="12">
            <v-text-field v-model="formModel.title" label="Название роли" />
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

const employee_role = ref([]);
const formModel = ref(createNewRecord());
const dialog = shallowRef(false);
const isEditing = toRef(() => !!formModel.value.id);

const headers = [
  { title: "Название роли", key: "title", align: "start" },
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
  const found = employee_role.value.find((role) => role.id === id);

  formModel.value = {
    id: found.id,
    title: found.title,
  };

  dialog.value = true;
}

function remove(id) {
  const index = employee_role.value.findIndex((role) => role.id === id);
  employee_role.value.splice(index, 1);
}

function save() {
  if (isEditing.value) {
    const index = employee_role.value.findIndex(
      (role) => role.id === formModel.value.id,
    );
    employee_role.value[index] = formModel.value;
  } else {
    formModel.value.id = employee_role.value.length + 1;
    employee_role.value.push(formModel.value);
  }

  dialog.value = false;
}

function reset() {
  dialog.value = false;
  formModel.value = createNewRecord();
  employee_role.value = [
    {
      id: 1,
      title: "Кассир",
    },
    {
      id: 2,
      title: "Старший кассир",
    },
    {
      id: 3,
      title: "Диспетчер",
    },
    {
      id: 4,
      title: "Администратор базы данных",
    },
  ];
}
</script>
