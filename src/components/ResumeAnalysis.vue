<template>
  <div class="container">
    <el-card class="el-card">
      <div class="header">
        <h2>简历分析</h2>
      </div>
      <hr class="divider" />
      <el-tabs v-model="activeTab" class="el-tabs">
        <el-tab-pane label="分析结果" name="results">
          <!-- 分析结果内容 -->
          <div class="content" v-if="computedAnalysisResult && Object.keys(computedAnalysisResult).length">
            <!-- 一、匹配度 -->
            <div class="section">
              <h3>一、匹配度</h3>
              <div id="gauge-chart" class="chart"></div>
            </div>

            <!-- 二、胜任力分析 -->
            <div class="section">
              <h3>二、胜任力分析</h3>
              <p>{{ computedAnalysisResult.competency_summary || '无数据' }}</p>
              <div id="radar-chart" class="chart"></div>
            </div>

            <!-- 三、关键技能匹配度（热力图） -->
            <div class="section">
              <h3>三、关键技能匹配度</h3>
              <div id="heatmap-chart" class="chart"></div>
            </div>

            <!-- 四、工作经历相关性（条形图） -->
            <div class="section">
              <h3>四、工作经历相关性</h3>
              <div id="experience-chart" class="chart"></div>
            </div>

            <!-- 五、职业稳定性、发展趋势 -->
            <div class="section">
              <h3>五、职业稳定性、发展趋势</h3>
              <el-table :data="tableDataFromObject(computedAnalysisResult.stability_chart)">
                <el-table-column prop="name" label="公司" />
                <el-table-column prop="value" label="稳定性得分"/>
              </el-table>
            </div>

            <!-- 六、详细分析 -->
            <div class="section">
              <h3>六、详细分析</h3>
              <el-table :data="tableDataFromObject(computedAnalysisResult.detailed_analysis)">
                <el-table-column prop="name" label="分析项目" />
                <el-table-column prop="value" label="内容" />
              </el-table>
            </div>

            <!-- 七、经验相关性 -->
            <div class="section">
              <h3>七、经验相关性</h3>
              <el-table :data="tableDataFromObject(computedAnalysisResult.experience_relevance)">
                <el-table-column prop="name" label="经验" />
                <el-table-column prop="value" label="相关性" />
              </el-table>
            </div>

            <!-- 八、总结 -->
            <div class="section">
              <h3>八、总结</h3>
              <p>{{ computedAnalysisResult.overall_summary || '无数据' }}</p>
            </div>
          </div>
          <div v-else>
            <p>没有分析结果</p>
          </div>
        </el-tab-pane>

        <el-tab-pane label="面试助手" name="guidance">
          <!-- 面试指引内容 -->
          <div class="content" v-if="computedAnalysisResult && Object.keys(computedAnalysisResult).length">
            <ul class="recommendation-list">
              <li v-for="(recommendation, index) in computedAnalysisResult.recommendations" :key="index">
                {{ recommendation }}
              </li>
            </ul>
          </div>
          <div v-else>
            <p>没有面试指引</p>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  analysisResult: {
    type: Object,
    default: () => ({}),
  },
});

const activeTab = ref('results');

// 使用 computed 以确保获取到最新的 analysisResult
const computedAnalysisResult = computed(() => {
  return props.analysisResult || {};
});

const tableDataFromObject = (obj) => {
  return Object.keys(obj).map(key => ({
    name: key,
    value: obj[key],
  }));
};

// 初始化仪表盘图
const initGaugeChart = () => {
  const chartDom = document.getElementById('gauge-chart');
  if (chartDom) {
    const myChart = echarts.init(chartDom);
    const option = {
      series: [{
        type: 'gauge',
        startAngle: 90,
        endAngle: -270,
        pointer: {
          show: false
        },
        progress: {
          show: true,
          overlap: false,
          roundCap: true,
          clip: false,
          itemStyle: {
            borderWidth: 1,
            borderColor: '#464646'
          }
        },
        axisLine: {
          lineStyle: {
            width: 40
          }
        },
        splitLine: {
          show: false,
          distance: 0,
          length: 10
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: false,
          distance: 50
        },
        data: [{
          value: computedAnalysisResult.value?.match_percentage || 0,
          name: '匹配度',
          title: {
            offsetCenter: ['0%', '-30%']
          },
          detail: {
            width: 50,
            height: 14,
            fontSize: 40,
            color: 'auto',
            formatter: '{value}%',
            offsetCenter: ['0%', '0%']
          }
        }],
        title: {
          fontSize: 20
        },
        detail: {
          width: 50,
          height: 14,
          fontSize: 20,
          color: 'auto',
          formatter: '{value}%',
          offsetCenter: ['0%', '0%']
        }
      }]
    };
    myChart.setOption(option);
  }
};

