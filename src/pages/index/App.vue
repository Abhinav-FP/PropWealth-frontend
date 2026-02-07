<template>
  <div data-vuetify>



    <v-app :class="{
      'mobile': $vuetify.breakpoint.xs
    }">

      <v-app-bar v-if="config.showHeader" app :color="config.navColor ? config.navColor : 'primary'" elevation=0
        height=70>
        <v-toolbar-title class="toolbar-logo">
          <v-img :src="require(`../../assets/${config.logo}`)" :alt="config.logoAlt" contain height="58"
            :width="config.logoSize.width / config.logoSize.height * 58" eager></v-img>
        </v-toolbar-title>
        <v-spacer></v-spacer>
      </v-app-bar>

      <v-main :class="{
        'mobile': $vuetify.breakpoint.xs,
        'desktop': !$vuetify.breakpoint.xs
      }">

        <v-container fill-height fluid class="d-flex flex-column align-center justify-center main-content-wrapper">
          <v-card class="main-content-card mx-auto" :width="$vuetify.breakpoint.xs ? '100%' : '100%'" elevation="12">
            <div class="d-flex fill-height" :class="{
              'flex-row': selectedId && !$vuetify.breakpoint.xs,
              'flex-column': $vuetify.breakpoint.xs
            }">

              <v-progress-circular v-if="isloading" class="progressCicle" indeterminate></v-progress-circular>

              <div :class="{
                'panel-background': true,
                'feature-active': selectedId,
                'pointer-events-none': !selectedId
              }"></div>

              <div :class="{
                'panel-content': true,
                'd-flex': true,
                'flex-column': true,
                'px-3': true,
                'sm:pb-3': true,
                'feature-active': selectedId,
                'pointer-events-none': !selectedId
              }" ref="panelContent">

                <div v-if="selectedFeature" class="suburb-title ma-4 py-2 pl-4 pr-2" @click="clearSelected">
                  <v-btn icon absolute top right @click="clearSelected" class="close-button" width="54"
                    height="54"><v-icon>{{ icons.close }}</v-icon>
                  </v-btn>

                  <h2 v-if="selectedFeature.SuburbData.Suburb" class="panel-header text-h2 pt-0">
                    {{ selectedFeature.SuburbData.Suburb }}
                    <!-- <span v-if="selectedId in data && data[selectedId].State"> {{ data[selectedId].State }}</span> -->
                  </h2>
                </div>

                <div v-else class="pointer-events-all">
                  <v-text-field v-model="searchQuery" class="search ma-4" clearable label="Search suburbs" solo>
                  </v-text-field>
                  <v-card v-if="searchQuery && searchResults" class="search-results">
                    <v-list dense>
                      <v-list-item v-for="result in searchResults" :key=result.id two-line
                        @click="selectResult(result.id)">
                        <v-list-item-content>
                          <v-list-item-title>{{ result.properties.name }}</v-list-item-title>
                          <v-list-item-subtitle>{{ statesLocal[result.properties.state] }}</v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>

                      <v-list-item v-if="searchResults.length === 0" disabled>
                        <v-list-item-content>
                          <v-list-item-title class="text-center">Suburb not found</v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </v-card>
                </div>

                <div class="tab-row d-flex flew-row align-center" v-if="selectedId">
                  <v-btn icon height="100%" :disabled="tab === ($vuetify.breakpoint.xs ? 0 : 1)"
                    @click="prevTab"><v-icon>{{ icons.left }}</v-icon>
                  </v-btn>

                  <v-tabs v-model="tab" grow center-active height="78" icons-and-text class="tabs" ref="tabs">
                    <v-tab v-show="$vuetify.breakpoint.xs" key="Map" title="Map">
                      Map
                      <v-img :src="require(`../../assets/Map.svg`)" alt="Map" contain height="32" eager>
                        <template v-slot:placeholder>
                          <v-row class="fill-height ma-0" align="center" justify="center">
                            <v-progress-circular indeterminate color="primary lighten-1"></v-progress-circular>
                          </v-row>
                        </template>
                      </v-img>
                    </v-tab>

                    <v-tab v-for="item in tabs" :key="item" :title="item">
                      {{ item }}
                      <v-img :src="require(`../../assets/${item}.svg`)" :alt="item" contain height="32" width="36"
                        eager>
                        <template v-slot:placeholder>
                          <v-row class="fill-height ma-0" align="center" justify="center">
                            <v-progress-circular indeterminate color="primary lighten-1"></v-progress-circular>
                          </v-row>
                        </template>
                      </v-img>
                    </v-tab>
                  </v-tabs>

                  <v-btn icon height="100%" :disabled="tab === (tabs.length + 1) - 1" @click="nextTab">
                    <v-icon>{{ icons.right }}</v-icon>
                  </v-btn>
                </div>

                <v-fade-transition>
                  <div v-if="selectedFeature && tab > 0" class="scroll-content fade-bottom ml-3 mt-2">
                    <v-tabs-items v-if="selectedFeature && !($vuetify.breakpoint.xs && tab === 0)" v-model="tab">
                      <v-tab-item key="Map">
                      </v-tab-item>
                      <v-tab-item key="Summary">
                        <h3 class="text-h3 mt-2">House Summary</h3>
                        <v-progress-linear v-if="!(selectedFeature && selectedFeature.Summary)" indeterminate
                          color="primary"></v-progress-linear>
                        <div v-if="selectedFeature && selectedFeature.Summary" class="text-body-1 mb-4">
                          {{ selectedFeature.Summary['House Text'] }}</div>

                        <v-divider class="my-4"></v-divider>

                        <h3 class="text-h3">Unit Summary</h3>
                        <v-progress-linear v-if="!(selectedFeature && selectedFeature.Summary)" indeterminate
                          color="primary"></v-progress-linear>
                        <div v-if="selectedFeature && selectedFeature.Summary" class="text-body-1 mb-4">
                          {{ selectedFeature.Summary['Unit Text'] }}</div>

                      <v-divider class="my-4"></v-divider>

                      <h3 class="text-h3">Scores</h3>
                      <v-progress-linear
                        v-if="!(selectedFeature && selectedFeature.Scores)"
                        indeterminate
                        color="primary"
                      />
                      <score-radar-chart
                        v-if="selectedFeature && selectedFeature.Scores"
                        :scores="selectedFeature.Scores"
                        ref="scoreRadarChart"
                      />
                      </v-tab-item>

                      <v-tab-item key="House Trends">
                        <v-card v-if="!(selectedFeature && !selectedFeature['House Inventory'])" height="200"
                          class="mt-6" elevation=0 :loading="!(selectedFeature && selectedFeature['House Inventory'])">
                          <template slot="progress">
                            <v-layout fill-height align-center justify-center ma-0>
                              <v-progress-circular color="primary" indeterminate></v-progress-circular>
                            </v-layout>
                          </template>
                          <LineChart v-if="selectedFeature && selectedFeature['House Inventory']" ref="houseInventory"
                            class="bar-chart" title="House Inventory" :data="selectedFeature['House Inventory']">
                          </LineChart>
                        </v-card>

                        <v-divider class="my-4"></v-divider>
                        <v-card v-if="!(selectedFeature && !selectedFeature['House Listings'])" height="200" elevation=0
                          :loading="!(selectedFeature && selectedFeature['House Listings'])">
                          <template slot="progress">
                            <v-layout fill-height align-center justify-center ma-0>
                              <v-progress-circular color="primary" indeterminate></v-progress-circular>
                            </v-layout>
                          </template>
                          <LineChart v-if="selectedFeature && selectedFeature['House Listings']" ref="houseListings"
                            class="bar-chart" title="House Listings" :data="selectedFeature['House Listings']">
                          </LineChart>
                        </v-card>

                        <v-divider class="my-4"></v-divider>
                        <v-card v-if="!(selectedFeature && !selectedFeature['House Price'])" height="200" elevation=0
                          :loading="!(selectedFeature && selectedFeature['House Price'])">
                          <template slot="progress">
                            <v-layout fill-height align-center justify-center ma-0>
                              <v-progress-circular color="primary" indeterminate></v-progress-circular>
                            </v-layout>
                          </template>
                          <LineChart v-if="selectedFeature && selectedFeature['House Price']" ref="housePrice"
                            class="bar-chart" title="House Price" :data="selectedFeature['House Price']" format-y-price>
                          </LineChart>
                        </v-card>
                        <p class="mt-4">{{ chartNotice }}</p>
                      </v-tab-item>

                      <v-tab-item key="Unit Trends">
                        <v-card v-if="!(selectedFeature && !selectedFeature['Unit Inventory'])" height="200"
                          class="mt-6" elevation=0 :loading="!(selectedFeature && selectedFeature['Unit Inventory'])">
                          <template slot="progress">
                            <v-layout fill-height align-center justify-center ma-0>
                              <v-progress-circular color="primary" indeterminate></v-progress-circular>
                            </v-layout>
                          </template>
                          <LineChart v-if="selectedFeature && selectedFeature['Unit Inventory']" ref="unitInventory"
                            class="bar-chart" title="Unit Inventory" :data="selectedFeature['Unit Inventory']">
                          </LineChart>
                        </v-card>

                        <v-divider class="my-4"></v-divider>
                        <v-card v-if="!(selectedFeature && !selectedFeature['Unit Listings'])" height="200" elevation=0
                          :loading="!(selectedFeature && selectedFeature['Unit Listings'])">
                          <template slot="progress">
                            <v-layout fill-height align-center justify-center ma-0>
                              <v-progress-circular color="primary" indeterminate></v-progress-circular>
                            </v-layout>
                          </template>
                          <LineChart v-if="selectedFeature && selectedFeature['Unit Listings']" ref="unitListings"
                            class="bar-chart" title="Unit Listings" :data="selectedFeature['Unit Listings']">
                          </LineChart>
                        </v-card>

                        <v-divider class="my-4"></v-divider>
                        <v-card v-if="!(selectedFeature && !selectedFeature['Unit Price'])" height="200" elevation=0
                          :loading="!(selectedFeature && selectedFeature['Unit Price'])">
                          <template slot="progress">
                            <v-layout fill-height align-center justify-center ma-0>
                              <v-progress-circular color="primary" indeterminate></v-progress-circular>
                            </v-layout>
                          </template>
                          <LineChart v-if="selectedFeature && selectedFeature['Unit Price']" ref="unitPrice"
                            class="bar-chart" title="Unit Price" :data="selectedFeature['Unit Price']" format-y-price>
                          </LineChart>
                        </v-card>
                        <p class="mt-4">{{ chartNotice }}</p>
                      </v-tab-item>
                      <v-tab-item key="Rent Trends">
                        <v-card v-if="!(selectedFeature && !selectedFeature['House Rents'])" height="200" class="mt-6"
                          elevation=0 :loading="!(selectedFeature && selectedFeature['House Rents'])">
                          <template slot="progress">
                            <v-layout fill-height align-center justify-center ma-0>
                              <v-progress-circular color="primary" indeterminate></v-progress-circular>
                            </v-layout>
                          </template>
                          <LineChart v-if="selectedFeature && selectedFeature['House Rents']" ref="houseRents"
                            class="bar-chart" title="House Rents" :data="selectedFeature['House Rents']" format-y-price>
                          </LineChart>
                        </v-card>
                        <v-divider class="my-4"></v-divider>
                        <v-card v-if="!(selectedFeature && !selectedFeature['Unit Rents'])" height="200" elevation=0
                          :loading="!(selectedFeature && selectedFeature['Unit Rents'])">
                          <template slot="progress">
                            <v-layout fill-height align-center justify-center ma-0>
                              <v-progress-circular color="primary" indeterminate></v-progress-circular>
                            </v-layout>
                          </template>
                          <LineChart v-if="selectedFeature && selectedFeature['Unit Rents']" ref="unitRents"
                            class="bar-chart" title="Unit Rents" :data="selectedFeature['Unit Rents']" format-y-price>
                          </LineChart>
                        </v-card>

                        <v-divider class="my-4"></v-divider>
                        <v-card v-if="!(selectedFeature && !selectedFeature['Vacancy Rates'])" height="200" elevation=0
                          :loading="!(selectedFeature && selectedFeature['Vacancy Rates'])">
                          <template slot="progress">
                            <v-layout fill-height align-center justify-center ma-0>
                              <v-progress-circular color="primary" indeterminate></v-progress-circular>
                            </v-layout>
                          </template>
                          <LineChart v-if="selectedFeature && selectedFeature['Vacancy Rates']" ref="vacancyRates"
                            class="bar-chart" title="Vacancy Rates" :data="selectedFeature['Vacancy Rates']">
                          </LineChart>
                        </v-card>
                        <p class="mt-4">{{ chartNotice }}</p>
                      </v-tab-item>
                      <v-tab-item key="Price Segments">
                        <v-card v-if="!(selectedFeature && !selectedFeature['Unit Price Segments'])" height="200"
                          class="mt-6" elevation=0
                          :loading="!(selectedFeature && selectedFeature['Unit Price Segments'])">
                          <template slot="progress">
                            <v-layout fill-height align-center justify-center ma-0>
                              <v-progress-circular color="primary" indeterminate></v-progress-circular>
                            </v-layout>
                          </template>
                          <BarChart v-if="selectedFeature && selectedFeature['Unit Price Segments']"
                            ref="unitPriceSegments" class="bar-chart" color="#aa638c" title="Price segments units"
                            :data="selectedFeature['Unit Price Segments']" format-y-percent>
                          </BarChart>
                        </v-card>
                        <v-divider class="my-4"></v-divider>
                        <v-card v-if="!(selectedFeature && !selectedFeature['House Price Segments'])" height="200"
                          elevation=0 :loading="!(selectedFeature && selectedFeature['House Price Segments'])">
                          <template slot="progress">
                            <v-layout fill-height align-center justify-center ma-0>
                              <v-progress-circular color="primary" indeterminate></v-progress-circular>
                            </v-layout>
                          </template>
                          <BarChart v-if="selectedFeature && selectedFeature['House Price Segments']"
                            ref="housePriceSegments" class="bar-chart" color="#91bf71" title="Price segments houses"
                            :data="selectedFeature['House Price Segments']" format-y-percent></BarChart>
                        </v-card>
                      </v-tab-item>
                      <v-tab-item key="Elevation">
                        <v-card height="200" elevation=0 :loading="!(selectedFeature)">
                          <template slot="progress">
                            <v-layout fill-height align-center justify-center ma-0>
                              <v-progress-circular color="primary" indeterminate></v-progress-circular>
                            </v-layout>
                          </template>
                          <BarChart v-if="selectedFeature && selectedFeature['Elevation']" ref="Elevation"
                            class="bar-chart elevation-chart float-left" title="SA1 regions by elevation"
                            :data="elevationData" :options="{
                              scales: {
                                x: {
                                  title: {
                                    display: true,
                                    text: 'Elevation (meters above sea level)'
                                  }
                                }
                              }
                            }"></BarChart>
                          <v-list dense class="legend float-right mt-8">
                            <v-list-item v-for="[v, color] in sa1ElevationLegend" :key="v">
                              <v-avatar :color="color" tile class="mr-1" size="16"></v-avatar> {{ v }}m
                            </v-list-item>
                          </v-list>
                        </v-card>
                      </v-tab-item>
                      <v-tab-item key="Profiles">
                        <v-card
                          v-if="!(selectedFeature && !selectedFeature['SEIFA'])"
                          height="200"
                          elevation="0"
                          :loading="!(selectedFeature && selectedFeature['SEIFA'])"
                        >
                          <template slot="progress">
                            <v-layout fill-height align-center justify-center ma-0>
                              <v-progress-circular color="primary" indeterminate />
                            </v-layout>
                          </template>

                          <!-- WRAPPER FOR CAPTURE -->
                          <div ref="seifaCaptureArea" class="seifa-capture-area d-flex">

                            <BarChart
                              v-if="selectedFeature && selectedFeature['SEIFA']"
                              class="bar-chart seifa-chart float-left"
                              title="Social Index Distribution"
                              :data="selectedFeature['SEIFA']"
                            />

                            <v-list dense class="legend float-right">
                              <v-list-item v-for="[v, color] in sa1SeifaLegend" :key="v">
                                <v-avatar :color="color" tile class="mr-1" size="16" />
                                Rank {{ v }}
                              </v-list-item>
                            </v-list>
                            
                          </div>
                        </v-card>
                      </v-tab-item>
                    </v-tabs-items>
                  </div>
                </v-fade-transition>
                <v-spacer></v-spacer>

                <!-- <div
                  v-if="config.bannerAd && selectedFeature && selectedFeature.Banner && tab === 1 && !($vuetify.breakpoint.xs && tab === 0)"
                  class="pt-2">
                  <BannerAd v-if="selectedFeature.Banner.img && selectedFeature.Banner.link"
                    :img="selectedFeature.Banner.img" :link="selectedFeature.Banner.link"></BannerAd>
                  <BannerAd v-else-if="selectedFeature.Banner.img" :img="selectedFeature.Banner.img"></BannerAd>
                </div> -->

                <div class="icon_body" v-if="!$vuetify.breakpoint.xs" :class="{
                  'mx-auto': selectedFeature,
                  'mt-2': true,
                  'terms-footer': true,
                  'd-flex': true,
                  'justify-center': true,
                  'pointer-events-all': true
                }">
                  <div v-if="config.tou" class="mx-2 social-icon">
                    <a href="https://www.facebook.com/PropWealthau/" target="_blank">
                      <div class="float-left newsletter-logo mr-1">
                        <v-img :src="require('../../assets/facebook.svg')" alt="Facebook" contain height="24" width="24"
                          eager class="svg-filter-red">
                          <template v-slot:placeholder>
                            <v-row class="fill-height ma-0" align="center" justify="center">
                              <v-progress-circular indeterminate color="primary lighten-1"></v-progress-circular>
                            </v-row>
                          </template>
                        </v-img>
                      </div>
                    </a>
                  </div>
                  
                  <span v-if="config.tou && config.help"> | </span>
                  
                  <div v-if="config.tou" class="mx-2 social-icon">
                    <a href="https://www.instagram.com/propwealthau/" target="_blank">
                      <div class="float-left newsletter-logo mr-1">
                        <v-img :src="require('../../assets/instagram.svg')" alt="Instagram" contain height="24" width="24"
                          eager class="svg-filter-red">
                          <template v-slot:placeholder>
                            <v-row class="fill-height ma-0" align="center" justify="center">
                              <v-progress-circular indeterminate color="primary lighten-1"></v-progress-circular>
                            </v-row>
                          </template>
                        </v-img>
                      </div>
                    </a>
                    
                    <a class="d-none" href="https://suburbtrends.com/pages/terms-of-use" target="_parent">Terms of Use</a>
                  </div>

                  <span v-if="config.tou && config.help"> | </span>

                  <div v-if="config.tou" class="mx-2 social-icon">
                    <a href="https://www.linkedin.com/company/propwealth-au" target="_blank">
                      <div class="float-left newsletter-logo mr-1">
                        <v-img :src="require('../../assets/LinkedIn.svg')" alt="LinkedIn" class="svg-filter-red" contain height="24" width="24"
                          eager>
                          <template v-slot:placeholder>
                            <v-row class="fill-height ma-0" align="center" justify="center">
                              <v-progress-circular indeterminate color="primary lighten-1"></v-progress-circular>
                            </v-row>
                          </template>
                        </v-img>
                      </div>
                    </a>
                    
                    <a class="d-none" href="https://suburbtrends.com/pages/terms-of-use" target="_parent">Terms of Use</a>
                  </div>



                  <div v-if="config.help" class="mx-2 d-none">
                    <a href="https://suburbtrends.com/pages/help" target="_parent">Help</a>
                  </div>

                  <!-- <span v-if="(config.tou || config.help) && config.newsletter"> | </span> -->

                  <div v-if="config.newsletter" class="mx-2 d-none">
                    <a href="https://www.linkedin.com/newsletters/suburbtrends-6878830644470919168/" target="_blank">
                      <div class="float-left newsletter-logo mr-1">
                        <v-img :src="require('../../assets/LinkedIn.svg')" alt="LinkedIn" contain height="18" width="18"
                          eager>
                          <template v-slot:placeholder>
                            <v-row class="fill-height ma-0" align="center" justify="center">
                              <v-progress-circular indeterminate color="primary lighten-1"></v-progress-circular>
                            </v-row>
                          </template>
                        </v-img>
                      </div>
                      <div class="d-inline">
                        Newsletter
                      </div>
                    </a>
                  </div>

                </div>
              </div>
              <div class="logo_bg" :class="{
                'overlay-logo': true,
                'panel-open': selectedId && tab > 0
              }">
                <v-img class="logo-size" :src="require(`../../assets/${config.logo}`)" :alt="config.logoAlt" contain height="170"
                  :width="config.logoSize.width / config.logoSize.height * 170" eager></v-img>
              </div>

              <div v-show="!$vuetify.breakpoint.xs || !selectedFeature || tab === 0" id="suburbtrends-map"
                :class="{ 'map': true, 'selectedSuburb': !!selectedFeature, }" ref="suburbTrendsMap"
                @feature-selected="handleFeatureSelected">
              </div>

              <v-footer v-if="$vuetify.breakpoint.xs" class="mobile-footer">

                <div class="mx-auto d-flex flex-row my-1">
                  <div v-if="config.tou" class="mx-2 social-icon">
                    <a href="https://www.facebook.com/PropWealthau/" target="_blank">
                      <div class="float-left newsletter-logo mr-1">
                        <v-img :src="require('../../assets/facebook.svg')" alt="Facebook" contain height="24" width="24"
                          eager class="svg-filter-red">
                          <template v-slot:placeholder>
                            <v-row class="fill-height ma-0" align="center" justify="center">
                              <v-progress-circular indeterminate color="primary lighten-1"></v-progress-circular>
                            </v-row>
                          </template>
                        </v-img>
                      </div>
                    </a>
                  </div>
                  
                  <span v-if="config.tou && config.help"> | </span>
                  
                  <div v-if="config.tou" class="mx-2 social-icon">
                    <a href="https://www.instagram.com/propwealthau/" target="_blank">
                      <div class="float-left newsletter-logo mr-1">
                        <v-img :src="require('../../assets/instagram.svg')" alt="Instagram" contain height="24" width="24"
                          eager class="svg-filter-red">
                          <template v-slot:placeholder>
                            <v-row class="fill-height ma-0" align="center" justify="center">
                              <v-progress-circular indeterminate color="primary lighten-1"></v-progress-circular>
                            </v-row>
                          </template>
                        </v-img>
                      </div>
                    </a>
                    
                    <a class="d-none" href="https://suburbtrends.com/pages/terms-of-use" target="_parent">Terms of Use</a>
                  </div>

                  <span v-if="config.tou && config.help"> | </span>

                  <div v-if="config.tou" class="mx-2 social-icon">
                    <a href="https://www.linkedin.com/company/propwealth-au" target="_blank">
                      <div class="float-left newsletter-logo mr-1">
                        <v-img :src="require('../../assets/LinkedIn.svg')" alt="LinkedIn" class="svg-filter-red" contain height="24" width="24"
                          eager>
                          <template v-slot:placeholder>
                            <v-row class="fill-height ma-0" align="center" justify="center">
                              <v-progress-circular indeterminate color="primary lighten-1"></v-progress-circular>
                            </v-row>
                          </template>
                        </v-img>
                      </div>
                    </a>
                    
                    <a class="d-none" href="https://suburbtrends.com/pages/terms-of-use" target="_parent">Terms of Use</a>
                  </div>
                </div>

                
                  <div class="mx-auto d-flex flex-row my-1">



                  <div v-if="config.tou" class="mx-2 d-none">
                    <a href="https://www.suburbtrends.com/terms-of-use" target="_parent">Terms of Use</a>
                  </div>
                  <div v-if="config.help" class="mx-2 d-none">
                    <a href="https://www.suburbtrends.com/help" target="_parent">Help</a>
                  </div>
                  <div v-if="config.newsletter" class="mx-2 d-none">
                    <a href="https://www.linkedin.com/newsletters/suburbtrends-6878830644470919168/" target="_blank">
                      <div class="float-left newsletter-logo mr-1">
                        <v-img :src="require('../../assets/LinkedIn.svg')" alt="LinkedIn" contain height="16" width="16"
                          eager>
                          <template v-slot:placeholder>
                            <v-row class="fill-height ma-0" align="center" justify="center">
                              <v-progress-circular indeterminate color="primary lighten-1"></v-progress-circular>
                            </v-row>
                          </template>
                        </v-img>
                      </div>
                      <div class="d-inline">
                        Newsletter
                      </div>
                    </a>
                  </div>
                </div>
              </v-footer>

            </div>
          </v-card>

          <!-- Get Report Modal end -->
          <v-dialog v-model="reportDialog" max-width="739" max-height="516">
            <v-card rounded="xl">
                <v-card-title class="headline formtitle pr-4 d-flex justify-space-between align-center">
                  <p>Please share your details to download the report</p>
                  <v-btn class="closeicon formclose" icon @click="reportDialog = false">
                    <v-icon>{{ icons.close }}</v-icon>
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <v-form class="inputs-fields">
                    <!-- <v-alert type="info" outlined class="mb-4" dense>
                      We’ll text you a one-time code to verify your mobile.
                    </v-alert> -->
                    <v-text-field
                      v-model="fullName"
                      label="Full Name"
                      solo
                      dense
                      class="mb-4"
                      :error="errors.first_name ? true : false"
                      :error-messages="errors.first_name"
                      hint="Enter your name as it appears on your ID"
                      persistent-hint
                    ></v-text-field>
  
                    <v-row no-gutters class="mb-4">
                      <!-- Country Code Select -->
                      <v-col cols="3">
                        <v-select v-model="countryCode" :items="countryCodes" item-text="display" item-value="code"
                          label="Country" solo dense class="country-code-select"
                          :error="errors.mobile_number ? true : false">
                          <template v-slot:selection="{ item }">
                            <span class="flag-emoji">{{ item.flag }}</span>
                            <span class="ml-1">{{ item.code }}</span>
                          </template>
                          <template v-slot:item="{ item }">
                            <span class="flag-emoji">{{ item.flag }}</span>
                            <span class="ml-2">{{ item.display }}</span>
                          </template>
                        </v-select>
                      </v-col>
  
                      <!-- Mobile Number Input -->
                      <v-col cols="9">
                        <v-text-field
                          v-model="mobileNumber"
                          label="Mobile Number"
                          solo
                          dense
                          type="tel"
                          inputmode="numeric"
                          pattern="[0-9]*"
                          maxlength="15"
                          class="mobile-number-input"
                          :error="errors.mobile_number ? true : false"
                          :error-messages="errors.mobile_number"
                          @input="onMobileInput"
                          hint="Digits only, 6–15 characters. No spaces or symbols."
                          persistent-hint
                        ></v-text-field>
                      </v-col>
                    </v-row>
  
                    <!-- <v-text-field v-model="mobileNumber" label="Mobile Number" solo dense class="mb-4"
                      :error="errors.mobile_number ? true : false" :error-messages="errors.mobile_number"></v-text-field> -->
  
                    <v-text-field v-model="email" label="Email" solo dense :error="errors.email ? true : false"
                      :error-messages="errors.email" hint="We’ll send your report to this email" persistent-hint></v-text-field>
                  </v-form>
                </v-card-text>
  
                <v-card-actions class="d-flex flex-column align-center px-4 pb-4">
                  <div class="d-flex justify-center">
                    <v-btn color="#EE2E67" dark class="report-btn" @click="submitReport" :loading="submitLoading">
                      {{ submitLoading ? 'Submitting...' : 'Email Report To Me' }}
                    </v-btn>
                  </div>
  
                  <h1 class="text-caption submit-text mt-4 d-none">
                    Already submitted? <a href="#" @click.prevent="loginDialog = true">Log in</a>
                  </h1>
                </v-card-actions>
            </v-card>
          </v-dialog>


          <!-- <div class="d-flex flex-column align-center mt-6">
            <v-btn color="primary btn-color" class="mb-4" @click="handleGetReportClick">Get Report</v-btn>
          </div> -->

          <div class="d-flex flex-column align-center mt-6">
            <v-btn color="primary btn-color" class="mb-4" @click="handleGetReportClick" :loading="isDownloading"
              :disabled="isDownloading">
              Get Report
            </v-btn>
          </div>
          <!-- Get Report Modal end -->

          <!-- OTP Verification Dialog -->
          <v-dialog v-model="otpDialog" max-width="500" persistent>
            <v-card class="otp-verification-card p-4" style="border-radius: 20px; padding: 20px;">
              <v-card-title class=" otp-card-title d-flex justify-center position-relative">
                <div class="text-center">
                  <h2 class="otp-title">Verify Your Number</h2>
                  <p class="otp-subtitle mt-2" style="margin-bottom: 20px !important;">
                    We've sent a 6-digit code to<br>
                    <strong>{{ maskedMobileNumber }} and {{ email }}</strong>
                  </p>
                </div>
                <v-btn icon class="close-btn-otp" @click="closeOtpDialog">
                  <v-icon>&times;</v-icon>
                </v-btn>
              </v-card-title>

              <v-card-text class="px-6 pb-6">
                <v-form ref="otpForm" @submit.prevent="verifyOtp">
                  <div class="d-flex otp-inputs-container mb-6">
                    <v-text-field
                      v-for="(digit, index) in otpDigits"
                      :key="index"
                      :ref="`otpInput${index}`"
                      v-model="otpDigits[index]"
                      class="otp-digit-input"
                      outlined
                      dense
                      maxlength="1"
                      type="tel"
                      inputmode="numeric"
                      pattern="[0-9]"
                      @input="onOtpInput(index, $event)"
                      @keydown="onOtpKeydown(index, $event)"
                      @paste="onOtpPaste($event)"
                    ></v-text-field>
                  </div>

                  <div v-if="otpErrorMessage || (errors.otp && errors.otp.length)" class="mb-4">
                    <v-alert type="error" outlined dense class="otp-error-alert">
                      {{ otpErrorMessage || (errors.otp && errors.otp[0]) }}
                    </v-alert>
                  </div>

                  <div class="text-center mb-4">
                    <p class="resend-text mb-2">
                      Didn't receive the code?
                    </p>
                    <div v-if="resendTimer > 0">
                      <span class="resend-timer">Resend in {{ resendTimer }}s</span>
                    </div>
                    <div v-else>
                      <a href="#" class="resend-link" @click.prevent="resendOtp">
                        Resend Code
                      </a>
                    </div>
                  </div>

                  <div class="d-flex justify-center">
                    <v-btn
                      color="#EE2E67"
                      dark
                      class="verify-btn-otp"
                      @click="verifyOtp"
                      :loading="verifyLoading"
                      :disabled="!isOtpComplete || verifyLoading"
                    >
                      {{ verifyLoading ? 'Verifying...' : 'Verify Code' }}
                    </v-btn>
                  </div>
                </v-form>
              </v-card-text>
            </v-card>
          </v-dialog>

        </v-container>
      </v-main>

      <div v-if="selectedFeature" class="invisible-charts">
        <!-- House Trends Charts -->
        <LineChart v-if="selectedFeature['House Inventory']" ref="houseInventoryHidden" title="House Inventory"
          :data="selectedFeature['House Inventory']">
        </LineChart>

        <LineChart v-if="selectedFeature['House Listings']" ref="houseListingsHidden" title="House Listings"
          :data="selectedFeature['House Listings']">
        </LineChart>

        <LineChart v-if="selectedFeature['House Price']" ref="housePriceHidden" title="House Price"
          :data="selectedFeature['House Price']" format-y-price>
        </LineChart>

        <!-- Unit Trends Charts -->
        <LineChart v-if="selectedFeature['Unit Inventory']" ref="unitInventoryHidden" title="Unit Inventory"
          :data="selectedFeature['Unit Inventory']">
        </LineChart>

        <LineChart v-if="selectedFeature['Unit Listings']" ref="unitListingsHidden" title="Unit Listings"
          :data="selectedFeature['Unit Listings']">
        </LineChart>

        <LineChart v-if="selectedFeature['Unit Price']" ref="unitPriceHidden" title="Unit Price"
          :data="selectedFeature['Unit Price']" format-y-price>
        </LineChart>

        <!-- Rent Trends Charts -->
        <LineChart v-if="selectedFeature['House Rents']" ref="houseRentsHidden" title="House Rents"
          :data="selectedFeature['House Rents']" format-y-price>
        </LineChart>

        <LineChart v-if="selectedFeature['Unit Rents']" ref="unitRentsHidden" title="Unit Rents"
          :data="selectedFeature['Unit Rents']" format-y-price>
        </LineChart>

        <LineChart v-if="selectedFeature['Vacancy Rates']" ref="vacancyRatesHidden" title="Vacancy Rates"
          :data="selectedFeature['Vacancy Rates']">
        </LineChart>

        <!-- Price Segments Charts -->
        <BarChart v-if="selectedFeature['Unit Price Segments']" ref="unitPriceSegmentsHidden" color="#aa638c"
          title="Price segments units" :data="selectedFeature['Unit Price Segments']" format-y-percent>
        </BarChart>

        <BarChart v-if="selectedFeature['House Price Segments']" ref="housePriceSegmentsHidden" color="#91bf71"
          title="Price segments houses" :data="selectedFeature['House Price Segments']" format-y-percent>
        </BarChart>

        <!-- Elevation Chart -->
        <BarChart v-if="selectedFeature['Elevation']" ref="elevationHidden" title="SA1 regions by elevation"
          :data="elevationData" :options="{
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Elevation (meters above sea level)'
                }
              }
            }
          }">
        </BarChart>

        <!-- SEIFA Chart -->
        <BarChart v-if="selectedFeature['SEIFA']" ref="seifaHidden" title="Social Index Distribution"
          :data="selectedFeature['SEIFA']">
        </BarChart>
      </div>
    </v-app>
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import Swal from 'sweetalert2';
import html2canvas from 'html2canvas';

