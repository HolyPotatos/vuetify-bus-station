<template>
  <v-sheet border rounded>
    <v-data-table
      :headers="headers"
      :hide-default-footer="customers.length < 11"
      item-value="customer_id"
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
            @click="edit(item.customer_id)"
          />

          <v-icon
            color="medium-emphasis"
            icon="mdi-delete"
            size="small"
            @click="removeClick(item.customer_id)"
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
      customer_id: null,
      surname: '',
      name: '',
      patronymic: '',
      phone_number: '',
      passport_data: '',
    }
  }

  const customers = ref([])
  const formModel = ref(createNewRecord())
  const dialog = shallowRef(false)
  const isEditing = toRef(() => !!formModel.value.customer_id)

  const headers = [
    { title: 'Фамилия', key: 'surname', align: 'start' },
    { title: 'Имя', key: 'name' },
    { title: 'Отчество', key: 'patronymic' },
    { title: 'Номер телефона', key: 'phone_number', align: 'end' },
    { title: 'Паспорт', key: 'passport_data', align: 'end' },
    { title: 'Действия', key: 'actions', align: 'end', sortable: false },
  ]

  async function loadData () {
    if (!db) return
    try {
      const res = await db.query(
        'SELECT * FROM customer ORDER BY customer_id;',
      )
      customers.value = res.rows
    } catch (error) {
      addMessage('error', error)
    }
  }

  onMounted(() => {
    loadData()
  })

  function add () {
    formModel.value = createNewRecord()
    dialog.value = true
  }

  function edit (customer_id) {
    const found = customers.value.find(
      customer => customer.customer_id === customer_id,
    )
    if (found) {
      formModel.value = {
        customer_id: found.customer_id,
        surname: found.surname,
        name: found.name,
        patronymic: found.patronymic,
        phone_number: found.phone_number,
        passport_data: found.passport_data,
      }
      dialog.value = true
    }
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
  function removeClick (customer_id) {
    confirm.value = true
    selectedId.value = customer_id
  }
  async function remove () {
    try {
      await db.query('DELETE FROM customer WHERE customer_id = $1;', [
        selectedId.value,
      ])
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
          `UPDATE customer SET surname = $1, "name" = $2, patronymic = $3, phone_number = $4, passport_data = $5 WHERE customer_id = $6;`,
          [
            formModel.value.surname,
            formModel.value.name,
            formModel.value.patronymic,
            formModel.value.phone_number,
            formModel.value.passport_data,
            formModel.value.customer_id,
          ],
        )
        : db.query(
          `INSERT INTO customer (surname, "name", patronymic, phone_number, passport_data) VALUES ($1, $2, $3, $4, $5);`,
          [
            formModel.value.surname,
            formModel.value.name,
            formModel.value.patronymic,
            formModel.value.phone_number,
            formModel.value.passport_data,
          ],
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