// 初始化雷达图
const initRadarChart = () => {
  const chartDom = document.getElementById('radar-chart');
  if (chartDom) {
    const myChart = echarts.init(chartDom);
    const option = {
      radar: {
        indicator: Object.keys(computedAnalysisResult.value.radar_chart || {}).map(key => ({name: key, max: 1}))
      },
      series: [{
        name: '胜任力分析',
        type: 'radar',
        data: [{
          value: Object.values(computedAnalysisResult.value.radar_chart || {}),
          name: '胜任力'
        }]
      }]
    };
    myChart.setOption(option);
  }
};

// 初始化热力图
const initHeatmapChart = () => {
  const chartDom = document.getElementById('heatmap-chart');
  if (chartDom) {
    const myChart = echarts.init(chartDom);
    const skills = Object.keys(computedAnalysisResult.value.heatmap || {});
    const scores = Object.values(computedAnalysisResult.value.heatmap || {});

    const data = scores.map((score, index) => [index, 0, score]);

    const option = {
      tooltip: {
        position: 'top'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: skills
      },
      yAxis: {
        type: 'category',
        data: ['Skills']
      },
      visualMap: {
        min: 0,
        max: 1,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '15%',
        inRange: {
          color: ['#d94e5d','#eac736','#50a3ba'].reverse()  // 颜色从低到高变化
        }
      },
      series: [{
        name: 'Skill Matching',
        type: 'heatmap',
        data: data,
        label: {
          show: true,
          formatter: '{c}'
        },
        itemStyle: {
          emphasis: {
            borderColor: '#333',
            borderWidth: 1
          }
        }
      }]
    };
    myChart.setOption(option);
  }
};


// 初始化条形图
const initExperienceChart = () => {
  const chartDom = document.getElementById('experience-chart');
  if (chartDom) {
    const myChart = echarts.init(chartDom);
    const companies = Object.keys(computedAnalysisResult.value.experience_chart || {});
    const relevance = Object.values(computedAnalysisResult.value.experience_chart || {});
    const option = {
      tooltip: {},
      xAxis: {
        type: 'category',
        data: companies
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        data: relevance,
        type: 'bar',
        itemStyle: {
          color: '#5470C6'
        }
      }]
    };
    myChart.setOption(option);
  }
};

// 监听 analysisResult 的变化，并在变化时更新图表
watch(computedAnalysisResult, (newVal) => {
  console.log('Received analysisResult in watch:', newVal);
  if (activeTab.value === 'results') {
    setTimeout(() => {
      initGaugeChart();
      initRadarChart();
      initHeatmapChart();
      initExperienceChart();
    }, 0);
  }
}, {deep: true});

onMounted(() => {
  if (activeTab.value === 'results') {
    initGaugeChart();
    initRadarChart();
    initHeatmapChart();
    initExperienceChart();
  }
});
</script>

<style scoped lang="less">
.container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.el-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  text-align: center;
  margin-bottom: 10px;
}

.divider {
  border: 0;
  border-top: 1px solid #e0e0e0;
  margin: 20px 0; /* 调整上下间距 */
}

.el-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.el-tab-pane {
  flex: 1;
  overflow-y: auto;
  height: calc(100vh - 300px); /* 确保tabs高度，调整这个值以适应你的布局 */
}

.content {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.recommendation-list {
  list-style: none; /* 去掉默认的列表样式 */
  padding-left: 0;
  margin-left: 20px;
}

.recommendation-list li {
  margin-bottom: 10px;
  padding-left: 10px;
  position: relative;
  line-height: 1.6;
  font-size: 16px;
  color: #333;
}

.recommendation-list li::before {
  content: '✔'; /* 使用图标标记 */
  position: absolute;
  left: -20px;
  color: #409eff; /* 使用主题颜色 */
  font-size: 14px;
  line-height: 1.6;
}

h3 {
  margin-bottom: 10px;
}

.el-table {
  margin-top: 20px;
}
</style>
