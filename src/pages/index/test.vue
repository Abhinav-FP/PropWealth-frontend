<script>
export default {
  methods: {
    // New method to activate all tabs for report generation
    activateAllTabsForReport() {
  // Get all tab indices that contain charts
  const chartTabs = [
    this.tabs.indexOf('House Trends') + 1,
    this.tabs.indexOf('Unit Trends') + 1,
    this.tabs.indexOf('Rent Trends') + 1,
    this.tabs.indexOf('Price Segments') + 1,
    this.tabs.indexOf('Elevation') + 1,
    this.tabs.indexOf('Profiles') + 1
  ].filter(index => index > 0); // Remove any -1 results (not found)

  let currentTabIndex = 0;

  // Function to sequentially activate each tab
  const activateNextTab = () => {
    if (currentTabIndex < chartTabs.length) {
      this.tab = chartTabs[currentTabIndex];

      // Wait for Vue to update and charts to render
      this.$nextTick(() => {
        setTimeout(() => {
          currentTabIndex++;
          activateNextTab();
        }, 100); // Small delay to ensure rendering
      });
    } else {
      // All tabs have been activated, reset to Summary tab
      this.tab = 1;
      console.log('All tabs have been pre-loaded for report generation');
    }
  };

  // Start the activation process
  activateNextTab();
},

    // Alternative: Modify chart capture to ensure tab is active
    async captureChartByRef(refName) {
      // Map chart refs to their corresponding tab indices
      const chartToTabMap = {
        'houseInventory': this.tabs.indexOf('House Trends') + 1,
        'houseListings': this.tabs.indexOf('House Trends') + 1,
        'housePrice': this.tabs.indexOf('House Trends') + 1,
        'houseRents': this.tabs.indexOf('Rent Trends') + 1,
        'unitInventory': this.tabs.indexOf('Unit Trends') + 1,
        'unitListings': this.tabs.indexOf('Unit Trends') + 1,
        'unitPrice': this.tabs.indexOf('Unit Trends') + 1,
        'unitRents': this.tabs.indexOf('Rent Trends') + 1,
        'vacancyRates': this.tabs.indexOf('Rent Trends') + 1,
        'housePriceSegments': this.tabs.indexOf('Price Segments') + 1,
        'unitPriceSegments': this.tabs.indexOf('Price Segments') + 1,
        'Elevation': this.tabs.indexOf('Elevation') + 1,
        'SEIFA': this.tabs.indexOf('Profiles') + 1
      };

      const requiredTab = chartToTabMap[refName];
      if (requiredTab && this.tab !== requiredTab) {
        // Switch to the required tab
        this.tab = requiredTab;
        // Wait for Vue to update the DOM
        await this.$nextTick();
        // Give additional time for chart to fully render
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const chartComponent = this.$refs[refName];
      if (!chartComponent) {
        throw new Error(`Chart component with ref '${refName}' not found.`);
      }

      const canvas = chartComponent.$refs.canvas;
      return canvas.toDataURL('image/png');
    }
  }
};
</script>