import '@fontsource/catamaran/latin-100.css'
import '@fontsource/catamaran/latin-300.css'
import '@fontsource/catamaran/latin-400.css'
import '@fontsource/catamaran/latin-500.css'
import '@fontsource/catamaran/latin-700.css'
import '@fontsource/catamaran/latin-900.css'

import { mdiClose, mdiLink, mdiAccount, mdiPhone, mdiChevronLeft, mdiChevronRight } from '@mdi/js'
import Fuse from 'fuse.js'
import bbox from '@turf/bbox'
import suburbsLocal from '../../../data/suburbs.json'
import statesLocal from '../../../data/states.json'
import LineChart from '@/components/LineChart'
import BarChart from '@/components/BarChart'
import ScoreRadarChart from '@/components/ScoreRadarChart.vue';
// import BannerAd from '@/components/BannerAd'
import Theme from '@/lib/Theme'

const sa1ElevationLegend = Theme.map.sa1ElevationFillColor
  .slice(3)
  .reduce((acc, cur, i, arr) => {
    if (i % 2 === 0) {
      acc.push([cur, arr[i + 1]])
    }
    return acc
  }, [])

const sa1SeifaLegend = Theme.map.sa1SeifaFillColor
  .slice(2, Theme.map.sa1SeifaFillColor.length - 1)
  .reduce((acc, cur, i, arr) => {
    if (i % 2 === 0) {
      acc.push([cur, arr[i + 1]])
    }
    return acc
  }, []);

const charts = [
  'House Inventory',
  'House Listings',
  'House Price',
  'House Rents',
  'Unit Inventory',
  'Unit Listings',
  'Unit Price',
  'Unit Rents',
  'Vacancy Rates',
  'HouseBA',
  'TownhouseBA',
  'UnitBA',
  'House Price Segments',
  'Unit Price Segments',
  'Summary'
]
const numberFormat = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  maximumFractionDigits: 0
})

const panelWidth = 475

function addPadding(...args) {
  return args
    .map(arg => {
      return Object.assign({
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      }, arg)
    })
    .reduce((acc, cur) => {
      return {
        left: acc.left + cur.left,
        right: acc.right + cur.right,
        top: acc.top + cur.top,
        bottom: acc.bottom + cur.bottom
      }
    })
}

mapboxgl.accessToken = 'pk.eyJ1Ijoic3VidXJidHJlbmRzIiwiYSI6ImNrb3huaWgzdjBmNmgydmxkMTFnaThvbHcifQ.Oy1kLL5CCXQcA2vxi7SaLg'

