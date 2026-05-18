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
            @click="removeClick(item.carrier_id)"
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

  <v-dialog
    v-model="confirm"
    max-width="400"
    persistent
  >
    <v-card
      prepend-icon="mdi-trash-can"
      text="Вы действительно хотите удалить запись из базы данных?"
      title="Подтверждение удаления"
    >
      <template #actions>
        <v-spacer />

        <v-btn @click="confirm = false">
          Нет
        </v-btn>

        <v-btn @click="remove()">
          Да
        </v-btn>
      </template>
    </v-card>
  </v-dialog>

  <v-snackbar-queue
    v-model="messages"
    closable
    collapsed
    display-strategy="overflow"
    :timeout="3000"
    :total-visible="10"
  />
</template>
<script setup>
  import { inject, onMounted, ref, shallowRef, toRef } from 'vue'
  import { PGLiteKey, resetData } from '@/plugins/db'

  const db = inject(PGLiteKey)

  function createNewRecord () {
    return {
      carrier_id: null,
      title: '',
      contact_phone: '',
    }
  }

  const carriers = ref([])
  const formModel = ref(createNewRecord())
  const dialog = shallowRef(false)
  const isEditing = toRef(() => !!formModel.value.carrier_id)

  const headers = [
    { title: 'Название перевозчика', key: 'title', align: 'start' },
    { title: 'Контактный телефон', key: 'contact_phone' },
    { title: 'Действия', key: 'actions', align: 'end', sortable: false },
  ]

  async function loadData () {
    if (!db) return
    const res = await db.query('SELECT * FROM carrier')
    carriers.value = res.rows
  }

  onMounted(() => {
    loadData()
  })

  function add () {
    formModel.value = createNewRecord()
    dialog.value = true
  }

  function edit (carrier_id) {
    const found = carriers.value.find(
      carrier => carrier.carrier_id === carrier_id,
    )
    formModel.value = {
      carrier_id: found.carrier_id,
      title: found.title,
      contact_phone: found.contact_phone,
    }
    dialog.value = true
  }

  const confirm = shallowRef(false)
  const selectedId = ref(-1)
  const messages = ref([])

  function addMessage (color, error) {
    messages.value.push({
      text: `Ошибка: ${error}`,
      color,
    })
  }
  function removeClick (carrier_id) {
    confirm.value = true
    selectedId.value = carrier_id
  }

  async function remove () {
    try {
      await db.query('DELETE FROM carrier WHERE carrier_id = $1;', [selectedId.value])
      await loadData()
    } catch (error) {
      addMessage('error', error)
    } finally {
      confirm.value = false
    }
  }

  async function save () {
    try {
      await (isEditing.value
        ? db.query(
          'UPDATE carrier SET title = $1, contact_phone = $2 WHERE carrier_id = $3;',
          [
            formModel.value.title,
            formModel.value.contact_phone,
            formModel.value.carrier_id,
          ],
        )
        : db.query(
          'INSERT INTO carrier (title, contact_phone) VALUES ($1, $2);',
          [formModel.value.title, formModel.value.contact_phone],
        ))
      await loadData()
    } catch (error) {
      addMessage('error', error)
    } finally {
      dialog.value = false
    }
  }

  async function reset () {
    await resetData(db)
    await loadData()
  }
</script>
