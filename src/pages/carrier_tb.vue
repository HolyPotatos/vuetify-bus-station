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
            @click="edit(item.carrier_id)"
          />

          <v-icon
            color="medium-emphasis"
            icon="mdi-delete"
            size="small"
            @click="remove(item.carrier_id)"
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
              v-model="formModel.contact_phone"
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
import { inject, onMounted, ref, shallowRef, toRef } from "vue";
import { PGLiteKey, resetData } from "@/plugins/db";

const db = inject(PGLiteKey);

function createNewRecord() {
  return {
    carrier_id: null,
    title: "",
    contact_phone: "",
  };
}

const carriers = ref([]);
const formModel = ref(createNewRecord());
const dialog = shallowRef(false);
const isEditing = toRef(() => !!formModel.value.carrier_id);

const headers = [
  { title: "Название перевозчика", key: "title", align: "start" },
  { title: "Контактный телефон", key: "contact_phone" },
  { title: "Действия", key: "actions", align: "end", sortable: false },
];

async function loadData() {
  if (!db) return;
  const res = await db.query("SELECT * FROM carrier");
  carriers.value = res.rows;
}

onMounted(() => {
  loadData();
});

function add() {
  formModel.value = createNewRecord();
  dialog.value = true;
}

function edit(carrier_id) {
  const found = carriers.value.find(
    (carrier) => carrier.carrier_id === carrier_id,
  );
  formModel.value = {
    carrier_id: found.carrier_id,
    title: found.title,
    contact_phone: found.contact_phone,
  };
  dialog.value = true;
}

async function remove(carrier_id) {
  if (!confirm("Удалить эту роль?")) return;
  try {
    await db.query("DELETE FROM carrier WHERE carrier_id = $1;", [carrier_id]);
    await loadData();
  } catch (error) {
    console.error("Ошибка при удалении:", error);
  }
}

async function save() {
  try {
    await (isEditing.value
      ? db.query(
          "UPDATE carrier SET title = $1, contact_phone = $2 WHERE carrier_id = $3;",
          [
            formModel.value.title,
            formModel.value.contact_phone,
            formModel.value.carrier_id,
          ],
        )
      : db.query(
          "INSERT INTO carrier (title, contact_phone) VALUES ($1, $2);",
          [formModel.value.title, formModel.value.contact_phone],
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
  await loadData();
}
</script>