export default {
  name: 'App',

  components: {
    LineChart,
    BarChart,
    ScoreRadarChart
    // BannerAd
  },

  data: () => ({
    config: window.SuburbTrends,

    baseURL: `${window.location.origin}${window.location.pathname.replace(/[A-Za-z_-]*\.html/, '')}`,
    mapLoaded: false,
    mapIsLoaded: false, // Renamed to avoid conflict
    isloading: false,
    statesLocal,
    mapImage: null,
    SeifaImage: null,

    searchQuery: null,
    searchResults: [],
    // Make Fuse reactive so we can watch initialization
    fuse: null,

    selectedFeature: null,

    hoverPopup: null,

    // map style, options: map | satellite
    style: 'map',

    chartNotice: 'These charts are based on the region (Statistical Area 3). We find that for trends analysis, the Sa3 is more reliable than a suburb due to sample size and distribution.',

    icons: {
      close: mdiClose,
      link: mdiLink,
      person: mdiAccount,
      phone: mdiPhone,
      left: mdiChevronLeft,
      right: mdiChevronRight
    },

    tabs: [
      'Summary',
      'House Trends',
      'Unit Trends',
      'Rent Trends',
      'Price Segments',
      'Elevation',
      'Profiles'
    ],
    tab: 0,

    // initial bounds Australia wide
    initialBounds: [[112.533, -43.586], [154.545, -10.755]],

    // current map bounds
    bounds: null,

    states: {},

    // cached /api/suburb/ID data
    suburbData: {},
    suburbs: null,

    // fetch promises by suburb
    fetching: {},

    // suburbs with data
    data: {},

    popup: new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    }),

    // id of selected SAL
    selectedId: null,

    // name of selected SAL
    selectedName: null,

    sa1ElevationLegend,
    sa1SeifaLegend,

    startScroll: 0,
    startX: 0,


    // Coded by coder
    reportDialog: false,
    fullName: '',
    mobileNumber: '',
    email: '',

    // OTP verification data
    otpDialog: false,
    otpDigits: ['', '', '', '', '', ''],
    verifyLoading: false,
    resendTimer: 0,
    resendInterval: null,
    currentUserId: null,
    maskedMobileNumber: '',
    pendingAction: null, // 'email' or 'download'
    otpErrorMessage: '',

    selectedSuburbGeoJson: null,

    errors: {},
    // Add this new property
    isDownloading: false,
    submitLoading: false,
    suppressPersist: false,

    countryCode: '+61', // Default to Australia
    countryCodes: [
      { code: '+1', country: 'US', flag: '🇺🇸', display: '+1 (US)' },
      { code: '+1', country: 'CA', flag: '🇨🇦', display: '+1 (CA)' },
      { code: '+44', country: 'GB', flag: '🇬🇧', display: '+44 (UK)' },
      { code: '+61', country: 'AU', flag: '🇦🇺', display: '+61 (AU)' },
      { code: '+64', country: 'NZ', flag: '🇳🇿', display: '+64 (NZ)' },
      { code: '+91', country: 'IN', flag: '🇮🇳', display: '+91 (IN)' },
      { code: '+65', country: 'SG', flag: '🇸🇬', display: '+65 (SG)' },
      { code: '+60', country: 'MY', flag: '🇲🇾', display: '+60 (MY)' },
      { code: '+62', country: 'ID', flag: '🇮🇩', display: '+62 (ID)' },
      { code: '+63', country: 'PH', flag: '🇵🇭', display: '+63 (PH)' },
      { code: '+66', country: 'TH', flag: '🇹🇭', display: '+66 (TH)' },
      { code: '+84', country: 'VN', flag: '🇻🇳', display: '+84 (VN)' },
      { code: '+86', country: 'CN', flag: '🇨🇳', display: '+86 (CN)' },
      { code: '+81', country: 'JP', flag: '🇯🇵', display: '+81 (JP)' },
      { code: '+82', country: 'KR', flag: '🇰🇷', display: '+82 (KR)' },
      { code: '+49', country: 'DE', flag: '🇩🇪', display: '+49 (DE)' },
      { code: '+33', country: 'FR', flag: '🇫🇷', display: '+33 (FR)' },
      { code: '+39', country: 'IT', flag: '🇮🇹', display: '+39 (IT)' },
      { code: '+34', country: 'ES', flag: '🇪🇸', display: '+34 (ES)' },
      { code: '+31', country: 'NL', flag: '🇳🇱', display: '+31 (NL)' },
      { code: '+41', country: 'CH', flag: '🇨🇭', display: '+41 (CH)' },
      { code: '+46', country: 'SE', flag: '🇸🇪', display: '+46 (SE)' },
      { code: '+47', country: 'NO', flag: '🇳🇴', display: '+47 (NO)' },
      { code: '+45', country: 'DK', flag: '🇩🇰', display: '+45 (DK)' },
      { code: '+358', country: 'FI', flag: '🇫🇮', display: '+358 (FI)' },
      { code: '+7', country: 'RU', flag: '🇷🇺', display: '+7 (RU)' },
      { code: '+55', country: 'BR', flag: '🇧🇷', display: '+55 (BR)' },
      { code: '+52', country: 'MX', flag: '🇲🇽', display: '+52 (MX)' },
      { code: '+54', country: 'AR', flag: '🇦🇷', display: '+54 (AR)' },
      { code: '+56', country: 'CL', flag: '🇨🇱', display: '+56 (CL)' },
      { code: '+57', country: 'CO', flag: '🇨🇴', display: '+57 (CO)' },
      { code: '+27', country: 'ZA', flag: '🇿🇦', display: '+27 (ZA)' },
      { code: '+234', country: 'NG', flag: '🇳🇬', display: '+234 (NG)' },
      { code: '+254', country: 'KE', flag: '🇰🇪', display: '+254 (KE)' },
      { code: '+20', country: 'EG', flag: '🇪🇬', display: '+20 (EG)' },
      { code: '+971', country: 'AE', flag: '🇦🇪', display: '+971 (AE)' },
      { code: '+966', country: 'SA', flag: '🇸🇦', display: '+966 (SA)' },
      { code: '+880', country: 'BD', flag: '🇧🇩', display: '+880 (BD)' },
      { code: '+92', country: 'PK', flag: '🇵🇰', display: '+92 (PK)' },
      { code: '+94', country: 'LK', flag: '🇱🇰', display: '+94 (LK)' },
      { code: '+98', country: 'IR', flag: '🇮🇷', display: '+98 (IR)' },
      { code: '+90', country: 'TR', flag: '🇹🇷', display: '+90 (TR)' },
      { code: '+972', country: 'IL', flag: '🇮🇱', display: '+972 (IL)' },
      { code: '+212', country: 'MA', flag: '🇲🇦', display: '+212 (MA)' }
    ],

  }),

  async created() {
    await this.fetchData();
    this.fetchStatus();

    setTimeout(() => {
      if (this.suburbs && this.suburbs.features) {
        this.fuse = new Fuse(this.suburbs.features, {
          keys: ['properties.name']
        });
      }
      this.isloading = false;
    }, 5000);

    this.bounds = this.initialBounds;

    // Authentication removed - no sessionStorage loading needed

  },


  mounted() {
    // Add global error handlers for debugging
    window.addEventListener('error', (event) => {
      console.error('😱 Global error caught:', event.error);
      console.error('😱 Global error message:', event.message);
      console.error('😱 Global error filename:', event.filename);
      console.error('😱 Global error line:', event.lineno);
      console.error('😱 Global error stack:', event.error ? event.error.stack : 'no stack');
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('😱 Unhandled promise rejection:', event.reason);
      console.error('😱 Promise rejection type:', typeof event.reason);
      if (event.reason && event.reason.message) {
        console.error('😱 Promise rejection message:', event.reason.message);
      }
      if (event.reason && event.reason.stack) {
        console.error('😱 Promise rejection stack:', event.reason.stack);
      }
    });
    
    // Prefill saved user details on mount
    this.prefillFromLocalStorage();
    
    // Expose Vue instance for debugging
    window.vueApp = this;
    
    window.map = this.map = new mapboxgl.Map({
      container: 'suburbtrends-map',
      style: 'mapbox://styles/suburbtrends/cl6n6f3ra002714odwlc4juvn', // SuburbTrends v3
      center: [132.1330642, -25.6096439],
      zoom: 3,
      hash: false,
      bounds: this.bounds,
      fitBoundsOptions: this.fitBoundsOptions(),
      minZoom: 3,
      maxZoom: 18,
      maxPitch: 0,
      logoPosition: 'bottom-right',
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      touchZoomRotate: true, // later rotation is disabled, leaving touch zoom only
      preserveDrawingBuffer: true // ✅ Needed for toDataURL
    })

    if (this.$vuetify.breakpoint.xs) {
      this.map.setPadding({
        top: 98
      })
    }

    // duplicate logo to the bottom left
    this.map.addControl(this.map._logoControl, 'bottom-left')

    this.map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right')

    // disable touch rotate leaving touch zoom in tact
    this.map.touchZoomRotate.disableRotation();

    this.map.on('idle', () => {
      this.mapLoaded = true;
    });


    this.map.on('load', () => {
      this.hoverPopup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      })

      this.map.addLayer({
        id: 'sal',
        source: 'composite',
        'source-layer': 'SAL',
        type: 'fill',
        paint: {
          'fill-color': Theme[this.style].salFillColor,
          'fill-opacity': Theme[this.style].salFillOpacity
        }
      }, `${this.style}-tunnel-path`)

      this.map.addLayer({
        id: 'sa1-elevation',
        source: 'composite',
        'source-layer': 'SA1',
        type: 'fill',
        paint: {
          'fill-color': Theme[this.style].sa1ElevationFillColor,
          'fill-opacity': Theme[this.style].sa1ElevationFillOpacity
        },
        layout: {
          'visibility': 'none'
        }
      }, 'sal')

      this.map.addLayer({
        id: 'sa1-seifa',
        source: 'composite',
        'source-layer': 'SA1',
        type: 'fill',
        paint: {
          'fill-color': Theme[this.style].sa1SeifaFillColor,
          'fill-opacity': Theme[this.style].sa1SeifaFillOpacity
        },
        layout: {
          'visibility': 'none'
        }
      }, 'sal')

      this.map.on('mousemove', 'sa1-elevation', e => {
        if (e && e.features && e.features.length && this.selectedFeature && this.selectedFeature.Elevation) {
          const sa1Id = e.features[0].id;
          const ele = this.selectedFeature.Elevation[sa1Id];
          if (ele) {
            this.hoverPopup
              .setLngLat(e.lngLat)
              .setHTML(`${ele.min}m - ${ele.max}m`)
              .addTo(this.map)
          } else {
            this.hoverPopup.remove()
          }
        }
      })

      this.map.on('mouseleave', 'sa1-elevation', () => {
        this.hoverPopup.remove()
      })

      this.map.on('mousemove', 'sa1-seifa', e => {
        if (e && e.features && e.features.length && this.selectedFeature && this.selectedFeature.Sa1Socio) {
          const sa1Id = e.features[0].id
          const rank = this.selectedFeature.Sa1Socio[sa1Id]
          if (rank) {
            this.hoverPopup
              .setLngLat(e.lngLat)
              .setHTML(`SEIFA Rank ${rank}`)
              .addTo(this.map)
          } else {
            this.hoverPopup.remove()
          }
        }
      })
      this.map.on('mouseleave', 'sa1-seifa', () => {
        this.hoverPopup.remove()
      })

      this.map.addLayer({
        id: 'sa1-outline',
        source: 'composite',
        'source-layer': 'SA1',
        type: 'line',
        paint: {
          'line-color': Theme[this.style].sa1OutlineColor,
          'line-width': 2,
          'line-offset': 1,
          'line-opacity': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            1,
            0
          ]
        }
      })
      this.map.addLayer({
        id: 'sal-selected-outline',
        source: 'composite',
        'source-layer': 'SAL',
        type: 'line',
        paint: {
          'line-color': Theme[this.style].salSelectedOutlineColor,
          'line-width': 4,
          'line-offset': 2,
          'line-opacity': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            1,
            0
          ]
        }
      })
      this.map.addLayer({
        id: 'sal-hover-outline',
        source: 'composite',
        'source-layer': 'SAL',
        type: 'line',
        paint: {
          'line-color': Theme[this.style].salHoverOutlineColor,
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            2,
            0.5
          ],
          'line-offset': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            1,
            0
          ],
          'line-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            1,
            0.25
          ]
        }
      }, 'sal-selected-outline')

      this.map.addLayer({
        id: 'sal-label',
        source: 'composite',
        'source-layer': 'SAL_label',
        type: 'symbol',
        paint: {
          'text-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            1,
            0
          ],
          'text-color': Theme[this.style].salLabelTextColor,
          'text-halo-width': 2,
          'text-halo-color': Theme[this.style].salLabelTextHaloColor
        },
        layout: {
          'text-field': ['to-string', ['get', 'name']],
          'text-font': ['Catamaran Regular', 'Arial Unicode MS Regular'],
          'text-size': 24
        }
      })

      /*
      this.map.addLayer({
        id: 'sa1-label',
        source: 'composite',
        'source-layer': 'SA1',
        type: 'symbol',
        paint: {
          'text-color': Theme[this.style].salLabelTextColor,
          'text-halo-width': 2,
          'text-halo-color': Theme[this.style].salLabelTextHaloColor
        },
        layout: {
          'text-field': ['to-string', ['id']],
          'text-font': ['Catamaran Regular', 'Arial Unicode MS Regular'],
          'text-size': 14
        }
      })
      */

      this.map.on('click', 'sal', e => {
        const selectedId = e.features[0].id
        if (selectedId in this.data) {
          this.selectedId = selectedId
        }
      })

      this.map.on('mousemove', 'sal', e => {
        if (e.features.length > 0) {
          if (this.hoverId !== null && this.hoverId !== undefined) {
            this.map.setFeatureState({
              source: 'composite',
              sourceLayer: 'SAL',
              id: this.hoverId
            }, {
              hover: false
            })
            this.map.setFeatureState({
              source: 'composite',
              sourceLayer: 'SAL_label',
              id: this.hoverId
            }, {
              hover: false
            })
          }

          const hoverId = e.features[0].id
          if (hoverId in this.data) {
            this.hoverId = hoverId

            this.map.setFeatureState({
              source: 'composite',
              sourceLayer: 'SAL',
              id: this.hoverId
            }, {
              hover: true
            })
            this.map.setFeatureState({
              source: 'composite',
              sourceLayer: 'SAL_label',
              id: this.hoverId
            }, {
              hover: true
            })
            this.map.getCanvas().style.cursor = 'pointer'

            if (this.map.getZoom() > 10) {
              this.fetchSuburb(this.hoverId)
            }
          } else {
            this.map.getCanvas().style.cursor = ''
            if (this.hoverPopup) {
              this.hoverPopup.setText('')
              this.hoverPopup.addClassName('hidden')
            }
          }
        }
      })
      this.map.on('mouseleave', 'sal', () => {
        if (this.hoverId !== null && this.hoverId !== undefined) {
          this.map.setFeatureState({
            source: 'composite',
            sourceLayer: 'SAL',
            id: this.hoverId
          }, {
            hover: false
          })
          this.map.setFeatureState({
            source: 'composite',
            sourceLayer: 'SAL_label',
            id: this.hoverId
          }, {
            hover: false
          })
          this.map.getCanvas().style.cursor = ''
        }
      })

      if (this.config.layers.Infrastructure) {
        this.fetchInfrastructure().then(features => {
          this.map.addSource('infrastructure', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: features.map(feature => {
                return {
                  type: 'Feature',
                  properties: {
                    State: feature.State,
                    'Project Name': feature['Project Name'],
                    'Website': feature.Website,
                    'Suburb': feature.Suburb,
                    'Postcode': feature.Postcode,
                    'Code': feature['Code (SSC)']
                  },
                  geometry: {
                    type: 'Point',
                    coordinates: [feature.Long, feature.Lat]
                  }
                }
              })
            }
          })
          this.map.addLayer({
            id: 'infrastructure',
            type: 'circle',
            source: 'infrastructure',
            paint: {
              'circle-color': 'blue',
              'circle-stroke-color': 'white',
              'circle-stroke-width': 2
            }
          })

          this.map.on('mouseenter', 'infrastructure', e => {
            this.map.getCanvas().style.cursor = 'pointer'

            const description = e.features[0].properties['Project Name']
            /*
            let description = ''
            const keyWhitelist = ['Project Name'];
            for (const [key, value] of Object.entries(e.features[0].properties)) {
              if (keyWhitelist.includes(key)) {
                description += `<b>${key}</b>: ${value}<br>`
              }
            }
            */

            // Populate the popup and set its coordinates
            // based on the feature found.
            this.popup
              .setLngLat(e.features[0].geometry.coordinates)
              .setHTML(description)
              .addTo(this.map)
          })
          this.map.on('mouseleave', 'infrastructure', () => {
            this.map.getCanvas().style.cursor = ''
            this.popup.remove()
          })
          this.map.on('click', 'infrastructure', e => {
            window.open(e.features[0].properties.Website, '_blank').focus()
          })
        })
      }

      this.mapLoaded = true
    })

  },

  methods: {
    fetchStatus: function () {
      const apiUrl = process.env.VUE_APP_API_URL;
      const primary = `${apiUrl}/suburbs-state`;
      const fallback = `/api/suburbs-state`;

      fetch(primary)
        .then(res => (res && res.ok) ? res : fetch(fallback))
        .then(res => res.json())
        .then(data => {
          // Check the GeoJSON format
          if (!data) {
            console.error('Invalid GeoJSON format');
            return;
          }

          this.states = data;
        })
        .catch(err => {
          console.error('Failed to fetch suburbs:', err);
          // Fallback to local states for offline/dev mode
          try {
            if (statesLocal) {
              this.states = statesLocal;
            }
          } catch (e) {
            console.error('Failed to load local states data:', e);
          }
        });
    },

    /*fetchData: function () {
      this.isloading = true;
      const apiUrl = process.env.VUE_APP_API_URL;
      const primary = `${apiUrl}/suburbs-data`;
      const fallback = `/api/suburbs-data`;

      fetch(primary)
        .then(res => (res && res.ok) ? res : fetch(fallback))
        .then(res => res.json())
        .then(data => {
          // Prefer API, but robustly fallback to local suburbs when invalid/empty
          if (!data || data.type !== 'FeatureCollection' || !Array.isArray(data.features) || data.features.length === 0) {
            console.warn('Invalid or empty GeoJSON from API; using local suburbs fallback.');
            if (suburbsLocal && suburbsLocal.type === 'FeatureCollection' && Array.isArray(suburbsLocal.features)) {
              this.suburbs = suburbsLocal;
            } else {
              throw new Error('Local suburbs fallback missing or invalid.');
            }
          } else {
            this.suburbs = data;
          }

          // Initialize Fuse immediately when suburbs data is available
          try {
            if (this.suburbs && this.suburbs.features && Array.isArray(this.suburbs.features)) {
              this.fuse = new Fuse(this.suburbs.features, { keys: ['properties.name'] });
            } else {
              console.warn('Suburbs features missing; search will be disabled.');
            }
          } catch (e) {
            console.error('Failed to initialize search index (Fuse):', e);
          }

          if (data) {
            this.fetchSuburbs();

            setTimeout(() => {
              this.isloading = false;
            }, 5000);
          }
        })
        .catch(err => {
          console.error('Failed to fetch suburbs:', err);
          // Fallback to local suburbs for offline/dev mode
          try {
            if (suburbsLocal && suburbsLocal.type === 'FeatureCollection') {
              this.suburbs = suburbsLocal;
              if (this.suburbs && this.suburbs.features && Array.isArray(this.suburbs.features)) {
                this.fuse = new Fuse(this.suburbs.features, { keys: ['properties.name'] });
              }
              // Still populate suburb keys/state mapping locally
              this.fetchSuburbs();
              setTimeout(() => {
                this.isloading = false;
              }, 1000);
            }
          } catch (e) {
            console.error('Failed to load local suburbs data:', e);
          }
        });
    },
    */
     
    fetchData: function () {
  this.isloading = true;

  try {
    if (suburbsLocal && suburbsLocal.type === 'FeatureCollection' && Array.isArray(suburbsLocal.features)) {
      // Always use the local dataset
      this.suburbs = suburbsLocal;

      // Initialize Fuse with local data
      this.fuse = new Fuse(this.suburbs.features, { keys: ['properties.name'] });

      console.log('✅ Using local suburbs data only:', this.suburbs.features.length, 'items');
    } else {
      throw new Error('❌ Local suburbs data missing or invalid.');
    }

    // Initialize other related data
    this.fetchSuburbs();

  } catch (e) {
    console.error('Failed to load local suburbs data:', e);
  } finally {
    setTimeout(() => {
      this.isloading = false;
    }, 1000);
  }
},

    touchStart: function (e) {
      this.startX = e.touchstartX
      this.startScroll = this.$refs.tabs.$el.getElementsByClassName('v-slide-group__wrapper')[0].scrollLeft
    },
    touchMove: function (e) {
      const scrollLeft = this.startScroll + this.startX - e.touchmoveX
      this.$refs.tabs.$el.getElementsByClassName('v-slide-group__wrapper')[0].scrollLeft = scrollLeft
    },
    selectResult: function (id) {
      this.selectedId = id
      this.searchQuery = null
    },
    prevTab: function () {
      this.tab = Math.max(this.$vuetify.breakpoint.xs ? 0 : 1, this.tab - 1)
    },
    nextTab: function () {
      this.tab = Math.min((this.tabs.length + 1) - 1, this.tab + 1);
    },
    scrollTabs: function (e) {
      e.preventDefault() // stop scrolling page

      // allow scrolling either vertically or horizontally
      this.$refs.tabs.$el.getElementsByClassName('v-slide-group__wrapper')[0].scrollLeft += e.deltaY + e.deltaX
    },
    fetchInfrastructure: function () {

      const path = process.env.VUE_APP_API_URL;
      const primary = `${path}/proxy-infrastructure`;
      const fallback = `/api/proxy-infrastructure`;

      return fetch(primary)
        .then(res => (res && res.ok) ? res : fetch(fallback))
        .then(res => res.json())
    },

    fetchSuburbs: function () {
      const path = process.env.VUE_APP_API_URL;
      const primary = `${path}/proxy-suburbs`;
      const fallback = `/api/proxy-suburbs`;
      fetch(primary)
        .then(res => (res && res.ok) ? res : fetch(fallback))
        .then(res => res.json())
        .then(data => {
          this.data = Object.fromEntries(data.map(key => [key, {}]))
          // console.log(this.data);

          for (const suburb of this.suburbs.features) {
            if (suburb.id in this.data && suburb.properties.state) {
              this.data[suburb.id] = {
                State: suburb.properties.state
              }
            }
          }
        })
        .catch(err => {
          console.warn('Failed to fetch suburb keys; using local features for state mapping.', err)
          // Build data from local features to keep search usable
          if (this.suburbs && this.suburbs.features) {
            this.data = {}
            for (const suburb of this.suburbs.features) {
              if (suburb && suburb.id) {
                this.data[suburb.id] = { State: suburb.properties.state }
              }
            }
          }
        })
    },

    fetchSuburb: function (id) {
      const path = process.env.VUE_APP_API_URL;
      const primaryBase = `${path}/proxy-suburb`;
      const fallbackBase = `/api/proxy-suburb`;

      if (id in this.suburbData) {
        return Promise.resolve()
      } else {
        if (this.fetching[id]) {
          return this.fetching[id]
        } else {
          this.fetching[id] = fetch(`${primaryBase}/${id}`)
            // res.json()
            .then(res => (res && res.ok) ? res : fetch(`${fallbackBase}/${id}`))
            .then(res => res.json())
            .then(data => {
              console.log("data", data);

              if ('House Price Segments' in data) {
                for (const [key, value] of Object.entries(data['House Price Segments'])) {
                  if (value && typeof value === 'string' && value.endsWith('%')) {
                    data['House Price Segments'][key] = value.replace(/%$/, '') / 100
                  }
                }
              }
              if ('Unit Price Segments' in data) {
                for (const [key, value] of Object.entries(data['Unit Price Segments'])) {
                  if (value && typeof value === 'string' && value.endsWith('%')) {
                    data['Unit Price Segments'][key] = value.replace(/%$/, '') / 100
                  }
                }
              }

              this.suburbData[id] = data
              // console.log('Scores from API:', this.suburbData[id]?.Scores);
              this.fetching[id] = null
              return data;
            })
            .catch(error => {
              console.error('Error fetching suburb data:', error);
              this.fetching[id] = null;

              // Detailed error popup
              Swal.fire({
                icon: 'error',
                title: 'Oops! Something went wrong',
                html: `
                      <p><strong>Failed to load suburb data</strong></p>
                      <p class="text-sm text-gray-600">${this.getErrorMessage(error)}</p>
                      <p class="text-xs text-gray-500 mt-2">Suburb ID: ${id}</p>
                    `,
                confirmButtonText: 'Retry',
                confirmButtonColor: "#3085d6",
                showCancelButton: true,
                cancelButtonText: 'Cancel',
                cancelButtonColor: "#d33",
                showCloseButton: true,
                allowOutsideClick: false
              }).then((result) => {
                if (result.isConfirmed) {
                  this.fetchSuburb(id);
                }
              });
            })
          return this.fetching[id];

        }
      }
    },

    // Helper method to get user-friendly error messages
    getErrorMessage: function (error) {
      if (error.message.includes('HTTP 404')) {
        return 'Suburb data not found. This suburb may not be available in our database.';
      } else if (error.message.includes('HTTP 500')) {
        return 'Server error occurred. Please try again later.';
      } else if (error.message.includes('HTTP 403')) {
        return 'Access denied. You may not have permission to view this data.';
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return 'Network connection failed. Please check your internet connection and try again.';
      } else if (error.message.includes('Invalid data')) {
        return 'Invalid data received from server. Please try again.';
      } else {
        return 'An unexpected error occurred. Please try again later.';
      }
    },


    setStyle: function (style, prevStyle) {
      for (const layer of this.map.getStyle().layers) {
        if (layer.id.startsWith(style)) {
          this.map.setLayoutProperty(layer.id, 'visibility', 'visible')
        }
        if (prevStyle && layer.id.startsWith(prevStyle)) {
          this.map.setLayoutProperty(layer.id, 'visibility', 'none')
        }
      }
      this.map.moveLayer('sal', `${style}-tunnel-path`)
      this.map.moveLayer('sa1-elevation', 'sal')
      this.map.setPaintProperty('sal-hover-outline', 'line-color', Theme[style].salHoverOutlineColor)

      this.map.setPaintProperty('sal', 'fill-color', Theme[style].salFillColor)
      this.map.setPaintProperty('sal', 'fill-opacity', Theme[style].salFillOpacity)
      this.map.setPaintProperty('sal-label', 'text-color', Theme[style].salLabelTextColor)
      this.map.setPaintProperty('sal-label', 'text-halo-color', Theme[style].salLabelTextHaloColor)
    },
    format: function (value, format) {
      if (format && format === 'price') {
        return typeof value === 'string' && value.startsWith('$') ? value : (
          value ? numberFormat.format(value) : '-'
        )
      } else if (format && format === 'percent') {
        return `${Math.round(value * 100)}%`
      } else {
        return value
      }
    },
    sentenceCase: function (text) {
      return text && typeof text === 'string' ? (text.charAt(0).toUpperCase() + text.slice(1)) : text
    },
    clearSelected: function () {
      this.selectedId = null
    },
    suburbSearch: function (query) {
      const safeQuery = (query || '').trim()
      if (!safeQuery || !this.fuse) {
        return []
      }

      const results = this.fuse.search(safeQuery, { threshold: 0.4 })

      return results.slice(0, 5).map(result => {
        const item = result.item
        item.place_name = `${item.properties.name}, ${item.properties.state}`

        try {
          // Prefer existing bbox; otherwise compute from geometry
          let bb = Array.isArray(item.bbox) && item.bbox.length === 4 ? item.bbox : null
          if (!bb && item.geometry) {
            // Use turf bbox for robust calculation
            bb = bbox(item)
          }
          if (bb && bb.length === 4) {
            item.center = [
              (bb[0] + bb[2]) / 2,
              (bb[1] + bb[3]) / 2,
            ]
          }
        } catch (e) {
          // Keep search working even if center can’t be computed
          console.warn('Search result center calculation failed:', e)
        }
        return item
      })
    },

    fitBoundsOptions: function () {
      return {
        duration: 1000,
        padding: this.padding()
      }
    },
    padding: function () {
      const mapRect = this.$refs.suburbTrendsMap ? this.$refs.suburbTrendsMap.getBoundingClientRect() : { height: 0, width: 0 }

      // map size less UI elements
      const mapHeight = mapRect.height
      const mapWidth = mapRect.width - (this.selectedId ? panelWidth : 0)

      const paddingY = Math.floor(mapHeight * 0.1)
      const paddingX = Math.floor(mapWidth * 0.1)

      const deviceDependentPadding = {
        top: paddingY,
        bottom: paddingY,
        left: paddingX,
        right: paddingX
      }

      const padding = addPadding(
        this.$vuetify.breakpoint.xs ? {} : { left: this.selectedId ? panelWidth : 0 },
        deviceDependentPadding
      )

      const constrainedPadding = {
        top: Math.max(padding.top, 0),
        bottom: Math.max(padding.bottom, 0),
        right: Math.max(padding.right, 0),
        left: Math.max(padding.left, 0),
      }

      return constrainedPadding
    },


    // Coded by coder
    async handleGetReportClick() {

      if (!this.selectedFeature) {
        Swal.fire({
          icon: 'warning',
          title: 'Missing Location',
          text: 'Please select your location from the map.',
          confirmButtonColor: '#EE2E67',
          customClass: { confirmButton: 'swal-btn' }
        });
        return;
      }
      this.tab=7;
      this.mapImage = await this.captureMapForSuburb();
      this.SeifaImage = await this.captureSeifaSection();
      // console.log('SEIFA chart captured:', seifa);


      // Authentication removed - show report form directly
      // Prefill from localStorage if available
      try {
        const saved = JSON.parse(localStorage.getItem('reportUserInfo') || '{}');
        if (saved) {
          this.fullName = saved.fullName || this.fullName || '';
          this.email = saved.email || this.email || '';
          this.countryCode = saved.countryCode || this.countryCode || (this.countryCodes?.[0]?.code || '');
          this.mobileNumber = saved.mobileNumber || this.mobileNumber || '';
        }
      } catch (e) {
        console.warn('Failed to read reportUserInfo from localStorage:', e);
      }
      this.reportDialog = true;
    },

    handleFeatureSelected(feature) {
      this.selectedFeature = feature;
      this.reportDialog = true;
      this.getFeatureDataFromApi(feature);
    },

    async getFeatureDataFromApi(feature) {
      const suburbName = feature.SuburbData.Suburb;
      const postcode = feature.SuburbData.Postcode;
      const state = feature.SuburbData.State;

      const statsEndpoint = `${process.env.VUE_APP_API_URL}/suburb/report`;
      // console.log(statsEndpoint);


      try {
        const statsResponse = await fetch(statsEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ suburb: suburbName, postcode, state })
        });

        if (!statsResponse.ok) {
          throw new Error("Failed to fetch suburb data.");
        }

        const statsData = await statsResponse.json();

        this.selectedFeature.SuburbData = statsData.SuburbData;
        this.selectedFeature.Banner = statsData.Banner;
        this.selectedFeature.Summary = statsData.Summary;
      } catch (error) {
        console.error('Error fetching suburb data:', error);
        this.reportDialog = false;
        Swal.fire({
          icon: 'error',
          title: 'API Error',
          text: 'Failed to retrieve suburb data. Please try again later.',
          confirmButtonColor: '#EE2E67',
          customClass: { confirmButton: 'swal-btn' }
        });
      } finally {
        this.reportLoading = false;
      }
    },

    async captureMap() {
      // Ensure the Mapbox map instance exists and is loaded
      if (!this.map || !this.mapLoaded) {
        console.warn('Mapbox map instance is not available or not loaded.');
        return null;
      }

      // Use the Mapbox function to get the canvas image data
      const mapCanvas = this.map.getCanvas();
      // console.log(mapCanvas);

      try {
        const imageDataURL = mapCanvas.toDataURL('image/png');
        return imageDataURL;
      } catch (error) {
        console.error('Error getting map image data from canvas:', error);
        return null;
      }
    },

    async downloadChart(refName, fileName = 'chart.png') {
      const chartImage = await this.captureChartByRef(refName);

      if (chartImage) {
        const link = document.createElement('a');
        link.href = chartImage;
        link.download = fileName;
        link.click();

        // console.log(chartImage);

        return chartImage;

      } else {
        console.warn(`No image generated for chart: ${refName}`);
      }
    },

    async captureChartByRef(refName) {
  const hiddenRefMap = {
    'houseInventory': 'houseInventoryHidden',
    'houseListings': 'houseListingsHidden',
    'housePrice': 'housePriceHidden',
    'houseRents': 'houseRentsHidden',
    'unitInventory': 'unitInventoryHidden',
    'unitListings': 'unitListingsHidden',
    'unitPrice': 'unitPriceHidden',
    'unitRents': 'unitRentsHidden',
    'vacancyRates': 'vacancyRatesHidden',
    'housePriceSegments': 'housePriceSegmentsHidden',
    'unitPriceSegments': 'unitPriceSegmentsHidden',
    'Elevation': 'elevationHidden',
    'SEIFA': 'seifaHidden'
  };

  const targetRef = hiddenRefMap[refName] || refName;

  await this.$nextTick();
  const chartComponent = this.$refs[targetRef];

  if (!chartComponent) {
    console.log(`Chart component with ref '${targetRef}' not found.`);
    return null;
  }

  const canvas = chartComponent.$refs.canvas;
  // const ctx = canvas.getContext("2d");

  const tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = canvas.width;
  tmpCanvas.height = canvas.height;
  const tmpCtx = tmpCanvas.getContext("2d");

  // White background so JPEG doesn't look transparent/noisy
  tmpCtx.fillStyle = "#ffffff";
  tmpCtx.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);
  tmpCtx.drawImage(canvas, 0, 0);

  // ✅ Save as JPEG at 60% quality
  const imgData = tmpCanvas.toDataURL("image/jpeg", 0.6);

  // ✅ Optional auto-download
  // const link = document.createElement("a");
  // link.href = imgData;
  // link.download = `${refName}.jpg`;
  // link.click();

  return imgData;
},

