bus
<template>
  <v-sheet border rounded>
    <v-data-table
      :headers="headers"
      :hide-default-footer="bus.length < 11"
      :items="bus"
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

            Автобусы
          </v-toolbar-title>

          <v-btn
            border
            class="me-2"
            prepend-icon="mdi-plus"
            rounded="lg"
            text="Добавить автобус"
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
      :subtitle="`${isEditing ? 'Обновите существующий' : 'Создайте новый'} автобус`"
      :title="`${isEditing ? 'Редактируйте' : 'Добавьте'} автобус`"
    >
      <template #text>
        <v-row>
          <v-col cols="12">
            <v-text-field v-model="formModel.brand" label="Марка" />
          </v-col>

          <v-col cols="12">
            <v-text-field v-model="formModel.model" label="Модель" />
          </v-col>

          <v-col cols="12" md="6">
            <v-number-input
              v-model="formModel.capacity"
              label="Вместимость (чел)"
              :min="1"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field v-model="formModel.plate_number" label="Гос. номер" />
          </v-col>

          <v-col cols="12">
            <v-select
              v-model="formModel.carrier"
              :items="[
                'ООО «Авто-Транс»',
                'ООО «Регион-Экспресс»',
                'ООО «МежгородТранс»',
              ]"
              label="Перевозчик"
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
    brand: "",
    model: "",
    capacity: 1,
    plate_number: "",
    carrier: "",
  };
}

const bus = ref([]);
const formModel = ref(createNewRecord());
const dialog = shallowRef(false);
const isEditing = toRef(() => !!formModel.value.id);

const headers = [
  { title: "Перевозчик", key: "carrier", align: "start" },
  { title: "Марка", key: "brand" },
  { title: "Модель", key: "model" },
  { title: "Вместимость", key: "capacity" },
  { title: "Гос. номер", key: "plate_number", align: "end" },
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
  const found = bus.value.find((bus_item) => bus_item.id === id);

  formModel.value = {
    id: found.id,
    brand: found.brand,
    model: found.model,
    capacity: found.capacity,
    plate_number: found.plate_number,
    carrier: found.carrier,
  };

  dialog.value = true;
}

function remove(id) {
  const index = bus.value.findIndex((bus_item) => bus_item.id === id);
  bus.value.splice(index, 1);
}

function save() {
  if (isEditing.value) {
    const index = bus.value.findIndex(
      (bus_item) => bus_item.id === formModel.value.id,
    );
    bus.value[index] = formModel.value;
  } else {
    formModel.value.id = bus.value.length + 1;
    bus.value.push(formModel.value);
  }

  dialog.value = false;
}

function reset() {
  dialog.value = false;
  formModel.value = createNewRecord();
  bus.value = [
    {
      id: 1,
      brand: "Mercedes-Benz",
      model: "Sprinter",
      capacity: 19,
      plate_number: "A123BА77",
      carrier: "ООО «Авто-Транс»",
    },
    {
      id: 2,
      brand: "MAN",
      model: "Lion's Coach",
      capacity: 49,
      plate_number: "Х555KX99",
      carrier: "ООО «Авто-Транс»l",
    },
    {
      id: 3,
      brand: "Scania",
      model: "Touring",
      capacity: 53,
      plate_number: "M782HH150",
      carrier: "ООО «Регион-Экспресс»",
    },
    {
      id: 4,
      brand: "Setra",
      model: "S 515 HD",
      capacity: 44,
      plate_number: "X001EE777",
      carrier: "ООО «МежгородТранс»",
    },
    {
      id: 5,
      brand: "Yutong",
      model: "ZK6122H",
      capacity: 51,
      plate_number: "B456OT123",
      carrier: "ООО «МежгородТранс»",
    },
  ];
}
</script>
