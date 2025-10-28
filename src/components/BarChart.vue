<script>
import { Bar } from 'vue-chartjs'

const numberFormat = new Intl.NumberFormat('en-AU', {
  notation: "compact",
  compactDisplay: "short"
})

export default {
  extends: Bar,
  name: 'BarChart',
  props: {
    data: Object,
    title: String,
    options: Object,
    color: String,
    formatXDate: Boolean,
    formatYPrice: Boolean,
    formatYPercent: Boolean
  },
  methods: {
    setData (data) {
      if (data) {
        const chartData = {
          labels: Object.keys(data),
          datasets: [
            {
              label: this.title,
              data: Object.values(data),
              borderColor: this.color || '#22409a',
              backgroundColor: this.color || 'rgba(34, 64, 154, 0.2)'
            }
          ]
        }
        this.renderChart(chartData, {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            xAxes: [
              this.formatXDate ? {
                gridLines: {
                  display: false
                },
                type: 'time',
                time: {
                  parser: 'D/M/YY',
                  unit: 'month',
                  stepSize: 1,
                  minUnit: 'month',
                  displayFormats: {
                    month: 'MMM YY'
                  }
                },
                bounds: 'data',
                ticks: {
                  source: 'data'
                }
              } : {
              gridLines: {
                display: false
              }
            }],
            yAxes: [{
              ticks: {
                min: 0,
                maxTicksLimit: 6,
                callback: value => {
                  if (this.formatYPrice) {
                    return '$' + numberFormat.format(value)
                  } else if (this.formatYPercent) {
                    return Math.round(value, 0) + '%'
                  } else {
                    return value
                  }
                }
              }
            }]
          }
        })
      }
    }
  },
  mounted () {
    this.setData(this.data)
  },
  watch: {
    data: function (data) {
      this.setData(data)
    }
  }
}
</script>
<style>
</style>
