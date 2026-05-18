<template>
  <v-sheet border rounded>
    <v-data-table
      :headers="headers"
      :hide-default-footer="drivers.length < 11"
      item-value="driver_id"
      :items="drivers"
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
            Водители
          </v-toolbar-title>

          <v-btn
            border
            class="me-2"
            prepend-icon="mdi-plus"
            rounded="lg"
            text="Добавить водителя"
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
            @click="edit(item.driver_id)"
          />

          <v-icon
            color="medium-emphasis"
            icon="mdi-delete"
            size="small"
            @click="removeClick(item.driver_id)"
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
      :subtitle="`${isEditing ? 'Обновите существующего' : 'Создайте нового'} водителя`"
      :title="`${isEditing ? 'Редактирование' : 'Добавление'} водителя`"
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
      driver_id: null,
      surname: '',
      name: '',
      patronymic: '',
      phone_number: '',
    }
  }

  const drivers = ref([])
  const formModel = ref(createNewRecord())
  const dialog = shallowRef(false)
  const isEditing = toRef(() => !!formModel.value.driver_id)

  const headers = [
    { title: 'Фамилия', key: 'surname', align: 'start' },
    { title: 'Имя', key: 'name' },
    { title: 'Отчество', key: 'patronymic' },
    { title: 'Номер телефона', key: 'phone_number', align: 'end' },
    { title: 'Действия', key: 'actions', align: 'end', sortable: false },
  ]

  async function loadData () {
    if (!db) return
    try {
      const res = await db.query('SELECT * FROM driver ORDER BY driver_id ASC;')
      drivers.value = res.rows
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

  function edit (driver_id) {
    const found = drivers.value.find(driver => driver.driver_id === driver_id)
    if (found) {
      formModel.value = {
        driver_id: found.driver_id,
        surname: found.surname,
        name: found.name,
        patronymic: found.patronymic,
        phone_number: found.phone_number,
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
  function removeClick (driver_id) {
    confirm.value = true
    selectedId.value = driver_id
  }
  async function remove () {
    try {
      await db.query('DELETE FROM driver WHERE driver_id = $1;', [selectedId.value])
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
          `UPDATE driver SET surname = $1, "name" = $2, patronymic = $3, phone_number = $4 WHERE driver_id = $5;`,
          [
            formModel.value.surname,
            formModel.value.name,
            formModel.value.patronymic,
            formModel.value.phone_number,
            formModel.value.driver_id,
          ],
        )
        : db.query(
          `INSERT INTO driver (surname, "name", patronymic, phone_number) VALUES ($1, $2, $3, $4);`,
          [
            formModel.value.surname,
            formModel.value.name,
            formModel.value.patronymic,
            formModel.value.phone_number,
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
