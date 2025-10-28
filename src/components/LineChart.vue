<script>
import { Line } from 'vue-chartjs'

const numberFormat = new Intl.NumberFormat('en-AU', {
  notation: "compact",
  compactDisplay: "short"
})

export default {
  extends: Line,
  name: 'LineChart',
  props: {
    data: Object,
    title: String,
    options: Object,
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
              borderColor: '#434343',
              backgroundColor: 'rgba(125, 125, 125, 0.2)',
              lineTension: 0.3
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
                  parser: 'MMM YYYY',
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
                    return Math.round(value * 100, 0) + '%'
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
  }
}
</script>
<style>
</style>