async captureSeifaSection() {
  try {
    const el = this.$refs.seifaCaptureArea;
    if (!el) throw new Error("SEIFA capture element not found");

    const canvas = await html2canvas(el, { scale: 2 });
    const img = canvas.toDataURL("image/png");

    // ---- DOWNLOAD IMAGE ----
    // const link = document.createElement("a");
    // link.href = img;
    // link.download = `SEIFA-Chart-${Date.now()}.png`; // dynamic filename
    // link.click();
    // ------------------------

    return img; // if you still want the data for PDF usage
  } catch (err) {
    console.error("Error capturing SEIFA graph:", err);
  }
},

    // async captureChartByRef(refName) {
    //   const hiddenRefMap = {
    //     'houseInventory': 'houseInventoryHidden',
    //     'houseListings': 'houseListingsHidden',
    //     'housePrice': 'housePriceHidden',
    //     'houseRents': 'houseRentsHidden',
    //     'unitInventory': 'unitInventoryHidden',
    //     'unitListings': 'unitListingsHidden',
    //     'unitPrice': 'unitPriceHidden',
    //     'unitRents': 'unitRentsHidden',
    //     'vacancyRates': 'vacancyRatesHidden',
    //     'housePriceSegments': 'housePriceSegmentsHidden',
    //     'unitPriceSegments': 'unitPriceSegmentsHidden',
    //     'Elevation': 'elevationHidden',
    //     'SEIFA': 'seifaHidden'
    //   };

    //   // Use hidden chart ref if available, otherwise fall back to visible one
    //   const targetRef = hiddenRefMap[refName] || refName;

    //   await this.$nextTick();
    //   const chartComponent = this.$refs[targetRef];

    //   if (!chartComponent && chartComponent === undefined) {
    //     console.log(`Chart component with ref '${targetRef}' not found.`);
    //     return null;
    //   }

    //   const canvas = chartComponent.$refs.canvas;
    //   return canvas.toDataURL('image/png');
    // },


    async captureMapForSuburb(bounds) {
  console.log('Capturing map for bounds:', bounds);

  if (!this.mapLoaded) {
    console.warn('Map is not loaded yet.');
    return null;
  }

  const mapElement = this.$refs.suburbTrendsMap;
  if (!mapElement) {
    console.error('Map element not found.');
    return null;
  }

  try {
    // STEP 1: Wait for map tiles to load
    const tiles = mapElement.querySelectorAll('img');
    await Promise.all(
      Array.from(tiles).map(img =>
        img.complete
          ? Promise.resolve()
          : new Promise(resolve => {
              img.onload = resolve;
              img.onerror = resolve;
            })
      )
    );

    console.log('✅ All map tiles have loaded.');
    await new Promise(resolve => setTimeout(resolve, 300));

    // STEP 2: Capture full map
    const fullCanvas = await html2canvas(mapElement, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
    });

    // STEP 3: Crop from left/right
    const cropPercent = 0.15;
    const cropX = fullCanvas.width * cropPercent;
    const cropWidth = fullCanvas.width * (1 - cropPercent * 2);
    const cropHeight = fullCanvas.height;

    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;

    const ctx = croppedCanvas.getContext('2d');
    ctx.drawImage(
      fullCanvas,
      cropX, 0, cropWidth, cropHeight,
      0, 0, cropWidth, cropHeight
    );

    // ==== ✅ Compress to MAX 100 KB ====
    let quality = 1.0;
    let dataURL = croppedCanvas.toDataURL("image/jpeg", quality);
    const maxBytes = 100 * 1024; // 100 KB

    while ((dataURL.length * 0.75) > maxBytes && quality > 0.1) {
      quality -= 0.1;
      dataURL = croppedCanvas.toDataURL("image/jpeg", quality);
      console.log(`🔄 Compressing... Quality: ${quality.toFixed(2)}, Size: ${(dataURL.length*0.75/1024).toFixed(2)} KB`);
    }

    const finalSizeKB = (dataURL.length * 0.75 / 1024).toFixed(2);
    console.log(`✅ Final image: ${finalSizeKB} KB (Quality: ${quality.toFixed(2)})`);

    // OPTIONAL auto-download
    // const a = document.createElement("a");
    // a.href = dataURL;
    // a.download = `map-${Date.now()}.jpg`;
    // a.click();

    return dataURL;

  } catch (err) {
    console.error("❌ Error capturing map canvas:", err);
    return null;
  }
},

    submitReport: async function () {
      this.errors = {};

      if (!this.selectedFeature) {
        Swal.fire({
          icon: 'warning',
          title: 'Location Not Selected',
          text: 'Please select a location before submitting a report.',
          confirmButtonColor: '#EE2E67',
          customClass: {
            confirmButton: 'swal-btn'
          }
        }).then(() => {
          window.location.reload();
        });
        return;
      }

      // Update basic validation check to include mobileNumber
      if (!this.fullName || !this.email || !this.mobileNumber || !this.countryCode) {
        Swal.fire({
          icon: 'warning',
          title: 'Missing Fields',
          text: 'Please fill out all required fields.',
          confirmButtonColor: '#EE2E67',
          customClass: {
            confirmButton: 'swal-btn'
          }
        });
        return;
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Email',
          text: 'Please enter a valid email address.',
          confirmButtonColor: '#EE2E67',
          customClass: { confirmButton: 'swal-btn' }
        });
        return;
      }

      // Full name minimal length
      if (this.fullName.trim().length < 2) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Name',
          text: 'Full name must be at least 2 characters.',
          confirmButtonColor: '#EE2E67',
          customClass: { confirmButton: 'swal-btn' }
        });
        return;
      }

      const mobileNumberRegex = /^\d+$/;
      if(!mobileNumberRegex.test(this.mobileNumber)) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Input',
          text: 'Mobile number can only contain digits (0-9).',
          confirmButtonColor: '#EE2E67',
          customClass: {
            confirmButton: 'swal-btn'
          }
        });
        return;
      }
      
      // Validate mobile number length based on country code
      if (this.countryCode === '+91') {
        // Indian mobile numbers should be exactly 10 digits
        if (this.mobileNumber.length !== 10) {
          Swal.fire({
            icon: 'error',
            title: 'Invalid Mobile Number',
            text: 'Indian mobile numbers must be exactly 10 digits.',
            confirmButtonColor: '#EE2E67',
            customClass: {
              confirmButton: 'swal-btn'
            }
          });
          return;
        }
        // Check if starts with valid Indian mobile prefixes (6,7,8,9)
        if (!/^[6-9]/.test(this.mobileNumber)) {
          Swal.fire({
            icon: 'error',
            title: 'Invalid Mobile Number',
            text: 'Indian mobile numbers must start with 6, 7, 8, or 9.',
            confirmButtonColor: '#EE2E67',
            customClass: {
              confirmButton: 'swal-btn'
            }
          });
          return;
        }
      } else if (this.countryCode === '+1') {
        // US/Canada numbers should be exactly 10 digits
        if (this.mobileNumber.length !== 10) {
          Swal.fire({
            icon: 'error',
            title: 'Invalid Mobile Number',
            text: 'US/Canada mobile numbers must be exactly 10 digits.',
            confirmButtonColor: '#EE2E67',
            customClass: {
              confirmButton: 'swal-btn'
            }
          });
          return;
        }
      } else {
        // General validation for other countries (6-15 digits)
        if (this.mobileNumber.length < 6 || this.mobileNumber.length > 15) {
          Swal.fire({
            icon: 'error',
            title: 'Invalid Mobile Number',
            text: 'Mobile number must be between 6-15 digits.',
            confirmButtonColor: '#EE2E67',
            customClass: {
              confirmButton: 'swal-btn'
            }
          });
          return;
        }
      }

      const apiUrl = process.env.VUE_APP_API_URL;
      const endpoint = `${apiUrl}/reports`;

      // Combine country code with mobile number
      const fullMobileNumber = `${this.countryCode}${this.mobileNumber}`;

      // Split full name into first and last (last optional)
      const [firstNamePart, ...restNameParts] = this.fullName.trim().split(/\s+/);
      const lastNamePart = restNameParts.join(' ');

      const data = {
        first_name: firstNamePart,
        last_name: lastNamePart,
        mobile_number: fullMobileNumber,
        email: this.email,
      };

      // Persist user info for prefill next time
      try {
        localStorage.setItem('reportUserInfo', JSON.stringify({
          fullName: this.fullName,
          email: this.email,
          countryCode: this.countryCode,
          mobileNumber: this.mobileNumber,
        }));
      } catch (e) { void e; }

      console.log('🚀 Starting form submission...');
      console.log('📝 Form data to submit:', data);
      console.log('🔗 Endpoint:', endpoint);
      
      this.submitLoading = true;
      
      // Wrap the entire async operation in a try-catch
      try {
        fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      })
        .then(response => {
          if (!response.ok) {
            return response.json().then(err => {
              // Ensure error object has proper structure
              if (!err || typeof err !== 'object') {
                err = { message: `HTTP ${response.status}: ${response.statusText}` };
              }
              return Promise.reject(err);
            }).catch(() => {
              // If JSON parsing fails, create a basic error object
              return Promise.reject({
                message: `HTTP ${response.status}: ${response.statusText}`,
                status: response.status
              });
            });
          }
          return response.json();
        })
        .then((response) => {
          console.log('✅ Form submission successful');
          console.log('📊 Response data:', response);
          console.log('🔍 Response type:', typeof response);
          console.log('🔍 Response keys:', response ? Object.keys(response) : 'none');
          
          try {
            // Comprehensive response validation
            if (!response) {
              throw new Error('Response is null or undefined');
            }
            
            if (typeof response !== 'object') {
              throw new Error('Invalid server response structure - not an object');
            }
            
            // Ensure response has success property and it's true
            if (!Object.prototype.hasOwnProperty.call(response, 'success')) {
              console.warn('⚠️ Response missing success property, assuming success based on HTTP status');
              response.success = true; // Assume success if we reach this point
            }
            
            if (response.success !== true) {
              throw new Error(response.message || 'Server indicated failure');
            }
            
            // Extract user ID from multiple possible response shapes
            const userId = (
              Object.prototype.hasOwnProperty.call(response, 'user_id') ? response.user_id : undefined
            ) || (
              response && typeof response === 'object' && response.user && typeof response.user === 'object' ? response.user.id : undefined
            ) || (
              response && typeof response === 'object' && response.data && typeof response.data === 'object' ? (response.data.user_id || response.data.id) : undefined
            ) || (
              Object.prototype.hasOwnProperty.call(response, 'id') ? response.id : undefined
            );

            if (!userId) {
              throw new Error('User ID not received from server');
            }

            // Store user ID and show OTP dialog
            console.log('📋 Setting currentUserId:', userId);
            this.currentUserId = userId;
            this.maskedMobileNumber = this.maskMobileNumber(this.mobileNumber);
            this.pendingAction = 'email'; // Set pending action
            
            // Close report dialog and show OTP dialog
            console.log('📋 Closing report dialog and showing OTP dialog');
            this.reportDialog = false;
            this.otpDialog = true;
            
            // Start resend timer
            console.log('📋 Starting resend timer');
            this.startResendTimer();
            
            // Success notice suppressed; show inline errors only
            
          } catch (innerError) {
            console.error('❌ Error in form success handler:', innerError);
            throw innerError;
          }
        })
        .catch(error => {
          console.error('❌ Form submission error:', error);
          console.error('❌ Error type:', typeof error);
          console.error('❌ Error constructor:', error ? error.constructor.name : 'unknown');
          console.error('❌ Error message:', error ? error.message : 'no message');
          console.error('❌ Error stack:', error ? error.stack : 'no stack');
          console.error('❌ Error properties:', error ? Object.keys(error) : 'none');
          
          // Reset any form state
          this.errors = {};
          
          let errorMessage = 'An unexpected error occurred.';
          
          try {
            // Safely handle different error structures
            if (error && typeof error === 'object') {
              // Check for Laravel validation errors first
              if (Object.prototype.hasOwnProperty.call(error, 'errors') && error.errors && typeof error.errors === 'object') {
                console.log('❌ Handling validation errors');
                this.errors = error.errors;
                errorMessage = '';
                
                Object.keys(error.errors).forEach(field => {
                  if (Array.isArray(error.errors[field]) && error.errors[field].length > 0) {
                    errorMessage += error.errors[field][0] + ' ';
                  }
                });
                
                errorMessage = errorMessage.trim() || 'Validation failed. Please check your inputs.';
                
              } else if (Object.prototype.hasOwnProperty.call(error, 'message') && error.message) {
                console.log('❌ Using error.message');
                errorMessage = String(error.message);
              } else {
                console.log('❌ No specific error message found');
                errorMessage = 'Server error occurred.';
              }
            } else if (typeof error === 'string') {
              console.log('❌ Error is string');
              errorMessage = error;
            } else {
              console.log('❌ Unknown error type');
              errorMessage = 'Unknown error occurred.';
            }
          } catch (handlingError) {
            console.error('❌ Error while handling error:', handlingError);
            console.error('❌ handlingError type:', typeof handlingError);
            console.error('❌ handlingError message:', handlingError && handlingError.message ? handlingError.message : 'no message');
            console.error('❌ handlingError stack:', handlingError && handlingError.stack ? handlingError.stack : 'no stack');
            errorMessage = 'Error processing server response.';
          }

          console.log('❌ Final error message:', errorMessage);
          
          Swal.fire({
            icon: 'error',
            title: 'Submission Error',
            text: errorMessage,
            confirmButtonColor: '#EE2E67',
            customClass: { confirmButton: 'swal-btn' }
          });
        })
        .finally(() => {
          this.submitLoading = false;
        });
        
      } catch (outerError) {
        console.error('😱 OUTER ERROR in form submission:', outerError);
        console.error('😱 OUTER ERROR type:', typeof outerError);
        console.error('😱 OUTER ERROR constructor:', outerError.constructor.name);
        console.error('😱 OUTER ERROR message:', outerError.message);
        console.error('😱 OUTER ERROR stack:', outerError.stack);
        
        // Show a general error message
        Swal.fire({
          icon: 'error',
          title: 'Unexpected Error',
          text: 'An unexpected error occurred during form submission. Please try again.',
          confirmButtonColor: '#EE2E67',
          customClass: { confirmButton: 'swal-btn' }
        });
        
        this.submitLoading = false;
      }
    },
    onMobileInput(e) {
      const value = (e && e.target && e.target.value) ? e.target.value : this.mobileNumber;
      let digitsOnly = String(value).replace(/\D+/g, '');
      
      // Limit digits based on country code
      if (this.countryCode === '+91') {
        // Indian mobile numbers: exactly 10 digits
        digitsOnly = digitsOnly.slice(0, 10);
      } else if (this.countryCode === '+1') {
        // US/Canada numbers: exactly 10 digits  
        digitsOnly = digitsOnly.slice(0, 10);
      } else {
        // Other countries: max 15 digits
        digitsOnly = digitsOnly.slice(0, 15);
      }
      
      this.mobileNumber = digitsOnly;
    },
    // Authentication removed - no timer needed

    prefillFromLocalStorage() {
      console.log('🔍 prefillFromLocalStorage called');
      this.suppressPersist = true;
      
      this.$nextTick(() => {
        try {
          const savedRaw = localStorage.getItem('reportUserInfo');
          console.log('📦 localStorage.reportUserInfo raw:', savedRaw);
          
          const saved = JSON.parse(savedRaw || '{}');
          console.log('📦 localStorage.reportUserInfo parsed:', saved);
          
          // Check if we have any meaningful data in localStorage
          const hasLocalStorageData = saved && typeof saved === 'object' && 
            (saved.fullName || saved.email || saved.mobileNumber || (saved.countryCode && saved.countryCode !== '+61'));
          
          if (hasLocalStorageData) {
            console.log('✅ Using localStorage data');
            console.log('Before prefill - fullName:', this.fullName, 'email:', this.email, 'countryCode:', this.countryCode, 'mobileNumber:', this.mobileNumber);
            
            if (saved.fullName) this.fullName = saved.fullName;
            if (saved.email) this.email = saved.email;
            if (saved.countryCode) this.countryCode = saved.countryCode;
            if (saved.mobileNumber) this.mobileNumber = saved.mobileNumber;
            
            console.log('After prefill - fullName:', this.fullName, 'email:', this.email, 'countryCode:', this.countryCode, 'mobileNumber:', this.mobileNumber);
          } else {
            console.log('⚠️ No localStorage data available');
          }
        } catch (e) { 
          console.error('❌ Error in prefillFromLocalStorage:', e);
        }
        
        this.suppressPersist = false;
        console.log('🔍 prefillFromLocalStorage completed');
      });
    },

    persistReportUserInfo() {
      if (this.suppressPersist) {
        console.log('⏸️ persistReportUserInfo skipped (suppressPersist=true)');
        return;
      }
      
      try {
        const data = {
          fullName: this.fullName,
          email: this.email,
          countryCode: this.countryCode,
          mobileNumber: this.mobileNumber,
        };
        console.log('💾 Persisting to localStorage:', data);
        localStorage.setItem('reportUserInfo', JSON.stringify(data));
        console.log('✅ Successfully persisted to localStorage');
      } catch (e) { 
        console.error('❌ Error persisting to localStorage:', e);
      }
    },

    // Debug method - can be called from browser console
    debugPrefill() {
      console.log('🐛 DEBUG: Current form values:');
      console.log('fullName:', this.fullName);
      console.log('email:', this.email);
      console.log('countryCode:', this.countryCode);
      console.log('mobileNumber:', this.mobileNumber);
      console.log('suppressPersist:', this.suppressPersist);
      
      console.log('🐛 DEBUG: localStorage content:');
      const saved = localStorage.getItem('reportUserInfo');
      console.log('raw:', saved);
      console.log('parsed:', saved ? JSON.parse(saved) : null);
      
      console.log('🐛 DEBUG: sessionStorage content:');
      const session = sessionStorage.getItem('user');
      console.log('raw:', session);
      console.log('parsed:', session ? JSON.parse(session) : null);
      
      console.log('🐛 DEBUG: Calling prefillFromLocalStorage...');
      this.prefillFromLocalStorage();
    },

    // Test method to manually save current form data
    testSave() {
      console.log('🧪 TEST: Manually saving current form data...');
      this.persistReportUserInfo();
      console.log('🧪 TEST: Data saved. Check localStorage:');
      console.log(localStorage.getItem('reportUserInfo'));
    },

    // Test method to manually load form data
    testLoad() {
      console.log('🧪 TEST: Manually loading form data...');
      this.prefillFromLocalStorage();
    },

    // Test method to set sample data
    testSetData() {
      console.log('🧪 TEST: Setting sample data...');
      this.fullName = 'John Doe';
      this.email = 'john@example.com';
      this.countryCode = '+1';
      this.mobileNumber = '1234567890';
      console.log('🧪 TEST: Sample data set');
    },

    // Authentication removed - no OTP methods needed

    // OTP methods restored
    async verifyOtp() {
      this.verifyLoading = true;
      this.errors = {};

      try {
        const otpCode = this.otpDigits.join('');
        
        if (otpCode.length !== 6) {
          this.errors.otp = ['Please enter all 6 digits'];
          this.verifyLoading = false;
          return;
        }

        if (!this.currentUserId) {
          this.otpErrorMessage = 'User ID not found. Please try submitting the form again.';
          this.verifyLoading = false;
          return;
        }

        const apiUrl = process.env.VUE_APP_API_URL;
        const requestPayload = {
          user_id: this.currentUserId,
          otp: otpCode
        };
        
        console.log('Sending OTP verification request:', requestPayload);
        console.log('API URL:', `${apiUrl}/verify-otp`);
        
        const response = await fetch(`${apiUrl}/verify-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestPayload)
        });

        let data = null;
        try {
          data = await response.json();
        } catch (parseError) {
          console.error('Failed to parse JSON response:', parseError);
          this.otpErrorMessage = 'Invalid server response. Please try again.';
          this.verifyLoading = false;
          return;
        }

        // Ensure data is a valid object
        if (!data || typeof data !== 'object') {
          console.error('Invalid data structure:', data);
          this.otpErrorMessage = 'Invalid server response structure. Please try again.';
          this.verifyLoading = false;
          return;
        }

        console.log('OTP verification response:', data);
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        console.log('Data type:', typeof data);
        console.log('Data success property:', Object.prototype.hasOwnProperty.call(data, 'success') ? data.success : 'undefined');

        // Handle successful verification - use safe property access
        if (response.ok && Object.prototype.hasOwnProperty.call(data, 'success') && data.success === true) {
          this.otpDialog = false;
          this.clearResendTimer();
          
          // Success toast removed; proceed silently
          
          // Continue with report generation or download  
          console.log('✅ OTP verification successful, proceeding to next step');
          console.log('📊 App state check:');
          console.log('  - currentUserId:', this.currentUserId);
          console.log('  - pendingAction:', this.pendingAction);
          console.log('  - selectedFeature exists:', !!this.selectedFeature);
          console.log('  - mapLoaded:', this.mapLoaded);
          
          this.proceedAfterVerification();
        } else {
          // Handle all error cases
          console.log('OTP verification failed - detailed info:');
          console.log('- Response OK:', response.ok);
          console.log('- Data exists:', !!data);
          console.log('- Data success:', Object.prototype.hasOwnProperty.call(data, 'success') ? data.success : 'N/A');
          console.log('- Data message:', Object.prototype.hasOwnProperty.call(data, 'message') ? data.message : 'N/A');
          console.log('- Data errors:', Object.prototype.hasOwnProperty.call(data, 'errors') ? data.errors : 'N/A');
          
          // Set form errors if they exist
          this.errors = (data && Object.prototype.hasOwnProperty.call(data, 'errors') && typeof data.errors === 'object') ? data.errors : {};
          
          // Show error message with fallback
          const errorMessage = (data && Object.prototype.hasOwnProperty.call(data, 'message')) ? data.message : 'OTP verification failed. Please try again.';
          this.otpErrorMessage = errorMessage;
        }
      } catch (error) {
        console.error('OTP verification error:', error);
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          this.otpErrorMessage = 'Network error: Unable to connect to server. Please check your connection.';
        } else if (error.name === 'SyntaxError') {
          this.otpErrorMessage = 'Server response error: Invalid response format.';
        } else {
          this.otpErrorMessage = 'Failed to verify OTP. Please try again.';
        }
      } finally {
        this.verifyLoading = false;
      }
    },

    async resendOtp() {
      if (!this.canResendOtp) return;

      try {
        const apiUrl = process.env.VUE_APP_API_URL;
        const response = await fetch(`${apiUrl}/resend-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: this.currentUserId
          })
        });

        let data = null;
        try {
          data = await response.json();
        } catch (parseError) {
          console.error('Failed to parse JSON response for resend OTP:', parseError);
          this.otpErrorMessage = 'Invalid server response. Please try again.';
          return;
        }
        
        // Ensure data is a valid object
        if (!data || typeof data !== 'object') {
          console.error('Invalid resend OTP data structure:', data);
          this.otpErrorMessage = 'Invalid server response structure. Please try again.';
          return;
        }
        
        console.log('Resend OTP response:', data);

        if (response.ok && Object.prototype.hasOwnProperty.call(data, 'success') && data.success === true) {
          // Success toast removed; reset inputs and timer only
          this.startResendTimer();
          this.otpDigits = ['', '', '', '', '', ''];
        } else {
          const errorMessage = (data && Object.prototype.hasOwnProperty.call(data, 'message')) ? data.message : 'Failed to resend OTP. Please try again.';
          this.otpErrorMessage = errorMessage;
        }
      } catch (error) {
        console.error('Resend OTP error:', error);
        this.otpErrorMessage = 'Failed to resend OTP. Please try again.';
      }
    },

    startResendTimer() {
      this.resendTimer = 120; // 2 minutes
      this.resendInterval = setInterval(() => {
        this.resendTimer--;
        if (this.resendTimer <= 0) {
          this.clearResendTimer();
        }
      }, 1000);
    },

    clearResendTimer() {
      if (this.resendInterval) {
        clearInterval(this.resendInterval);
        this.resendInterval = null;
      }
      this.resendTimer = 0;
    },

    onOtpInput(index, value) {
      // Only allow digits
      const digit = value.replace(/\D/g, '');
      this.otpDigits[index] = digit;

      // Auto-focus next input
      if (digit && index < 5) {
        const nextInput = this.$refs[`otpInput${index + 1}`];
        if (nextInput && nextInput[0]) {
          nextInput[0].focus();
        }
      }

      // Clear any previous OTP errors when user starts typing
      if (this.errors.otp) {
        this.errors = { ...this.errors };
        delete this.errors.otp;
      }
      if (this.otpErrorMessage) {
        this.otpErrorMessage = '';
      }
    },

    onOtpKeydown(index, event) {
      // Handle backspace
      if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
        const prevInput = this.$refs[`otpInput${index - 1}`];
        if (prevInput && prevInput[0]) {
          prevInput[0].focus();
        }
      }
    },

    // onOtpPaste(event) {
    //   try {
    //     // Prevent the default paste into a single field
    //     if (event && typeof event.preventDefault === 'function') {
    //       event.preventDefault();
    //     }

    //     // Extract pasted text from clipboard
    //     let pasted = '';
    //     if (event && event.clipboardData) {
    //       pasted = event.clipboardData.getData('text') || event.clipboardData.getData('Text') || '';
    //     } else if (window && window.clipboardData) {
    //       // IE fallback
    //       pasted = window.clipboardData.getData('Text') || '';
    //     } else if (event && typeof event.data === 'string') {
    //       // Some environments attach data directly
    //       pasted = event.data;
    //     }

    //     // Keep only digits and cap to 6
    //     const digits = String(pasted).replace(/\D/g, '').slice(0, 6);
    //     if (!digits) return;

    //     // Determine starting index based on currently focused input
    //     let startIndex = 0;
    //     if (event && event.target) {
    //       // Find which ref index matches the target
    //       for (let i = 0; i < 6; i++) {
    //         const ref = this.$refs[`otpInput${i}`];
    //         if (ref && ref[0] === event.target) {
    //           startIndex = i;
    //           break;
    //         }
    //       }
    //     }

    //     // Fill the otpDigits array with pasted digits from startIndex
    //     for (let i = 0; i < digits.length && (startIndex + i) < 6; i++) {
    //       this.otpDigits[startIndex + i] = digits[i];
    //     }

    //     // Focus next empty input, or last if all filled
    //     let nextFocusIndex = Math.min(startIndex + digits.length, 5);
    //     for (let i = 0; i < 6; i++) {
    //       if (this.otpDigits[i] === '') {
    //         nextFocusIndex = i;
    //         break;
    //       }
    //     }
    //     const nextRef = this.$refs[`otpInput${nextFocusIndex}`];
    //     if (nextRef && nextRef[0] && typeof nextRef[0].focus === 'function') {
    //       nextRef[0].focus();
    //     }

    //     // Clear any previous OTP errors once user pastes
    //     if (this.errors.otp) {
    //       this.errors = { ...this.errors };
    //       delete this.errors.otp;
    //     }
    //     if (this.otpErrorMessage) {
    //       this.otpErrorMessage = '';
    //     }
    //   } catch (e) {
    //     console.error('Error handling OTP paste:', e);
    //   }
    // },
    
    onOtpPaste(e) {
      e.preventDefault()

      const pasteData = e.clipboardData
        .getData('text')
        .replace(/\D/g, '')
        .slice(0, this.otpDigits.length)

      if (!pasteData) return

      pasteData.split('').forEach((char, index) => {
        this.$set(this.otpDigits, index, char)
      })

      // 🔥 Force Vue to re-evaluate computed props
      this.$nextTick(() => {
        const lastIndex = pasteData.length - 1
        this.$refs[`otpInput${lastIndex}`]?.[0]?.focus()
      })
    },
    proceedAfterVerification() {
      console.log('🚀 proceedAfterVerification called');
      console.log('📋 pendingAction:', this.pendingAction);
      console.log('🗺️ selectedFeature:', this.selectedFeature ? 'Available' : 'Not available');
      console.log('🌍 mapLoaded:', this.mapLoaded);
      // console.log('this.selectedFeature new console:', this.selectedFeature);
      
      // This method will be called after successful OTP verification
      // Continue with the original action (report generation or download)
      if (this.pendingAction === 'download') {
        console.log('📥 Calling downloadPdf()');
        this.downloadPdf();
      } else if (this.pendingAction === 'email') {
        console.log('📧 Calling emailReport()');
        this.emailReport();
      } else {
        console.log('⚠️ No pending action found');
      }
      this.pendingAction = null;
    },

    async emailReport() {
      console.log('📧 emailReport() called');
      
      // Close any open dialogs before showing success
      this.reportDialog = false;
      this.otpDialog = false;

      // Show success message then trigger PDF download
      Swal.fire({ 
        icon: 'success',
        title: '<span style="font-family: Montserrat; font-size: 25px;">Report Generated</span>',
        html: '<span style="font-family: Inter; font-size: 16px;">Your property report has been generated successfully.</span>',
        confirmButtonColor: '#EE2E67',
        customClass: { confirmButton: 'swal-btn' }
      }).then(() => {
        this.downloadPdf();
      });
    },

    maskMobileNumber(number) {
      if (!number || number.length < 4) return number;
      const visibleDigits = 2;
      const maskedPart = '*'.repeat(number.length - visibleDigits);
      return maskedPart + number.slice(-visibleDigits);
    },

    closeOtpDialog() {
      this.otpDialog = false;
      this.otpDigits = ['', '', '', '', '', ''];
      this.clearResendTimer();
      this.currentUserId = null;
      this.maskedMobileNumber = '';
      this.pendingAction = null;
      this.otpErrorMessage = '';
    },

    // Authentication removed - no verifyOtp method needed

    captureChart(elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        const canvas = html2canvas(element);
        return canvas.toDataURL('image/png');
      }
      return null;
    },

    async captureChartRef(chartComponent) {
      if (chartComponent) {
        const canvas = await html2canvas(chartComponent.$el);
        return canvas.toDataURL('image/png');
      }
      return null;
    },

    // Authentication removed - no resendOtp method needed

    // Authentication removed - no login/logout methods needed


    // Enhanced Vue.js method with better error handling
    async downloadPdf() {
      this.isDownloading = true;
      this.errorMessage = null;

      if (!this.mapLoaded) {
        Swal.fire({
          icon: 'warning',
          title: 'Map Not Ready',
          text: 'Please wait for the map to finish loading before generating the report.',
          confirmButtonColor: '#EE2E67',
          customClass: { confirmButton: 'swal-btn' }
        });
        this.isDownloading = false;
        return;
      }
      
      // Check if we have selected feature data
      if (!this.selectedFeature || !this.selectedFeature.SuburbData) {
        Swal.fire({
          icon: 'warning',
          title: 'No Area Selected',
          text: 'Please select an area on the map before generating the report.',
          confirmButtonColor: '#EE2E67',
          customClass: { confirmButton: 'swal-btn' }
        });
        this.isDownloading = false;
        return;
      }

      // Do not reopen the report dialog during PDF generation to avoid UI flicker
      // and unintended interactions with the OTP flow.
      this.reportLoading = true;

      await this.$nextTick();

      // Capture map without changing bounds (or change bounds if needed)
      // const mapData = await this.captureMap();

      try {
        // Capture all charts from hidden components - no tab switching needed! 
        this.tab=7;
        const scoreChart = await this.captureChartByRef('scoreRadarChart');
        const score = 4;
        const houseInventoryChart = await this.captureChartByRef('houseInventory');
        const houseListingsChart = await this.captureChartByRef('houseListings');
        const housePriceChart = await this.captureChartByRef('housePrice');
        const houseRentsChart = await this.captureChartByRef('houseRents');

        const unitInventoryChart = await this.captureChartByRef('unitInventory');
        const unitListingsChart = await this.captureChartByRef('unitListings');
        const unitPriceChart = await this.captureChartByRef('unitPrice');
        const unitRentsChart = await this.captureChartByRef('unitRents');

        const vacancyRatesChart = await this.captureChartByRef('vacancyRates');
        const housePriceSegments = await this.captureChartByRef('housePriceSegments');

        const elevation = await this.captureChartByRef('Elevation');
        // const seifa = await this.captureChartByRef('SEIFA');
        // const map = await this.captureMapForSuburb();
        console.log("Image we are sedning for score: ", scoreChart);

        // const map = await this.captureChartByRef('suburbTrendsMap');


        // PDF generation request
        const pdfEndpoint = `${process.env.VUE_APP_API_URL}/report/generate-pdf`;

        // No authentication required
        const pdfResponse = await fetch(pdfEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            // map: mapData,
            name: this.selectedFeature.SuburbData.Suburb,
            houseText: this.selectedFeature.Summary['House Text'],
            unitText: this.selectedFeature.Summary['Unit Text'],
            data: this.selectedFeature,
            desc_1: this.selectedFeature.Summary['House Text'],
            desc_2: this.selectedFeature.Summary['Unit Text'], 
            // Include recipient details so backend can email the report
            recipient_email: this.email || '',
            recipient_name: this.fullName || '',
            user_id: this.currentUserId, // Include authenticated user ID
            note: this.chartNotice,
            houseInventoryChart: houseInventoryChart,
            houseListingsChart: houseListingsChart,
            housePriceChart: housePriceChart,
            unitInventoryChart: unitInventoryChart,
            unitListingsChart: unitListingsChart,
            unitPriceChart: unitPriceChart,
            houseRentsChart: houseRentsChart,
            unitRentsChart: unitRentsChart,
            vacancyRatesChart: vacancyRatesChart,
            housePriceSegments: housePriceSegments,
            score: score,
            scoreChart: scoreChart,
            elevation: elevation,
            seifa: this.SeifaImage,
            map: this.mapImage,
            user: this.user
          })
        });

        // Enhanced error handling to capture Laravel messages
        if (!pdfResponse.ok) {
          let errorData = null;
          try {
            errorData = await pdfResponse.json();
          } catch (parseError) {
            console.error('Failed to parse error response:', parseError);
          }
          
          let errorMessage = 'An error occurred while generating the report.';
          let errorTitle = 'Error!';

          // Handle different Laravel response scenarios
          switch (pdfResponse.status) {
            case 403:
              // Handle download limit errors from Laravel
              if (errorData?.message) {
                errorMessage = errorData.message;
                errorTitle = 'Download Limit Reached';
              }
              break;

            case 422:
              // Handle Laravel validation errors
              if (errorData && errorData.errors && typeof errorData.errors === 'object') {
                const validationErrors = Object.values(errorData.errors).flat();
                errorMessage = 'Validation failed: ' + validationErrors.join(' ');
                errorTitle = 'Validation Error';
              } else if (errorData?.message) {
                errorMessage = errorData.message;
                errorTitle = 'Validation Error';
              }
              break;

            case 400:
              // Handle bad request errors
              errorMessage = errorData?.message || 'Invalid request data.';
              errorTitle = 'Bad Request';
              break;

            case 500:
              // Handle server errors
              errorMessage = errorData?.message || 'Server error occurred while generating report.';
              errorTitle = 'Server Error';
              break;

            default:
              // Handle other errors
              if (errorData?.message) {
                errorMessage = errorData.message;
              }
          }

          console.error('Server Error:', errorData);

          // Display Laravel's error message in SweetAlert
          Swal.fire({
            icon: 'error',
            title: errorTitle,
            text: errorMessage,
            confirmButtonColor: '#EE2E67',
            customClass: { confirmButton: 'swal-btn' },
            // Add some extra styling for better UX
            showConfirmButton: true,
            allowOutsideClick: true
          });

          this.reportLoading = false;
          this.isDownloading = false;

          return; // Exit early on error
        }


        // Success handling
        const data = await pdfResponse.json();
        // Open the generated PDF in a new tab when available
        if (data && data.download_url) {
          try {
            const link = document.createElement('a');
            link.href = data.download_url;
            link.target = '_blank';
            link.rel = 'noopener';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } catch (e) {
            // Fallback
            window.open(data.download_url, '_blank');
          }
        }

        // Show success message with Laravel's success message
        Swal.fire({
          icon: 'success',
          title: '<span style="font-family: Montserrat; font-size: 25px;">PDF Generated!</span>',
          html: `<span style="font-family: Inter; font-size: 16px;">
                  ${data.message || 'Your PDF report has been generated successfully.'}
                </span>`,
          confirmButtonColor: '#EE2E67',
          customClass: { confirmButton: 'swal-btn' },
          timer: 3000, // Auto close after 3 seconds
          timerProgressBar: true
        });

        // Preserve user form data for future prefilling (guarded for browsers blocking storage)
        try {
          const reportUserInfo = typeof window !== 'undefined' && window.localStorage
            ? window.localStorage.getItem('reportUserInfo')
            : null;

          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.clear();
            if (reportUserInfo) {
              window.localStorage.setItem('reportUserInfo', reportUserInfo);
              console.log('💾 Preserved reportUserInfo after PDF download:', reportUserInfo);
            }
          }
        } catch (e) {
          console.warn('LocalStorage not accessible after PDF generation:', e);
        }

        try {
          if (typeof window !== 'undefined' && window.sessionStorage) {
            window.sessionStorage.clear();
          }
        } catch (e) {
          console.warn('SessionStorage not accessible after PDF generation:', e);
        }

        setTimeout(() => {
          window.location.reload();
        }, 5000);

      } catch (error) {
        console.error('Failed to generate PDF:', error);
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);

        let errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
        let errorTitle = 'Connection Error';

        // Provide more specific error messages
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          errorMessage = 'Network request failed. This could be due to CORS issues, server being down, or network connectivity problems.';
          errorTitle = 'Network Error';
        } else if (error.message) {
          errorMessage = error.message;
          errorTitle = 'Request Error';
        }

        // Handle network errors or other exceptions
        Swal.fire({
          icon: 'error',
          title: errorTitle,
          text: errorMessage,
          confirmButtonColor: '#EE2E67',
          customClass: { confirmButton: 'swal-btn' }
        });
      } finally {
        // Clean up loading states
        this.reportLoading = false;
        this.isDownloading = false;
      }
    },

    // Optional: Create a reusable method for showing Laravel messages
    showLaravelMessage(response, defaultMessage = 'Operation completed') {
      const isSuccess = response.ok;
      const data = response.data || {};

      return Swal.fire({
        icon: isSuccess ? 'success' : 'error',
        title: isSuccess ? 'Success!' : 'Error!',
        text: data.message || defaultMessage,
        confirmButtonColor: '#EE2E67',
        customClass: { confirmButton: 'swal-btn' },
        timer: isSuccess ? 3000 : undefined,
        timerProgressBar: isSuccess
      });
    }
  },
  

  beforeUnmount() {
    clearInterval(this.resendInterval);
  },

  watch: {
    searchQuery(query) {
      const q = (query || '').trim()
      if (q && this.fuse) {
        this.searchResults = this.suburbSearch(q)
        console.log("searchResults (from searchQuery watcher):", this.searchResults)
      } else {
        this.searchResults = []
      }
    },
    // When Fuse becomes available, re-run search for existing query
    fuse(newVal) {
      if (newVal && this.searchQuery) {
        const q = (this.searchQuery || '').trim()
        this.searchResults = q ? this.suburbSearch(q) : []
        console.log("searchResults (from searchQuery watcher):", this.searchResults)
      }
    },
    '$vuetify.breakpoint.xs': function (xs) {
      window.setTimeout(() => {
        this.map.resize()
      }, 200)

      // if screen expanded and map was selected before, then select the suburb data tab
      if (!xs && this.tab === 0) {
        this.tab = 1
      }
      if (!xs && this.$refs.tabs) {
        const slideContent = this.$refs.tabs.$el.querySelector('.v-slide-group__content')
        slideContent.style.transform = ''
      }
    },
    data: function () {
      // select suburb from hash, once data is loaded
      const hash = window.location.hash.substring(1)
      const [hashSAL, hashTabURI] = hash.split('-')
      const hashTab = decodeURIComponent(hashTabURI)

      if (hashSAL) {
        this.selectedId = hashSAL
      }
      if (hashTab && this.tabs.includes(hashTab)) {
        this.tab = this.tabs.indexOf(hashTab) + 1
      }
    },
    tab: function (newTab) {
      /* this would create infininte loop
      if (newTab === (this.tabs.length + 1)) {
        this.tab = prevTab
        return
      }
      */

      if (this.map && this.map.getLayer('sa1-elevation')) {
        if (newTab === this.tabs.indexOf('Elevation') + 1) {
          this.map.setLayoutProperty('sa1-elevation', 'visibility', 'visible')
        } else {
          this.map.setLayoutProperty('sa1-elevation', 'visibility', 'none')
        }
      }

      if (this.map && this.map.getLayer('sa1-seifa')) {
        if (newTab === this.tabs.indexOf('Profiles') + 1) {
          this.map.setLayoutProperty('sa1-seifa', 'visibility', 'visible')
        } else {
          this.map.setLayoutProperty('sa1-seifa', 'visibility', 'none')
        }
      }

      if (this.$refs.tabs) {
        const scrollLeft = 90 * (this.$vuetify.breakpoint === 'xs' ? newTab : newTab - 1)
        this.$refs.tabs.$el.getElementsByClassName('v-slide-group__wrapper')[0].scrollTo({ left: scrollLeft, behavior: 'smooth' })
      }

      // scroll tabs if overflowing
      /*
      if (this.$refs.tabs && this.$vuetify.breakpoint.xs) {
        const slideContent = this.$refs.tabs.$el.querySelector('.v-slide-group__content')
        if (!slideContent.style.transform && newTab > prevTab) {
          slideContent.style.transform = `translateX(-65px)`
        } else {
          const matches = slideContent.style.transform.match(/translateX\(([-]?[0-9]+)px\)/)
   
          let translateX = 0
          if (matches && matches.length > 1) {
            translateX = Number(matches[1]) || 0
          }
   
          if (newTab > prevTab) {
            const distance = Math.min(translateX - 65, 0)
            slideContent.style.transform = `translateX(${distance}px)`
          } else {
            const distance = Math.min(translateX + 65, 0)
            slideContent.style.transform = `translateX(${distance}px)`
          }
        }
      }
      */

      window.setTimeout(() => {
        this.map.resize()
      }, 200)
    },

    mapLoaded: function (mapLoaded) {
      if (mapLoaded) {
        if (this.setStyleOnceLoaded) {
          this.setStyle(this.style, this.style === 'map' ? 'satellite' : 'map')
        }
        if (this.setSelectedFeatureStateOnceLoaded && this.selectedId) {
          this.map.setFeatureState({
            source: 'composite',
            sourceLayer: 'SAL',
            id: this.selectedId
          }, {
            selected: true
          })
        }
        if (this.fitBoundsOnceLoaded) {
          this.map.fitBounds(this.bounds, Object.assign({}, this.fitBoundsOptions(), { duration: 0 }))
        }
      }
    },
    style: function (style, prevStyle) {
      if (this.mapLoaded) {
        this.setStyle(style, prevStyle)
      } else {
        this.setStyleOnceLoaded = true
      }
    },


    selectedId: function (id, prev) {
      if (this.mapLoaded) {
        if (prev) {
          this.map.removeFeatureState({
            source: 'composite',
            sourceLayer: 'SAL',
            id: prev
          }, 'selected')
        }

        if (id) {
          this.map.setFeatureState({
            source: 'composite',
            sourceLayer: 'SAL',
            id: id
          }, {
            selected: true
          })
        }
      } else {
        this.setSelectedFeatureStateOnceLoaded = true
      }

      if (id) {
        console.log("id1", id);
        this.fetchSuburb(id)
          .then(() => {
            const selectedFeature = id in this.data ? this.suburbData[id] : null
            for (const chart of charts) {
              if (chart in this.$refs && this.$refs[chart]) {
                const data = selectedFeature ? selectedFeature[chart] : null
                this.$refs[chart].setData(data)
              }
            }

            // console.log(this.data);

            // set the state
            if (selectedFeature) {
              selectedFeature.State = this.data[id].state
            }

            if (selectedFeature?.Elevation) {
              this.map.removeFeatureState({
                source: 'composite',
                sourceLayer: 'SA1',
              })
              for (const [SA1, e] of Object.entries(selectedFeature.Elevation)) {
                this.map.setFeatureState({
                  source: 'composite',
                  sourceLayer: 'SA1',
                  id: SA1
                }, {
                  min: Number(e.min)
                })
              }
            }

            if (selectedFeature?.Sa1Socio) {
              this.map.removeFeatureState({
                source: 'composite',
                sourceLayer: 'SA1',
              })
              for (const [SA1, rank] of Object.entries(selectedFeature.Sa1Socio)) {
                this.map.setFeatureState({
                  source: 'composite',
                  sourceLayer: 'SA1',
                  id: SA1
                }, {
                  seifa: rank
                })
              }
            }

            this.selectedFeature = selectedFeature
          })

        if (!this.$vuetify.breakpoint.xs && this.tab < 1) {
          this.tab = 1
        }

        // update map padding based on if tabs are present at top
        if (this.$vuetify.breakpoint.xs) {
          this.map.setPadding({
            top: 176
          })
        }

        // zoom to suburb
        this.bounds = this.suburbBounds[id]

        if (this.hoverPopup) {
          this.hoverPopup.addClassName('hidden')
        }

        this.style = 'satellite'

        this.$nextTick(() => {
          if (this.$refs.tabs) {
            this.$refs.tabs.$el.getElementsByClassName('v-slide-group__wrapper')[0].addEventListener('touchstart', this.touchStart)
            this.$refs.tabs.$el.getElementsByClassName('v-slide-group__wrapper')[0].addEventListener('touchmove', this.touchMove)
          }
        })
      } else {
        if (this.hoverPopup) {
          this.hoverPopup.removeClassName('hidden')
        }

        this.map.removeFeatureState({
          source: 'composite',
          sourceLayer: 'SA1',
        })

        this.selectedFeature = null
        this.style = 'map'

        if (this.$vuetify.breakpoint.xs) {
          this.map.setPadding({
            top: 98
          })
        }

        this.$nextTick(() => {
          this.map.resize()
        })
      }

      if (this.$refs.tabs) {
        this.$refs.tabs.$el.getElementsByClassName('v-slide-group__wrapper')[0].removeEventListener('touchstart', this.touchStart)
        this.$refs.tabs.$el.getElementsByClassName('v-slide-group__wrapper')[0].removeEventListener('touchmove', this.touchMove)
      }
    },
    bounds: {
      handler: function (bounds) {
        if (this.map && this.mapLoaded && bounds) {
          this.map.fitBounds(bounds, this.fitBoundsOptions())
        } else {
          this.fitBoundsOnceLoaded = true
        }
      },
      deep: true
    },
    selectedFeature: function (selectedFeature, prev) {
      if (selectedFeature && !prev) {
        this.$nextTick(() => {
          this.$refs.tabs.$el.addEventListener('wheel', this.scrollTabs)
        })
      }
      if (!selectedFeature && prev) {
        this.$refs.tabs.$el.removeEventListener('wheel', this.scrollTabs)
      }

      // when feature is selected use satellite, otherwise use standard map style
      if (selectedFeature) {
        this.style = 'satellite'
      } else {
        this.style = 'map'
      }
    },

    // Prefill and persist latest data for report form
    reportDialog(newVal) {
      console.log('👁️ reportDialog watcher triggered, newVal:', newVal);
      if (newVal) {
        this.prefillFromLocalStorage();
      }
    },
    fullName: {
      handler(newVal, oldVal) { 
        console.log('👁️ fullName watcher triggered:', oldVal, '->', newVal, 'suppressPersist:', this.suppressPersist);
        if (!this.suppressPersist) this.persistReportUserInfo(); 
      },
      immediate: false
    },
    email: {
      handler(newVal, oldVal) { 
        console.log('👁️ email watcher triggered:', oldVal, '->', newVal, 'suppressPersist:', this.suppressPersist);
        if (!this.suppressPersist) this.persistReportUserInfo(); 
      },
      immediate: false
    },
    countryCode: {
      handler(newVal, oldVal) { 
        console.log('👁️ countryCode watcher triggered:', oldVal, '->', newVal, 'suppressPersist:', this.suppressPersist);
        if (!this.suppressPersist) this.persistReportUserInfo(); 
      },
      immediate: false
    },
    mobileNumber: {
      handler(newVal, oldVal) { 
        console.log('👁️ mobileNumber watcher triggered:', oldVal, '->', newVal, 'suppressPersist:', this.suppressPersist);
        if (!this.suppressPersist) this.persistReportUserInfo(); 
      },
      immediate: false
    },

    otpDialog(newVal) {
      console.log('👁️ otpDialog watcher triggered, newVal:', newVal);
      try {
        if (newVal) {
          // Focus first input when dialog opens
          this.$nextTick(() => {
            try {
              if (this.$refs.otpInput0 && this.$refs.otpInput0[0]) {
                this.$refs.otpInput0[0].focus();
              }
            } catch (focusError) {
              console.error('❌ Error focusing OTP input:', focusError);
            }
          });
        } else {
          // Dialog is closing - no additional actions needed
          console.log('👁️ OTP dialog closing');
        }
      } catch (watcherError) {
        console.error('❌ Error in otpDialog watcher:', watcherError);
      }
    }
  },

  computed: {
    elevationData: function () {
      if (this.selectedFeature && this.selectedFeature.Elevation) {
        const values = Object.values(this.selectedFeature.Elevation).map(e => Number(e.min))
        const steps = sa1ElevationLegend.map(v => v[0])

        // distribution of values for each step
        const dist = {}
        for (let i = 0; i < steps.length; i++) {
          dist[steps[i]] = 0
        }

        // for each value
        for (let vi = 0; vi < values.length; vi++) {
          const ele = values[vi]

          // find which step it falls into
          for (let i = 0; i < steps.length; i++) {
            if (i === 0 && ele < steps[0]) {
              dist[steps[0]]++
            } else if (i === steps.length - 1 && ele >= steps[steps.length - 1]) {
              dist[steps[steps.length - 1]]++
            } else if (ele >= steps[i] && ele < steps[i + 1]) {
              dist[steps[i]]++
            }
          }
        }
        return dist
      } else {
        return null
      }
    },
    suburbBounds() {
      if (!this.suburbs) {
        return {};
      }
      return this.suburbs.features.reduce((result, feature) => {
        try {
          const bb = (Array.isArray(feature.bbox) && feature.bbox.length === 4) ? feature.bbox : bbox(feature);
          result[feature.id] = bb;
        } catch (e) {
          // In case of malformed geometry, skip bounds but keep app functional
          console.warn('Failed to compute bounds for feature:', feature.id, e)
        }
        return result;
      }, {});
    },

    // Authentication removed - no computed properties needed

    // OTP computed properties
    formattedMobileNumber() {
      if (!this.mobileNumber) return '';
      const countryCode = this.countryCode || '+61';
      return `${countryCode}${this.mobileNumber}`;
    },
    
    resendTimerDisplay() {
      const minutes = Math.floor(this.resendTimer / 60);
      const seconds = this.resendTimer % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },
    
    canResendOtp() {
      return this.resendTimer === 0;
    },

    isOtpComplete() {
      return this.otpDigits.every(d => d && d.length === 1)
    }

  }
}
</script>
<style>
html,
body {
  overflow-y: auto !important;
  letter-spacing: normal;
}

