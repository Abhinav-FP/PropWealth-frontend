<template>
  <div style="height:350px; max-width:420px; margin:auto;">
    <canvas ref="canvas" id="radar-chart"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js'

export default {
  name: 'ScoreRadarChart',
  props: {
    scores: {
      type: Object,
      required: true
    }
  },
  
  data() {
    return {
      chart: null
    }
  },
  
  mounted() {
    this.$nextTick(() => {
      this.createChart()
    })
  },

  watch: {
    scores: {
      deep: true,
      handler() {
        this.$nextTick(() => {
          this.createChart()
        })
      }
    }
  },
  
  beforeDestroy() {
    if (this.chart) {
      this.chart.destroy()
    }
  },
  
  methods: {
    createChart() {
      if (!this.scores || !this.$refs.canvas) return

      console.log('Creating radar chart with:', this.scores)

      // Destroy existing chart
      if (this.chart) {
        this.chart.destroy()
      }

      const ctx = this.$refs.canvas.getContext('2d')
      
      this.chart = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: [
            'Affluency',
            'Affordability',
            'Liquidity',
            'Supply',
            'Investor Score'
          ],
          datasets: [
            {
              label: 'Scores',
              data: [
                this.scores['Affluency score'] || 0,
                this.scores['Affordability score'] || 0,
                this.scores['Liquidity score'] || 0,
                this.scores['Supply score'] || 0,
                this.scores['Investor score'] || 0
              ],
              backgroundColor: 'rgba(255, 0, 70, 0.2)',
              borderColor: '#ff0046',
              borderWidth: 2,
              pointBackgroundColor: '#ff0046',
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 7
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            display: false
          },
          scale: {
            ticks: {
              beginAtZero: true,
              min: 0,
              max: 10,
              stepSize: 2,
              backdropColor: 'rgba(255, 255, 255, 0)'
            },
            gridLines: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            angleLines: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            pointLabels: {
              fontSize: 14,
              fontColor: '#333'
            }
          }
        }
      })

      console.log('Chart created:', this.chart)
    }
  }
}
</script>