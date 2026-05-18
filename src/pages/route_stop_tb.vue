<template>
  <v-sheet border rounded>
    <v-data-table
      :headers="headers"
      :hide-default-footer="route_stops.length < 11"
      item-value="route_stop_id"
      :items="route_stops"
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
            Остановки маршрута
          </v-toolbar-title>

          <v-btn
            border
            class="me-2"
            prepend-icon="mdi-plus"
            rounded="lg"
            text="Добавить остановку маршрута"
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
            @click="edit(item.route_stop_id)"
          />

          <v-icon
            color="medium-emphasis"
            icon="mdi-delete"
            size="small"
            @click="removeClick(item.route_stop_id)"
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
      :subtitle="`${isEditing ? 'Обновите существующую' : 'Создайте новую'} остановку маршрута`"
      :title="`${isEditing ? 'Редактируйте' : 'Добавьте'} остановку маршрута`"
    >
      <template #text>
        <v-row>
          <v-col cols="12" md="6">
            <v-select
              v-model="formModel.route_id"
              item-title="title"
              item-value="route_id"
              :items="routesList"
              label="Маршрут"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="formModel.bus_stop_id"
              item-title="title"
              item-value="bus_stop_id"
              :items="busStopsList"
              label="Остановка"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-number-input
              v-model="formModel.stop_order"
              label="Порядковый номер"
              :min="1"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-number-input
              v-model="formModel.travel_time"
              label="Время в пути (мин)"
              :min="0"
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
      route_stop_id: null,
      route_id: null,
      bus_stop_id: null,
      stop_order: 1,
      travel_time: 0,
    }
  }

  const route_stops = ref([])
  const routesList = ref([])
  const busStopsList = ref([])
  const formModel = ref(createNewRecord())
  const dialog = shallowRef(false)
  const isEditing = toRef(() => !!formModel.value.route_stop_id)

  const headers = [
    { title: 'Маршрут', key: 'route_title', align: 'start' },
    { title: 'Остановка', key: 'bus_stop_title' },
    { title: 'Порядковый номер', key: 'stop_order' },
    { title: 'Время в пути (мин)', key: 'travel_time', align: 'end' },
    { title: 'Действия', key: 'actions', align: 'end', sortable: false },
  ]

  async function loadRoutesAndStops () {
    if (!db) return
    try {
      const routesRes = await db.query(
        'SELECT route_id, title FROM route ORDER BY title ASC;',
      )
      routesList.value = routesRes.rows

      const stopsRes = await db.query(
        'SELECT bus_stop_id, title FROM bus_stop ORDER BY title ASC;',
      )
      busStopsList.value = stopsRes.rows
    } catch (error) {
      caddMessage('error', error)
    }
  }

  async function loadData () {
    if (!db) return
    try {
      const query = `
      SELECT 
        rs.route_stop_id,
        rs.route_id,
        rs.bus_stop_id,
        rs.stop_order,
        rs.travel_time,
        r.title AS route_title,
        bs.title AS bus_stop_title
      FROM route_stop rs
      JOIN route r ON rs.route_id = r.route_id
      JOIN bus_stop bs ON rs.bus_stop_id = bs.bus_stop_id
      ORDER BY rs.route_id ASC, rs.stop_order ASC;
    `
      const res = await db.query(query)
      route_stops.value = res.rows
    } catch (error) {
      addMessage('error', error)
    }
  }

  onMounted(async () => {
    await loadRoutesAndStops()
    await loadData()
  })

  function add () {
    formModel.value = createNewRecord()
    dialog.value = true
  }

  function edit (route_stop_id) {
    const found = route_stops.value.find(
      rs => rs.route_stop_id === route_stop_id,
    )
    if (found) {
      formModel.value = {
        route_stop_id: found.route_stop_id,
        route_id: found.route_id,
        bus_stop_id: found.bus_stop_id,
        stop_order: found.stop_order,
        travel_time: found.travel_time,
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
  function removeClick (route_stop_id) {
    confirm.value = true
    selectedId.value = route_stop_id
  }
  async function remove () {
    try {
      await db.query('DELETE FROM route_stop WHERE route_stop_id = $1;', [
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
    if (!formModel.value.route_id || !formModel.value.bus_stop_id) {
      addMessage('warning', 'Пожалуйста, выберите маршрут и остановку')
      return
    }

    try {
      await (isEditing.value
        ? db.query(
          'UPDATE route_stop SET route_id = $1, bus_stop_id = $2, stop_order = $3, travel_time = $4 WHERE route_stop_id = $5;',
          [
            formModel.value.route_id,
            formModel.value.bus_stop_id,
            formModel.value.stop_order,
            formModel.value.travel_time,
            formModel.value.route_stop_id,
          ],
        )
        : db.query(
          'INSERT INTO route_stop (route_id, bus_stop_id, stop_order, travel_time) VALUES ($1, $2, $3, $4);',
          [
            formModel.value.route_id,
            formModel.value.bus_stop_id,
            formModel.value.stop_order,
            formModel.value.travel_time,
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
    await loadRoutesAndStops()
    await loadData()
  }
</script>