.v-container {
  font-family: 'Montserrat', sans-serif;
}

[data-vuetify] {
  overflow-y: hidden;
}

[data-vuetify] .map {
  /* Slightly smaller so pink button is visible */
  height: 85vh;
  width: 100%;

  /* allow popups to be visible outside the map */
  overflow: visible;
}

/* Desktop-specific adjustment to ensure map fits consistently */
.desktop #suburbtrends-map {
  height: 85vh !important;
}

/* Mobile map height adjustment */
.mobile #suburbtrends-map {
  height: 85vh !important;
}

.v-text-field__details {
  display: none !important;
}

.v-input {
  font-size: 15px !important;
}

[data-vuetify] .desktop .panel-content {
  position: absolute;
  height: 100%;
  width: 475px;
  z-index: 2;
}

[data-vuetify] .mobile .panel-content {
  position: relative;
  /*margin-bottom: 39.5px;*/
  z-index: 1;
}

[data-vuetify] .mobile .panel-content.feature-active {
  background-color: white;
}

[data-vuetify] .desktop .panel-background {
  position: absolute;
  height: 100%;
  width: 475px;
  z-index: 1;
}

[data-vuetify] .desktop .overlay-logo {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  margin: 20px;
}

[data-vuetify] .mobile .overlay-logo {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 1;
  margin-left: 10px;
  margin-bottom: 40px;
  width: 125px;
}

