<template>
  <div class="admin-report-email-create-edit"
    v-if="listLoaded && userListLoaded && availableUserListLoaded">

    <!-- User -->
    <div class="row">
      <div class="offset-xs-1 col-10">

        <q-select
          :label="$t('admin.report.components.createEditEmail.user')"
          @filter="filterAvailableUserRows"
          :options="availableUserRowsListOptions"
          use-input
          @change="touchForm"
          v-model="reportEmail.configuration.user">
            <template v-slot:prepend>
              <q-icon name="person"></q-icon>
            </template>
        </q-select>

        <div v-if="$v.reportEmail.configuration.user.$error
          && !$v.reportEmail.configuration.user.required"
          class="error-validation">
          {{ $t("admin.report.components.createEditEmail.userRequired") }}
        </div>

      </div>
    </div>

    <!-- Frequency -->
    <div class="row">
      <div class="offset-xs-1 col-10">

        <q-select
          :label="$t('admin.report.components.createEditEmail.frequency')"
          :options="frequencyList"
          @change="touchForm"
          v-model="reportEmail.configuration.frequency">
            <template v-slot:prepend>
              <q-icon name="alarm"></q-icon>
            </template>
        </q-select>

        <div v-if="$v.reportEmail.configuration.frequency.$error
          && !$v.reportEmail.configuration.frequency.required"
          class="error-validation">
          {{ $t("admin.report.components.createEditEmail.frequencyRequired") }}
        </div>

      </div>
    </div>

    <!-- Start date -->
    <div class="row">
      <div class="offset-xs-1 col-10">

        <q-input
          :label="$t('admin.report.components.createEditEmail.startingDate')"
          readonly
          v-model="reportEmail.configuration.startingDate">
            <template v-slot:prepend>
              <q-icon name="event" class="cursor-pointer"></q-icon>
            </template>
            <q-popup-proxy ref="qStartDateProxy" transition-show="scale"
              transition-hide="scale">
              <!-- QPopupProxy treats some components (QDate, QTime, QCarousel and QColor) as
              special ones and forces cover: true and maxHeight: '99vh' on them. If you don’t want
              this behavior just place a div as the first level child of QPopupProxy. -->
              <div class="q-gutter-md row items-start">
                <q-date
                  v-model="reportEmail.configuration.startingDate"
                  :mask="localeDateTimeFormat" />
                <q-time v-model="reportEmail.configuration.startingDate"
                  :mask="localeDateTimeFormat" />
              </div>
            </q-popup-proxy>
        </q-input>

        <div v-if="$v.reportEmail.configuration.startingDate.$error
          && !$v.reportEmail.configuration.startingDate.required"
          class="error-validation">
          {{ $t("admin.report.components.createEditEmail.startingDateRequired") }}
        </div>

      </div>
    </div>

    <!-- Timezone -->
    <div class="row">
      <div class="offset-xs-1 col-10">

        <q-select
          :label="$t('admin.report.components.createEditEmail.timeZone')"
          @filter="filterTimezone"
          :options="filterTimezoneOptions"
          use-input
          @change="touchForm"
          v-model="reportEmail.configuration.intervalTimeZone">
            <template v-slot:prepend>
              <q-icon name="access_time"></q-icon>
            </template>
        </q-select>

        <div v-if="$v.reportEmail.configuration.intervalTimeZone.$error
          && !$v.reportEmail.configuration.intervalTimeZone.required"
          class="error-validation">
          {{ $t("admin.report.components.createEditEmail.timeZoneRequired") }}
        </div>

      </div>
    </div>

    <!-- Device -->
    <div class="row">
      <div class="offset-xs-1 col-10">
        <q-field :label="$t('admin.report.components.createEditEmail.device')">
          <template v-slot:prepend>
            <q-icon name="wifi_tethering" />
          </template>

          <div class="self-center full-width no-outline q-py-md" tabindex="0">

            <q-table
              id="deviceTable"
              ref="deviceTable"
              selection="multiple"
              row-key="id"
              class="no-shadow full-width"
              :pagination="tableDevicePagination"
              :columns="tableDeviceColumns"
              :data="getDeviceTableList"
              :filter="tableDeviceFilter"
              :hideBottom="true" >

              <!-- Top right filter box -->
              <template slot="top-right">
                <q-input
                  class="q-ml-md q-mt-sm"
                  v-model="tableDeviceFilter"
                  debounce="500"
                  placeholder="Search"
                  clearable
                  dense>
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </template>

              <!-- Row header -->
              <template slot="header" slot-scope="props">
                <q-tr>
                  <q-th>
                  </q-th>
                  <q-th v-for="col in props.cols" :key="col.name" :props="props">
                    {{col.label}}
                  </q-th>
                </q-tr>
              </template>

              <!-- Body slot -->
              <template slot="body" slot-scope="props">
                <q-tr :props="props" :key="props.row.id" :id="`rowDevice_${props.row.id}`">
                  <q-td style="width: 60px">
                    <q-btn size="sm" color="primary" icon="delete_forever"
                      @click="removeDevice(props.row.id)" />
                  </q-td>
                  <q-td key="name" :props="props">{{ props.row.name }}</q-td>
                </q-tr>
              </template>
            </q-table>

            <!-- Add new device table -->
            <q-table
              id="deviceAddTable"
              ref="deviceAddTable"
              row-key="id"
              class="no-shadow full-width"
              :columns="tableAddDeviceColumns"
              :hideBottom="true">

              <!-- Body slot -->
              <template slot="header" slot-scope="props">
                <q-tr :props="props">
                  <q-td>
                    <q-btn size="sm" color="primary" icon="add" @click="addNewDevice" />
                  </q-td>
                  <q-td>
                    <q-select
                      v-model="addDevice"
                      :options="newDeviceTableOptions"
                      @filter="filternewDeviceTable"
                      use-chips
                      use-input
                      stack-label
                      :label="$t('admin.report.components.createEditEmail.selectDevices')"
                      multiple
                      clearable
                      class="no-padding">
                    </q-select>
                  </q-td>
                </q-tr>
              </template>
            </q-table>

          </div>

        </q-field>
      </div>
    </div>


  </div>
