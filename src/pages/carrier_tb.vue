<template>
  <v-sheet border rounded>
    <v-data-table
      :headers="headers"
      :hide-default-footer="carriers.length < 11"
      :items="carriers"
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

            Перевозчик
          </v-toolbar-title>

          <v-btn
            border
            class="me-2"
            prepend-icon="mdi-plus"
            rounded="lg"
            text="Добавить перевозчика"
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
      :subtitle="`${isEditing ? 'Обновите существующего' : 'Создайте нового'} перевозчика`"
      :title="`${isEditing ? 'Редактирование' : 'Добавление'} перевозчика`"
    >
      <template #text>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="formModel.title"
              label="Название перевозчика"
            />
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="formModel.phone"
              label="Контактный телефон"
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
    title: "",
    phone: "",
  };
}

const carriers = ref([]);
const formModel = ref(createNewRecord());
const dialog = shallowRef(false);
const isEditing = toRef(() => !!formModel.value.id);

const headers = [
  { title: "Название перевозчика", key: "title", align: "start" },
  { title: "Контактный телефон", key: "phone" },
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
  const found = carriers.value.find((carrier) => carrier.id === id);

  formModel.value = {
    id: found.id,
    title: found.title,
    phone: found.phone,
  };

  dialog.value = true;
}

function remove(id) {
  const index = carriers.value.findIndex((carrier) => carrier.id === id);
  carriers.value.splice(index, 1);
}

function save() {
  if (isEditing.value) {
    const index = carriers.value.findIndex(
      (carrier) => carrier.id === formModel.value.id,
    );
    carriers.value[index] = formModel.value;
  } else {
    formModel.value.id = carriers.value.length + 1;
    carriers.value.push(formModel.value);
  }

  dialog.value = false;
}

function reset() {
  dialog.value = false;
  formModel.value = createNewRecord();
  carriers.value = [
    {
      id: 1,
      title: "ООО «Авто-Транс»",
      phone: "8(800)114 63-75",
    },
    {
      id: 2,
      title: "ООО «Регион-Экспресс»",
      phone: "8(800)237 11-11",
    },
    {
      id: 3,
      title: "ООО «МежгородТранс»",
      phone: "8(800)604 12-73",
    },
  ];
}
</script>