[data-vuetify] .mobile .overlay-logo.panel-open {
  display: none;
}

[data-vuetify] .desktop .panel-background.feature-active {
  background-color: white;
}

.desktop .scroll-content {
  overflow-y: scroll !important;
  scrollbar-width: thin;
  scrollbar-color: darkgray lightgray;
  /* scroll thumb and track */
}

button.mb-4.v-btn.v-btn--is-elevated.v-btn--has-bg.theme--light.v-size--default.primary.btn-color {
  background-color: #EE2E67 !important;
  font-weight: 700;
  font-size: 16px;
  width: 120px;
  height: 46px;
  border-radius: 10px;
  color: #fff !important;
  letter-spacing: normal;
}

button.mb-4.v-btn.v-btn--is-elevated.v-btn--has-bg.theme--light.v-size--default.primary.btn-color:hover {
  background-color: #ed5381 !important;
}

.v-window__container {
  margin-right: 10px;
}

.desktop .fade-bottom {
  -webkit-mask-image: linear-gradient(to top, transparent 0px, black 30px);
  mask-image: linear-gradient(to top, transparent 0px, black 30px);
  padding-bottom: 30px;
  /* ensuring no content falls within the fade gradient */
}

.scroll-content::-webkit-scrollbar {
  width: 8px;
  background-color: lightgray;
}

