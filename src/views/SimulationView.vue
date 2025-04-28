<template>
  <div class="simulation-view">
    <h1>Simulation View</h1>
    <p>
      This is a simulation view where you can control the flow of water in
      different areas of the corridor.
    </p>
    <p>
      The total flow is <span class="total">{{totalFlow}}</span>.
      It is calculated based on the sum of the
      cold (<span class="cold">{{aggregateCold}}</span>) and
      hot (<span class="hot">{{aggregateHot}}</span>)
      water flows from the kitchen and the two showers.
    </p>
    <p>
      The flow values are sent to the server every 5 seconds. The total amount of water consumed
      is: <span class="hot">{{totalHot}}</span> litres of hot and
       <span class="cold">{{totalCold}}</span> litres of cold water.
    </p>
    <div class="control-group">
      <h2>Kitchen</h2>
      <ControlComponent name="Cold" v-model="kitchen.cold" />
      <ControlComponent name="Hot" v-model="kitchen.hot" />
    </div>
    <div class="control-group">
      <h2>Shower 1</h2>
      <ControlComponent name="Cold" v-model="shower1.cold" />
      <ControlComponent name="Hot" v-model="shower1.hot" />
    </div>
    <div class="control-group">
      <h2>Shower 2</h2>
      <ControlComponent name="Cold" v-model="shower2.cold" />
      <ControlComponent name="Hot" v-model="shower2.hot" />
    </div>
  </div>
</template>

<script>
import ControlComponent from "@/components/ControlComponent.vue";

export default {
  name: "SimulationView",
  components: {
    ControlComponent,
  },
  data() {
    return {
      kitchen: {cold: 0, hot: 0},
      shower1: {cold: 0, hot: 0},
      shower2: {cold: 0, hot: 0},
      totalHot: 0,
      totalCold: 0,
      kitchenTimeout: null,
      shower1Timeout: null,
      shower2Timeout: null,
      fetchWaterDataInterval: null,
    };
  },
  computed: {
    aggregateCold() {
      return this.kitchen.cold + this.shower1.cold + this.shower2.cold;
    },
    aggregateHot() {
      return this.kitchen.hot + this.shower1.hot + this.shower2.hot;
    },
    totalFlow() {
      return this.aggregateCold + this.aggregateHot;
    },
  },
  watch: {
    kitchen: {
      deep: true,
      handler() {
      clearInterval(this.kitchenTimeout);
      this.kitchenTimeout = setInterval(() => {
        if (this.kitchen.cold !== 0) {
        this.sendWaterFlowData("kitchen", "cold", this.kitchen.cold);
        }
        if (this.kitchen.hot !== 0) {
        this.sendWaterFlowData("kitchen", "hot", this.kitchen.hot);
        }
      }, 5000);
      },
    },
    shower1: {
      deep: true,
      handler() {
      clearInterval(this.shower1Timeout);
      this.shower1Timeout = setInterval(() => {
        if (this.shower1.cold !== 0) {
        this.sendWaterFlowData("shower1", "cold", this.shower1.cold);
        }
        if (this.shower1.hot !== 0) {
        this.sendWaterFlowData("shower1", "hot", this.shower1.hot);
        }
      }, 5000);
      },
    },
    shower2: {
      deep: true,
      handler() {
      clearInterval(this.shower2Timeout);
      this.shower2Timeout = setInterval(() => {
        if (this.shower2.cold !== 0) {
        this.sendWaterFlowData("shower2", "cold", this.shower2.cold);
        }
        if (this.shower2.hot !== 0) {
        this.sendWaterFlowData("shower2", "hot", this.shower2.hot);
        }
      }, 5000);
      },
    },
  },
  created() {
    this.fetchTotalWaterData();
    this.fetchWaterDataInterval = setInterval(() => {
      this.fetchTotalWaterData();
    }, 5000);
  },
  beforeUnmount() {
    clearInterval(this.kitchenTimeout);
    clearInterval(this.shower1Timeout);
    clearInterval(this.shower2Timeout);
    clearInterval(this.fetchWaterDataInterval);
  },
  methods: {
    sendWaterFlowData(room, flowType, value) {
      const data = {
        room: room,
        type: flowType,
        amount: value
      };
      fetch("https://waterfront.onrender.com/api/water-flow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).catch((error) => {
        console.error("Error sending water flow data:", error);
      });
    },
    fetchTotalWaterData() {
      fetch("https://waterfront.onrender.com/api/water-usage", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          this.totalHot = data[1].total_usage || 0;
          this.totalCold = data[0].total_usage || 0;
        })
        .catch((error) => {
          console.error("Error requesting water flow data:", error);
        });
    },
  },
};
</script>

<style scoped>
.simulation-view {
  padding: 2rem;
}

.control-group {
  margin-bottom: 2rem;
}

h2 {
  margin-bottom: 0;
}
.cold {
  font-weight: bold;
  color: #007BFF;
}
.hot {
  font-weight: bold;
  color: #FF5733;
}
.total {
  font-weight: bold;
  color: #aa44aa;
}
</style>
