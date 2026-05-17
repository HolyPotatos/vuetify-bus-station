<template>
  <v-sheet border rounded>
    <v-data-table
      :headers="headers"
      :hide-default-footer="bus.length < 11"
      item-value="bus_id"
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
            @click="edit(item.bus_id)"
          />

          <v-icon
            color="medium-emphasis"
            icon="mdi-delete"
            size="small"
            @click="remove(item.bus_id)"
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
      :subtitle="`${isEditing ? 'Обновите существующий' : 'Создайте новый'} автобус`"
      :title="`${isEditing ? 'Редактирование' : 'Добавление'} автобуса`"
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
              v-model="formModel.carrier_id"
              item-title="title"
              item-value="carrier_id"
              :items="carriers"
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
import { inject, onMounted, ref, shallowRef, toRef } from "vue";
import { PGLiteKey, resetData } from "@/plugins/db";

const db = inject(PGLiteKey);

function createNewRecord() {
  return {
    bus_id: null,
    carrier_id: null,
    brand: "",
    model: "",
    capacity: 1,
    plate_number: "",
  };
}

const bus = ref([]);
const carriers = ref([]);
const formModel = ref(createNewRecord());
const dialog = shallowRef(false);
const isEditing = toRef(() => !!formModel.value.bus_id);

const headers = [
  { title: "Перевозчик", key: "carrier_title", align: "start" },
  { title: "Марка", key: "brand" },
  { title: "Модель", key: "model" },
  { title: "Вместимость", key: "capacity" },
  { title: "Гос. номер", key: "plate_number", align: "end" },
  { title: "Действия", key: "actions", align: "end", sortable: false },
];

async function loadCarriers() {
  if (!db) return;
  try {
    const res = await db.query(
      "SELECT carrier_id, title FROM carrier ORDER BY title ASC;",
    );
    carriers.value = res.rows;
  } catch (error) {
    console.error(error);
  }
}

async function loadData() {
  if (!db) return;
  try {
    const query = `
      SELECT 
        b.bus_id, 
        b.carrier_id, 
        b.brand, 
        b.model, 
        b.capacity, 
        b.plate_number,
        c.title AS carrier_title
      FROM bus b
      JOIN carrier c ON b.carrier_id = c.carrier_id
      ORDER BY b.bus_id ASC;
    `;
    const res = await db.query(query);
    bus.value = res.rows;
  } catch (error) {
    console.error(error);
  }
}

onMounted(async () => {
  await loadCarriers();
  await loadData();
});

function add() {
  formModel.value = createNewRecord();
  dialog.value = true;
}

function edit(bus_id) {
  const found = bus.value.find((b) => b.bus_id === bus_id);
  if (found) {
    formModel.value = {
      bus_id: found.bus_id,
      carrier_id: found.carrier_id,
      brand: found.brand,
      model: found.model,
      capacity: found.capacity,
      plate_number: found.plate_number,
    };
    dialog.value = true;
  }
}

async function remove(bus_id) {
  if (!confirm("Вы уверены?")) return;
  try {
    await db.query("DELETE FROM bus WHERE bus_id = $1;", [bus_id]);
    await loadData();
  } catch (error) {
    console.error(error);
  }
}

async function save() {
  if (!formModel.value.carrier_id) {
    alert("Пожалуйста, выберите перевозчика");
    return;
  }
  if (
    !formModel.value.plate_number.trim() ||
    !formModel.value.brand.trim() ||
    !formModel.value.model.trim()
  ) {
    alert("Заполните обязательные поля (Марка, Модель, Гос. номер)");
    return;
  }

  try {
    await (isEditing.value
      ? db.query(
          "UPDATE bus SET carrier_id = $1, brand = $2, model = $3, capacity = $4, plate_number = $5 WHERE bus_id = $6;",
          [
            formModel.value.carrier_id,
            formModel.value.brand,
            formModel.value.model,
            formModel.value.capacity,
            formModel.value.plate_number,
            formModel.value.bus_id,
          ],
        )
      : db.query(
          "INSERT INTO bus (carrier_id, brand, model, capacity, plate_number) VALUES ($1, $2, $3, $4, $5);",
          [
            formModel.value.carrier_id,
            formModel.value.brand,
            formModel.value.model,
            formModel.value.capacity,
            formModel.value.plate_number,
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
  await loadCarriers();
  await loadData();
}
</script>