.scroll-content::-webkit-scrollbar-thumb {
  background: darkgray;
}

.v-select__selections>input {
  display: none
}

.v-select__selection {
  max-width: 100% !important;
}


.v-text-field.v-text-field--solo:not(.v-text-field--solo-flat)>.v-input__control>.v-input__slot {
  box-shadow: none !important;
}



.selectMenu {
  margin-top: 40px;
}

ul {
  list-style-type: none;
  padding-inline-start: 14px;
}

.bar-chart {
  position: relative;
  height: 200px;
}

.v-card__progress {
  height: 100%;
}

.panel-header {
  margin-top: 9px;
  margin-bottom: 9px;
}

.suburb-title {
  position: relative;
  box-shadow: 0 0 10px 2px rgb(0 0 0 / 10%);
  min-height: 54px;
}

.close-button {
  top: 0px !important;
  right: 0px !important;
}

.v-item--active {
  font-weight: bold;
}

.background-none {
  background: none !important;
}

.search .v-label {
  font-size: 20px;
}

.search .v-input__slot {
  height: 54px;

  padding-top: 6px !important;
  padding-bottom: 6px !important;
  padding-left: 16px !important;
  padding-right: 16px !important;

  margin: 0 !important;
}

.search.v-input input {
  max-height: 54px !important;
  padding: 6px 0 6px !important;
  height: 54px;

  font-size: 20px;
}

.search-results {
  position: absolute !important;
  width: 419px;
  max-width: calc(100% - 32px - 24px) !important;
  max-height: calc(100vh - 70px - 86px - 50px) !important;
  overflow-y: scroll;
  margin-left: 16px;
  margin-right: 16px;
  z-index: 10;
}

.search-results .v-list--dense .v-list-item .v-list-item__title {
  font-size: 1.15rem !important;
  line-height: 1.5rem !important;
}

.v-tabs {
  max-height: 78px;
  max-width: calc(100% - 72px);
}

.v-tab {
  /* more dense tabs */
  padding: 0 8px !important;
}

.v-tabs--icons-and-text>.v-tabs-bar .v-tab {
  /* align tab icons/text to the top so icons are aligned with single vs multiline text */
  align-self: baseline;

  /* prefer to break at word ends, but still break within a word if no other option, to avoid "Neighbourhoods" being too long */
  word-break: break-word;
  hyphens: auto;
}

.v-tabs--grow>.v-tabs-bar .v-tab {
  /* limit tab width to force text to wrap */
  max-width: 90px !important;
}

.mobile .mapboxgl-ctrl-top-right {
  width: 100% !important;
}

/* toggle which logo is shown based on screen size */
@media (min-width: 800px) {
  .mapboxgl-ctrl-bottom-left .mapboxgl-ctrl-logo {
    display: none;
  }
}

@media (max-width: 799px) {
  .mapboxgl-ctrl-bottom-right .mapboxgl-ctrl-logo {
    display: none;
  }
}

.mobile-footer {
  position: absolute !important;
  bottom: 0;
  width: 100%;
}

