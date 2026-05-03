<template>
  <v-sheet border rounded>
    <v-data-table
      :headers="headers"
      :hide-default-footer="customers.length < 11"
      :items="customers"
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

            Клиенты
          </v-toolbar-title>

          <v-btn
            border
            class="me-2"
            prepend-icon="mdi-plus"
            rounded="lg"
            text="Добавить клиента"
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
      :subtitle="`${isEditing ? 'Обновите существующего' : 'Создайте нового'} клиента`"
      :title="`${isEditing ? 'Редактирование' : 'Добавление'} клиента`"
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
            <v-text-field
              v-model="formModel.passport_data"
              label="Паспортные данные"
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
    passport_data: "",
  };
}

const customers = ref([]);
const formModel = ref(createNewRecord());
const dialog = shallowRef(false);
const isEditing = toRef(() => !!formModel.value.id);

const headers = [
  { title: "Фамилия", key: "surname", align: "start" },
  { title: "Имя", key: "name" },
  { title: "Отчество", key: "patronymic" },
  { title: "Номер телефона", key: "phone_number", align: "end" },
  { title: "Паспорт", key: "passport_data", align: "end" },
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
  const found = customers.value.find((customer) => customer.id === id);

  formModel.value = {
    id: found.id,
    surname: found.surname,
    name: found.name,
    patronymic: found.patronymic,
    phone_number: found.phone_number,
    passport_data: found.passport_data,
  };

  dialog.value = true;
}

function remove(id) {
  const index = customers.value.findIndex((customer) => customer.id === id);
  customers.value.splice(index, 1);
}

function save() {
  if (isEditing.value) {
    const index = customers.value.findIndex(
      (customer) => customer.id === formModel.value.id,
    );
    customers.value[index] = formModel.value;
  } else {
    formModel.value.id = customers.value.length + 1;
    customers.value.push(formModel.value);
  }

  dialog.value = false;
}

function reset() {
  dialog.value = false;
  formModel.value = createNewRecord();
  customers.value = [
    {
      id: 1,
      surname: "Иванов",
      name: "Иван",
      patronymic: "Иванович",
      phone_number: "8(914)723 11-22",
      passport_data: "6213 687345",
    },
    {
      id: 2,
      surname: "Петров",
      name: "Петр",
      patronymic: "Петрович",
      phone_number: "8(914) 623 61-57",
      passport_data: "7123 644564",
    },
    {
      id: 3,
      surname: "Иванова",
      name: "Анастасия",
      patronymic: "Ивановна",
      phone_number: "8(914)347 73-77",
      passport_data: "7123 657234",
    },
    {
      id: 4,
      surname: "Никушина",
      name: "Виктория",
      patronymic: "Викторовна",
      phone_number: "8(800)517 22-22",
      passport_data: "7123 345654",
    },
  ];
}
</script>
