<template>
  <v-sheet border rounded>
    <v-data-table
      :headers="headers"
      :hide-default-footer="employee_role.length < 11"
      item-value="role_id"
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
            text="Добавить роль"
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
            @click="edit(item.role_id)"
          />

          <v-icon
            color="medium-emphasis"
            icon="mdi-delete"
            size="small"
            @click="removeClick(item.role_id)"
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
      role_id: null,
      title: '',
    }
  }

  const employee_role = ref([])
  const formModel = ref(createNewRecord())
  const dialog = shallowRef(false)
  const isEditing = toRef(() => !!formModel.value.role_id)

  const headers = [
    { title: 'Название роли', key: 'title', align: 'start' },
    { title: 'Действия', key: 'actions', align: 'end', sortable: false },
  ]

  async function loadData () {
    if (!db) return
    try {
      const res = await db.query('SELECT * FROM "role" ORDER BY role_id ASC;')
      employee_role.value = res.rows
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

  function edit (role_id) {
    const found = employee_role.value.find(role => role.role_id === role_id)
    if (found) {
      formModel.value = {
        role_id: found.role_id,
        title: found.title,
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
  function removeClick (role_id) {
    confirm.value = true
    selectedId.value = role_id
  }
  async function remove () {
    try {
      await db.query('DELETE FROM "role" WHERE role_id = $1;', [selectedId.value])
      await loadData()
    } catch (error) {
      addMessage('error', error)
    } finally {
      confirm.value = false
    }
  }

  async function save () {
    if (!formModel.value.title.trim()) {
      addMessage('warning', 'Название роли не может быть пустым')
      return
    }

    try {
      await (isEditing.value
        ? db.query('UPDATE "role" SET title = $1 WHERE role_id = $2;', [
          formModel.value.title,
          formModel.value.role_id,
        ])
        : db.query('INSERT INTO "role" (title) VALUES ($1);', [
          formModel.value.title,
        ]))
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