.mobile #suburbtrends-map {
  position: relative;
  height: 85vh !important;
  top: auto;
  bottom: auto;
}

.hover-popup .mapboxgl-popup-tip {
  border: 10px solid transparent;
}

.hover-popup .mapboxgl-popup-content {
  padding: 5px 10px 5px 10px;
  min-width: 25px;
}

.hover-popup.hidden {
  display: none !important;
}

ul {
  padding-left: 0px !important;
}

.terms-footer {
  pointer-events: all;
}

.mobile .v-toolbar__content {
  display: block;
  padding: 0;
}

.mobile .v-toolbar__title.toolbar-logo {
  padding: 4px 16px;
}

.mobile .v-toolbar__title .v-image {
  margin-left: auto;
  margin-right: auto;
}

/* remove prev/next buttons to use our own implementation instead */
.v-slide-group__prev,
.v-slide-group__next {
  display: none !important;
}

/* disable transform based slide as scroll used instead to support scroll */
/*.v-tabs .v-tabs-bar__content {
  transform: none !important;
}*/

/* allow tabs to scroll left/right */
/*
.v-slide-group__wrapper {
  overflow-x: scroll !important;
}
.v-slide-group__wrapper {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.v-slide-group__wrapper::-webkit-scrollbar {
  display: none;
}
*/

.pointer-events-all {
  pointer-events: all;
}

.pointer-events-none {
  pointer-events: none;
}

.legend .v-list-item {
  min-height: 16px !important;
}

.elevation-chart {
  width: 335px;
}

.seifa-chart {
  width: 315px;
}

.main-content-card {
  min-height: 85vh;
  max-height: 85vh;
  /* Adjust height as needed */
}

.v-btn.report-btn {
  font-size: 18px !important;
  font-family: 'Inter', sans-serif;
}

.swal2-actions .swal-btn {
  color: white !important;
}

h1.text-caption.submit-text.mt-4 {
  font-size: 16px !important;
}


.v-image.v-responsive.theme--light.mx-auto.hover-shadow {
  height: 250px !important;
}

.theme--light.v-application {
  background: none !important;
}

.v-application--wrap {
  height: auto !important;
}


.v-card__title.headline.d-flex.justify-space-between.align-center {
  font-size: 24px !important;
  font-weight: bold;
  font-family: 'Montserrat', sans-serif !important;
  line-height: 100%;
}
@media (max-width: 600px) {
  .v-card__title.headline.d-flex.justify-space-between.align-center {
    font-size: 18px !important;
  }
}

.inputs-fields .v-input--dense>.v-input__control>.v-input__slot {
  height: 60px;
  /* border-radius: 20px; */
}

.inputs-fields .v-text-field.v-input--dense:not(.v-text-field--outlined) input {
  padding: 4px 10px 2px !important;
}

.inputs-fields .v-input {
  color: rgba(0, 0, 0, 0.87);
  border-radius: 20px;
}

.inputs-fields .v-text-field--outlined.v-input--dense .v-label {
  top: 20px !important;
}

.inputs-fields .v-input__control {
  border: 1px solid #00000033 !important;
}

.v-field__outline,
.v-field__details {
  border: none !important;
  box-shadow: none !important;
}

.v-btn.report-btn {
  width: 198px !important;
  height: 46px !important;
  border-radius: 10px !important;
  padding: 13px 20px !important;
  gap: 10px !important;
  opacity: 1 !important;
  transform: rotate(0deg) !important;
  font-size: 16px !important;
  font-weight: 700 !important;
  letter-spacing: normal !important;
}

.swal-title{
font-family: 'Montserrat', sans-serif !important;  
}

.swal-text{
font-family: 'Inter', sans-serif !important;
}

.swal-btn{
font-family: 'Inter', sans-serif !important;
}

/* Remove the block behavior since we're setting a specific width */
.v-btn.report-btn.v-btn--block {
  width: 198px !important;
  display: inline-flex !important;
}


/* OTP verification */
.otp-verification-card {
  overflow: visible !important;
}

.otp-card-title {
  border-bottom: none !important;
  padding-bottom: 0 !important;
}

.otp-title {
  font-size: 28px !important;
  font-weight: 700 !important;
  color: #333 !important;
  line-height: 1.2 !important;
  margin: 0 !important;
}

.otp-subtitle {
  color: #666 !important;
  font-size: 16px !important;
  line-height: 1.5 !important;
  margin: 0 !important;
  font-family: 'Inter', sans-serif !important;
}

.close-btn-otp {
  position: absolute !important;
  top: 20px !important;
  right: 20px !important;
}

.otp-inputs-container {
  gap: 12px;
  justify-content: center;
}

.otp-digit-input {
  width: 60px !important;
  max-width: 60px !important;
}

.otp-digit-input .v-input__control {
  height: 60px !important;
}

.otp-digit-input .v-input__slot {
  height: 60px !important;
  border-radius: 12px !important;
  background: #f8f9fa !important;
  border: 2px solid #e1e5e9 !important;
  transition: all 0.2s ease !important;
}

.otp-digit-input .v-text-field__slot input {
  text-align: center !important;
  font-size: 24px !important;
  font-weight: 600 !important;
  color: #333 !important;
  padding: 0 !important;
  height: 56px !important;
  line-height: 56px !important;
}

.otp-digit-input.v-input--is-focused .v-input__slot {
  border-color: #EE2E67 !important;
  background: white !important;
  box-shadow: 0 0 0 3px rgba(238, 46, 103, 0.1) !important;
  transform: scale(1.05) !important;
}

.otp-digit-input .v-input__slot fieldset {
  display: none !important;
}

/* When input has value */
.otp-digit-input .v-text-field--outlined .v-input__slot:not(.v-input--is-focused) {
  border-color: #EE2E67 !important;
  background: white !important;
}

.resend-text {
  color: #666 !important;
  font-size: 14px !important;
  margin: 0 !important;
  font-family: 'Inter', sans-serif !important;
}

.resend-timer {
  color: #EE2E67 !important;
  font-weight: 600 !important;
  font-size: 14px !important;
}

.resend-link {
  color: #EE2E67 !important;
  text-decoration: none !important;
  font-weight: 600 !important;
  font-size: 14px !important;
  transition: color 0.2s ease !important;
  font-family: 'Inter', sans-serif !important;
}

  .resend-link:hover {
    color: #d91e5b !important;
    text-decoration: underline !important;
  }

  .otp-error-alert {
    font-family: 'Inter', sans-serif !important;
    margin-bottom: 8px !important;
  }

.verify-btn-otp {
  width: 198px !important;
  height: 50px !important;
  border-radius: 12px !important;
  font-size: 16px !important;
  font-weight: 600 !important;
  letter-spacing: normal !important;
  transition: all 0.2s ease !important;
  font-family: 'Inter', sans-serif !important;
}

.verify-btn-otp:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(238, 46, 103, 0.3) !important;
}

.verify-btn-otp:disabled {
  background: #ccc !important;
  transform: none !important;
  box-shadow: none !important;
}

@media (max-width: 480px) {
  .otp-title {
    font-size: 22px !important;
  }
  .otp-digit-input.v-input--dense.theme--light.v-text-field.v-text-field--is-booted.v-text-field--enclosed.v-text-field--outlined{
    padding: 0px !important;
  }

  .otp-digit-input {
    width: 50px !important;
    max-width: 50px !important;
  }

  .otp-digit-input .v-input__control,
  .otp-digit-input .v-input__slot {
    height: 50px !important;
  }

  .otp-digit-input .v-text-field__slot input {
    font-size: 20px !important;
    height: 46px !important;
    line-height: 46px !important;
  }

  .otp-inputs-container {
    gap: 8px;
  }

  .elevation-chart {
    max-width: calc(100% - 100px) !important;
  }

  .seifa-chart {
    max-width: calc(100% - 103px) !important;
  }
}

.invisible-charts {
  position: absolute;
  left: -9999px;
  top: -9999px;
  visibility: hidden;
  pointer-events: none;
  width: 400px;
  height: 200px;
}


/* Mobile Styles (xs: < 600px) */
@media (max-width: 599px) {
  .main-content-card {
    min-height: 90vh !important;
    max-height: 90vh !important;
    margin: 0 !important;
    border-radius: 0 !important;
  }

  .mobile-panel-content {
    position: relative !important;
    width: 100% !important;
    height: auto !important;
    min-height: 50vh;
    z-index: 2;
  }

  .mobile-panel-bg {
    background-color: white !important;
  }

  .search-container {
    padding: 8px !important;
  }

  .search-results-mobile {
    position: absolute !important;
    width: calc(100% - 16px) !important;
    max-height: 40vh !important;
    margin: 0 8px !important;
    z-index: 15;
    overflow-y: auto;
  }

  .mobile-list-item {
    min-height: 48px !important;
  }

  .mobile-list-item .v-list-item__content {
    padding: 8px 0 !important;
  }

  .tab-row-mobile {
    padding: 4px 8px !important;
    min-height: 60px !important;
  }

  .tabs-mobile {
    flex: 1 !important;
    max-width: calc(100% - 64px) !important;
  }

  .mobile-tab {
    min-width: 60px !important;
    max-width: 80px !important;
    padding: 0 4px !important;
    font-size: 10px !important;
  }

  .mobile-tab .v-tab__content {
    flex-direction: column !important;
    gap: 2px !important;
  }

  .tab-nav-btn {
    min-width: 32px !important;
    margin: 0 2px !important;
  }

  .overlay-logo-mobile {
    position: fixed !important;
    bottom: 60px !important;
    left: 8px !important;
    z-index: 5;
  }

  .map-mobile {
    height: 50vh !important;
    width: 100% !important;
  }

  .responsive-content {
    padding: 0 8px !important;
    max-height: 40vh !important;
    overflow-y: auto !important;
  }

  .elevation-chart {
    min-width: calc(100% - 100px) !important;
  }

  .seifa-chart {
    min-width: calc(100% - 103px) !important;
  }

  .v-application .mt-8 {
    margin-top: auto !important;
  }
}

/* Tablet Styles (sm: 600px - 959px) */
@media (min-width: 600px) and (max-width: 959px) {
  .main-content-card {
    min-height: 80vh !important;
    max-height: 90vh !important;
  }

  .tablet-panel-content {
    position: absolute !important;
    height: 100% !important;
    width: 400px !important;
    z-index: 2;
  }

  .search-results-tablet {
    position: absolute !important;
    width: 360px !important;
    max-height: 50vh !important;
    margin-left: 20px !important;
    z-index: 10;
  }

  .tab-row-tablet {
    padding: 8px 12px !important;
  }

  .tabs-tablet {
    max-width: calc(100% - 72px) !important;
  }

  .tablet-tab {
    min-width: 70px !important;
    max-width: 90px !important;
    padding: 0 6px !important;
  }

  .overlay-logo-tablet {
    position: absolute !important;
    top: 15px !important;
    right: 15px !important;
    z-index: 1;
  }

  .map-tablet {
    height: 100% !important;
    width: calc(100% - 400px) !important;
    margin-left: 400px !important;
  }

  .elevation-chart {
    min-width: calc(100% - 100px) !important;
  }

  .seifa-chart {
    min-width: calc(100% - 100px) !important;
  }
}

/* Desktop Styles (md and up: >= 960px) */
@media (min-width: 960px) {
  .desktop-panel-content {
    position: absolute !important;
    height: 100% !important;
    width: 475px !important;
    z-index: 2;
  }

  .search-results-desktop {
    position: absolute !important;
    width: 419px !important;
    max-height: calc(100vh - 200px) !important;
    margin-left: 16px !important;
    margin-right: 16px !important;
    z-index: 10;
  }

  .tab-row-desktop {
    padding: 12px 16px !important;
  }

  .tabs-desktop {
    max-width: calc(100% - 72px) !important;
  }

  .desktop-tab {
    min-width: 80px !important;
    max-width: 100px !important;
    padding: 0 8px !important;
  }

  .overlay-logo-desktop {
    position: absolute !important;
    top: 20px !important;
    right: 20px !important;
    z-index: 1;
  }

  .map-desktop {
    height: 100% !important;
    width: calc(100% - 475px) !important;
    margin-left: 475px !important;
  }
}

/* Large Desktop Styles (lg and up: >= 1264px) */
@media (min-width: 1264px) {
  .desktop-panel-content {
    width: 500px !important;
  }

  .search-results-desktop {
    width: 444px !important;
  }

  .map-desktop {
    width: calc(100% - 500px) !important;
    margin-left: 500px !important;
  }

  .desktop-tab {
    min-width: 85px !important;
    max-width: 110px !important;
  }
}

/* Extra Large Desktop Styles (xl: >= 1904px) */
@media (min-width: 1904px) {
  .desktop-panel-content {
    width: 550px !important;
  }

  .search-results-desktop {
    width: 494px !important;
  }

  .map-desktop {
    width: calc(100% - 550px) !important;
    margin-left: 550px !important;
  }
}

/* Chart Responsiveness */
.responsive-content .v-card {
  margin-bottom: 12px !important;
}

@media (max-width: 599px) {
  .responsive-content .v-card {
    height: 180px !important;
    margin-bottom: 8px !important;
  }

  .bar-chart {
    height: 160px !important;
  }
}

@media (min-width: 600px) and (max-width: 959px) {
  .responsive-content .v-card {
    height: 190px !important;
  }

  .bar-chart {
    height: 170px !important;
  }

  .seifa-chart {
    min-width: calc(100% - 100px) !important;
  }
}

/* Search field responsiveness */
.search .v-input__slot {
  height: 48px !important;
}

@media (min-width: 600px) {
  .search .v-input__slot {
    height: 54px !important;
  }
}

.search.v-input input {
  font-size: 16px !important;
}

@media (min-width: 600px) {
  .search.v-input input {
    font-size: 18px !important;
  }
}

@media (min-width: 960px) {
  .search.v-input input {
    font-size: 20px !important;
  }
}

/* Responsive footer */
.responsive-footer {
  font-size: 12px !important;
}

@media (min-width: 600px) {
  .responsive-footer {
    font-size: 13px !important;
  }
}

@media (min-width: 960px) {
  .responsive-footer {
    font-size: 14px !important;
  }
}

/* Touch-friendly improvements for mobile */
@media (max-width: 599px) {
  .v-list-item {
    min-height: 48px !important;
    /* padding: 8px 16px !important; */
  }

  .v-btn.close-button {
    min-width: 44px !important;
    min-height: 44px !important;
  }

  .tab-nav-btn {
    min-width: 44px !important;
    min-height: 44px !important;
  }
}


.country-code-select .v-input__control {
  border-right: none !important;
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}

.mobile-number-input .v-input__control {
  border-left: none !important;
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
}

.flag-emoji {
  font-size: 18px;
}

/* Ensure the inputs look connected */
.v-row.no-gutters .v-col:first-child .v-input__slot {
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}

.v-row.no-gutters .v-col:last-child .v-input__slot {
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
  border-left: none !important;
}

/* Country code and mobile number input styling */
.country-code-select .v-input__control,
.mobile-number-input .v-input__control {
  border: 1px solid #00000033 !important;
}

/* Remove the border between country code and mobile number */
.v-row.no-gutters .country-code-select .v-input__slot {
  border-right: none !important;
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}

.v-row.no-gutters .mobile-number-input .v-input__slot {
  border-left: none !important;
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
}

/* Focus states */
.country-code-select.v-input--is-focused .v-input__slot {
  border-right: 1px solid #EE2E67 !important;
}

.mobile-number-input.v-input--is-focused .v-input__slot {
  border-left: 1px solid #EE2E67 !important;
}


/* Error states */
.country-code-select.error--text .v-input__slot,
.mobile-number-input.error--text .v-input__slot {
  border-color: #ff5252 !important;
}

/* Flag emoji sizing */
.flag-emoji {
  font-size: 18px;
  margin-right: 4px;
}

/* Dropdown menu styling */
.v-select__selections {
  align-items: center;
}

/* Make sure the select dropdown is properly sized */
.country-code-select .v-select__selection {
  display: flex;
  align-items: center;
  max-width: 100%;
}


.v-application--is-ltr .v-text-field .v-input__append-inner {
    display: none !important;
}

/* Responsive adjustments */
@media (max-width: 599px) {
  .flag-emoji {
    font-size: 16px;
  }

  .country-code-select .v-input__slot,
  .mobile-number-input .v-input__slot {
    height: 48px !important;
  }
}

.main-content-card .v-progress-circular.progressCicle.v-progress-circular--visible.v-progress-circular--indeterminate {
  position: absolute;
  z-index: 9999;
  left: 0;
  right: 0;
  margin: auto;
  top: 50%;
}

div:where(.swal2-container) button:where(.swal2-styled):not([disabled]) {
  cursor: pointer;
  color: #fff;
}

.svg-filter-red{
    filter: invert(18%) sepia(85%) saturate(3015%) hue-rotate(331deg) brightness(88%) contrast(92%);
    width: 24px !important; 
    height: 24px !important;
}
/* 
.v-image.v-responsive.theme--light{
    height: 106px !important;
    background-color: black;
    border-radius: 14px;
} */

 /* Target the error message within a Vuetify input */
div:where(.swal2-container) div:where(.swal2-html-container) {
    font-size: 1.5em;
}


.logo_bg {
    /* background: #000000; */
    border-radius: 10px;
    padding: 10px;
}

.overlay-logo .theme--light.v-image {
    height: auto !important;
    width: 150.55px !important;
}

[data-vuetify] .mobile .overlay-logo {
    margin-bottom: 80px !important;
}

.icon_body.mt-2.terms-footer.d-flex.justify-center.pointer-events-all {
    justify-content: left !important;
}

.formtitle .formclose { 
  position: absolute;
  top: 10px;
  right: 10px;
}
.formtitle p { 
  padding-right: 40px  !important;
}
.v-card__title.headline {
    word-break: auto-phrase !important;
}

@media (max-width: 600px) {
  ::v-deep(.otp-digit-input.v-text-field.v-text-field--enclosed
    > .v-input__control
    > .v-input__slot) {
    padding: 0 !important;
  }

  ::v-deep(.otp-digit-input .v-text-field__details) {
    padding: 0 !important;
  }
}

@media (max-width: 600px) {
  .otp-digit-input.v-text-field.v-text-field--enclosed
    > .v-input__control
    > .v-input__slot {
    padding: 0 !important;
  }

  .otp-digit-input .v-text-field__details {
    padding: 0 !important;
  }
}

</style>