</template>

<script>
import { mapState } from 'vuex';
import moment from 'moment-timezone';
import { required } from 'vuelidate/lib/validators';
import utilReport from 'src/common/utils/report';
import utilUser from 'src/common/utils/user';
import { date } from 'quasar';

const availableMode = {
  create: 'create',
  edit: 'edit',
};

export default {
  name: 'admin-report-email-create-edit',
  components: {
  },
  props: {
    queryString: {
      required: true,
      type: Object,
    },
    mode: {
      required: true,
      type: String,
      validator: value => Object.keys(availableMode).find(x => value === availableMode[x]),
      default: () => 'create',
    },
    report: {
      type: Object,
      default: () => null,
    },
    user: {
      type: Object,
      default: () => null,
    },
  },
  data() {
    return {
      filterTimezoneOptions: this.timeZoneList,
      newDeviceTableOptions: this.getNewDeviceTableList,
      availableUserRowsListOptions: this.availableUserRowsList,
      internalReport: this.report,
      internalUser: this.user,
      tableDevicePagination: {
        rowsPerPage: 0,
      },
      tableDeviceColumns: [
        {
          name: 'name',
          required: true,
          label: this.$t('admin.report.components.createEditEmail.columnName'),
          align: 'left',
          field: 'name',
          sortable: false,
        },
      ],
      tableDeviceFilter: '',
      selectedDevice: [],
      reportEmail: {
        user: null,
        configuration: {
          startingDate: null,
          intervalTimeZone: null,
          frequency: null,
          user: null,
          devices: [],
        },
      },
      addDevice: [],
      tableAddDeviceColumns: [],
    };
  },
  // Get forms validations
  validations() {
    return {
      reportEmail: {
        configuration: {
          user: {
            required,
          },
          startingDate: {
            required,
          },
          intervalTimeZone: {
            required,
          },
          frequency: {
            required,
          },
        },
      },
    };
  },
  computed: {
    ...mapState('admin/report', {
      reportRows: state => state.reportRows,
      listLoading: state => state.listLoading,
      listLoaded: state => state.listLoaded,
    }),
    ...mapState('admin/reportEmail', {
      initialized: state => state.initialized,
      userRows: state => state.userRows,
      userListLoaded: state => state.userListLoaded,
      deviceRows: state => state.deviceRows,
      deviceListLoaded: state => state.deviceListLoaded,
      availableUserListLoaded: state => state.availableUserListLoaded,
      availableUserRows: state => state.availableUserRows,
    }),
    localeDateTimeFormat() {
      return moment.localeData().longDateFormat('LLL');
    },
    isModeCreate() {
      return this.mode === availableMode.create;
    },
    isModeEdit() {
      return this.mode === availableMode.edit;
    },
    frequencyList() {
      return utilReport.mailGetFrequencyList(this.$t.bind(this));
    },
    timeZoneList() {
      return this.$moment.tz.names().map(t => ({
        value: t,
        label: t,
      }));
    },
    availableUserRowsList() {
      return this.availableUserRows
        .map(u => ({
          value: u.id,
          label: utilUser.databaseUserToFullName(u),
          sublabel: u.email,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    },
    getDeviceList() {
      return this.deviceRows
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name));
    },
    getDeviceTableList() {
      return this.getDeviceList
        .filter(s => this.selectedDevice.find(t => t === s.id));
    },
    getNewDeviceTableList() {
      return this.getDeviceList
        .filter(s => !this.selectedDevice.find(t => t === s.id))
        .map(e => ({
          label: e.name,
          // sublabel: 'Entity path ?',
          value: e.id,
        }));
    },
  },
  created() {
    this.$loadEditData();
  },
  watch: {
    queryString: {
      handler() {
        if (this.isModeEdit) {
          this.$loadEditData();
        }
      },
      deep: true,
    },
  },
  methods: {
    // Available users filtering function
    filterAvailableUserRows(val, update) {
      if (val === '') {
        update(() => {
          this.availableUserRowsListOptions = this.availableUserRowsList;
        });
      } else {
        update(() => {
          const u = val.toLowerCase();
          this.availableUserRowsListOptions = this.availableUserRowsList.filter(
            v => (typeof v.label === 'string'
              ? v.label.toLowerCase().indexOf(u) > -1
              : false),
          );
        });
      }
    },
    // Timezone filtering function
    filterTimezone(val, update) {
      if (val === '') {
        update(() => {
          this.filterTimezoneOptions = this.timeZoneList;
        });
      } else {
        update(() => {
          const tzlc = val.toLowerCase();
          this.filterTimezoneOptions = this.timeZoneList.filter(
            v => (typeof v.value === 'string'
              ? v.value.toLowerCase().indexOf(tzlc) > -1
              : false),
          );
        });
      }
    },
    // New device filtering function
    filternewDeviceTable(val, update) {
      if (val === '') {
        update(() => {
          this.newDeviceTableOptions = this.getNewDeviceTableList;
        });
      } else {
        update(() => {
          const d = val.toLowerCase();
          this.newDeviceTableOptions = this.getNewDeviceTableList.filter(
            v => (typeof v.label === 'string'
              ? v.label.toLowerCase().indexOf(d) > -1
              : false),
          );
        });
      }
    },
    $watchUserChange() {
      // Propose to set report's time zone to the same as
      // the selected user
      const user = this.availableUserRows
        .find(u => u.id === this.reportEmail.configuration.user.value);
      this.reportEmail.configuration.intervalTimeZone = this.timeZoneList
        .find(t => t.value === user.time_zone);

      // Load available device for this user and report
      this.$store.dispatch('admin/reportEmail/getDeviceList', {
        report: this.internalReport,
        user,
      });
    },
    $loadEditData() {
      // Get route parameters to extract report ID
      if (!this.queryString || !this.queryString.rid) {
        // Invalid parameters, go back to previous page
        this.handleCancel();
        return;
      }
      const rid = parseInt(this.$route.query.rid, 10);
      if (Number.isNaN(rid)) {
        // Invalid parameters, go back to previous page
        this.handleCancel();
        return;
      }

      // Get route parameters to extract user ID
      let uid;
      if (this.isModeEdit) {
        if (!this.queryString || !this.queryString.uid) {
          // Invalid parameters, go back to previous page
          this.handleCancel();
          return;
        }
        uid = parseInt(this.$route.query.uid, 10);
        if (Number.isNaN(uid)) {
          // Invalid parameters, go back to previous page
          this.handleCancel();
          return;
        }
      }

      // If report list is not already loaded, load it
      let p;
      if (!this.listLoading && !this.listLoaded) {
        p = this.$store.dispatch('admin/report/getList');
      } else {
        p = Promise.resolve();
      }
      p
        // Test if this report exists
        .then(() => {
          this.internalReport = this.reportRows.find(r => r.id === rid);
          if (!this.internalReport) {
            // Invalid parameters, emit to parent
            this.$emit('invalid-parameters');
            throw new Error(this.$t('admin.report.components.createEditEmail.reportDoesNotExists'));
          }

          // Initialize the reportEmail store
          return this.$store.dispatch('admin/reportEmail/initialize');
        })
        // Get list of email of this report
        .then(() => this.$store.dispatch('admin/reportEmail/getList', this.internalReport))
        // Test if this user exists
        .then(() => {
          if (this.isModeEdit) {
            this.internalUser = this.userRows.find(u => u.id === uid);
            if (!this.internalUser) {
              // Invalid parameters, emit to parent
              this.$emit('invalid-parameters');
              throw new Error(this.$t('admin.report.components.createEditEmail.userDoesNotExists'));
            }

            // Load list of available devies
            return this.$store.dispatch('admin/reportEmail/getDeviceList', {
              report: this.internalReport,
              user: this.internalUser,
            });
          }

          // No user selected yet, so we can't get list of available device because
          // it depends on the rights of the user versus the entities
          return Promise.resolve();
        })
        // List available user of this report
        .then(() => this.$store.dispatch(
          'admin/reportEmail/getAvailableUserList',
          this.internalReport,
        ))

        .then(() => {
          // Set initial report's email data
          if (this.isModeEdit) {
            // Set frequency
            this.reportEmail.configuration.frequency = this.frequencyList
              .find(f => f.value === utilReport.mailFrequencyToListElement(
                this.frequencyList,
                this.internalUser,
              ).value);

            let startingDate;
            // Set starting date
            if (this.internalUser.last_date_sent) {
              startingDate = moment
                .unix(parseInt(this.internalUser.last_date_sent, 10))
                .tz(this.internalUser.time_zone);
            } else {
              startingDate = moment()
                .tz(this.internalUser.time_zone)
                .startOf('day')
                .local();
            }

            // Use the quasar date format to format the startingDate since there is no guarantee
            // that the formats of the "momentjs" library produce the same string.
            this.reportEmail.configuration.startingDate = date
              .formatDate(startingDate.valueOf(), this.localeDateTimeFormat);
            // Set time zone
            this.reportEmail.configuration.intervalTimeZone = this.timeZoneList
              .find(t => t.value === this.internalUser.interval_time_zone);

            // Set user
            this.reportEmail.configuration.user = this.availableUserRowsList
              .find(u => u.value === this.internalUser.id);

            // Set selected device
            this.selectedDevice = this.deviceRows
              .filter(d => d.selected).map(d => d.id);

            // Keep original report key
            this.reportEmail.user = this.availableUserRowsList
              .find(u => u.value === this.internalUser.id);
          }

          // If user change, propose a the user's timezone
          this.$watch('reportEmail.configuration.user', this.$watchUserChange);

          // Update props to parent
          this.$emit('update:report', this.internalReport);
          if (this.isModeEdit) {
            this.$emit('update:user', this.internalUser);
          }
        })
        .catch((error) => {
          this.$q.notify({
            color: 'negative',
            message: error.message || error,
            icon: 'report_problem',
          });
        });
    },
    // Build the edited object before submiting the result
    $buildSubmitResult() {
      const newUser = this.availableUserRows
        .find(u => u.id === this.reportEmail.configuration.user.value);
      const result = {
        report: this.internalReport,
        user: this.isModeCreate
          ? this.availableUserRows
            .find(u => u.id === this.reportEmail.configuration.user.value)
          : this.internalUser,
        configuration: {
          // Ensure to parse the date to the user's timezone
          starting_date: moment(
            this.reportEmail.configuration.startingDate,
            this.localeDateTimeFormat,
          )
            .tz(newUser.time_zone, true)
            .valueOf(),
          interval_time_zone: this.reportEmail.configuration.intervalTimeZone.value,
          user: newUser,
        },
      };
      Object.keys(this.reportEmail.configuration.frequency.value).forEach((k) => {
        if (k.startsWith('interval_')) {
          result.configuration[k] = this.reportEmail.configuration.frequency.value[k];
        }
      });
      result.configuration.devices = this.selectedDevice.map((d) => {
        const foundDevice = this.deviceRows.find(fd => fd.id === d);
        return {
          id: foundDevice.id,
          updated_at: foundDevice.updated_at,
        };
      });
      return result;
    },
    // Validate form
    touchForm() {
      this.$v.reportEmail.$touch();
    },
    // Validate form and emit a submit signal
    validateFormAndEmitHandler() {
      this.touchForm();
      if (!this.$v.reportEmail.$error) {
        if (this.isModeCreate || this.isModeEdit) {
          this.$emit('submit', this.$buildSubmitResult());
        } else {
          this.$emit('invalid-parameters');
        }
      }
    },
    scrollToUser(elementID) {
      // Scroll to a device's row
      const row = document.getElementById(elementID);
      const tbody = document.querySelector('tbody');
      this.$scrollTo(row, 500, { container: tbody });
    },
    addNewDevice() {
      // Find corresponding device and add it to the device's table
      if (!Array.isArray(this.addDevice) || this.addDevice.length <= 0) {
        return;
      }
      const toAdd = [];
      this.addDevice.forEach((t) => {
        const d = this.deviceRows.find(x => x.id === t.value);
        if (d) {
          toAdd.push(d.id);
        }
      });
      this.selectedDevice.push(...toAdd);

      // Scroll to latest row added
      this.$nextTick(() => {
        const lastDevice = this.addDevice[this.addDevice.length - 1];
        this.scrollToUser(`rowDevice_${lastDevice}`);

        // Clear added user
        this.addDevice.splice(0, this.addDevice.length);
      });
    },
    removeDevice(deviceId) {
      // Find corresponding device and remove it
      const deviceIndex = this.selectedDevice.indexOf(deviceId);
      if (deviceIndex > -1) {
        this.selectedDevice.splice(deviceIndex, 1);
      }
    },
  },
};
</script>

<style lang="stylus" scoped>

.admin-report-email-create-edit {

  #deviceTable,
  #deviceAddTable {
    th:first-child,
    td:first-child {
      width: 4rem;
    }
  }

  // >>> Deep Selectors
  // https://vue-loader.vuejs.org/guide/scoped-css.html#deep-selectors
  >>> #deviceTable > .q-table__top {
    padding: 0;
  }

  .q-table thead, tbody tr {
    display: table;
    width: 100%;
    table-layout: fixed;
  }

  .q-table thead, theader th {
    text-align: left;
  }

  .q-table tbody {
    display: block;
    min-height: 1vh;
    max-height: 25vh;
    overflow-y: scroll;
  }
}
</style>
