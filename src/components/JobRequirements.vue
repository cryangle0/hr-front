<template>
  <div style="height: 100%; display: flex; flex-direction: column;">
    <el-card style="flex: 1; position: relative;">
      <div class="header">
        <h2>招聘岗位</h2>
        <el-button type="primary" @click="addPosition" style="position: absolute; top: 20px; right: 20px;">添加</el-button>
      </div>
      <hr class="divider" />
      <div v-if="showForm" class="form-container">
        <el-form :model="form" label-width="120px" label-position="top">
          <el-form-item label="岗位名称">
            <el-input v-model="form.positionName"></el-input>
          </el-form-item>
          <el-form-item label="岗位jd">
            <el-input type="textarea" v-model="form.positionJD"></el-input>
          </el-form-item>
          <el-form-item label="企业信息">
            <el-input type="textarea" v-model="form.companyInfo"></el-input>
          </el-form-item>
          <el-form-item label="个性化设置">
            <el-input type="textarea" v-model="form.customSettings"></el-input>
          </el-form-item>
          <div class="button-container">
            <el-button type="primary" size="large" @click="handleSave">保存</el-button>
          </div>
        </el-form>
      </div>
      <div v-else>
        <el-table v-if="positions.length" :data="positions" style="width: 100%; flex: 1; overflow-y: auto;">
          <el-table-column prop="position_name" label="岗位名称"></el-table-column>
          <el-table-column label="操作" align="center">
            <template #header>
              <div class="centered-header">操作</div>
            </template>
            <template #default="{ row }">
              <div class="action-buttons">
                <el-tooltip content="编辑" placement="top">
                  <el-button @click="editPosition(row)" circle>
                    <el-icon><Edit /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="删除" placement="top">
                  <el-button @click="deletePosition(row)" circle type="danger">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无招聘岗位~"></el-empty>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance, onMounted } from 'vue';
import { ElLoading, ElMessage } from 'element-plus';
import { Edit, Delete } from '@element-plus/icons-vue';

const { proxy } = getCurrentInstance();

const showForm = ref(false);
const form = ref({
  positionName: '',
  positionJD: '',
  companyInfo: '',
  customSettings: '',
});

const positions = ref([]);
const editingIndex = ref(null);

const fetchPositions = async () => {
  try {
    const response = await proxy.$api.getJobRequirements();
    positions.value = response.data;
  } catch (error) {
    console.error('Failed to fetch positions:', error);
  }
};

const addPosition = () => {
  resetForm();
  showForm.value = true;
  editingIndex.value = null;
};

const handleSave = async () => {
  const loading = ElLoading.service({
    lock: true,
    text: '保存中...',
    spinner: 'el-icon-loading',
    background: 'rgba(0, 0, 0, 0.7)',
  });

  try {
    const data = {
      position_name: form.value.positionName,
      position_jd: form.value.positionJD,
      company_info: form.value.companyInfo,
      custom_settings: form.value.customSettings,
    };
    if (editingIndex.value !== null) {
      await proxy.$api.updateJobRequirement(positions.value[editingIndex.value].id, data);
      positions.value[editingIndex.value] = {
        ...positions.value[editingIndex.value],
        ...data,
      };
    } else {
      const response = await proxy.$api.createJobRequirement(data);
      positions.value.unshift(response.data);
    }
    ElMessage({
      message: '保存成功',
      type: 'success',
      duration: 2000,
    });
    showForm.value = false;
  } catch (error) {
    console.error('Failed to save position:', error);
    ElMessage({
      message: '保存失败',
      type: 'error',
      duration: 2000,
    });
  } finally {
    loading.close();
  }
};

const editPosition = (row) => {
  form.value = {
    positionName: row.position_name,
    positionJD: row.position_jd,
    companyInfo: row.company_info,
    customSettings: row.custom_settings,
  };
  showForm.value = true;
  editingIndex.value = positions.value.indexOf(row);
};

const deletePosition = async (row) => {
  const loading = ElLoading.service({
    lock: true,
    text: '删除中...',
    spinner: 'el-icon-loading',
    background: 'rgba(0, 0, 0, 0.7)',
  });

  try {
    await proxy.$api.deleteJobRequirement(row.id);
    positions.value = positions.value.filter(position => position.id !== row.id);
    ElMessage({
      message: '删除成功',
      type: 'success',
      duration: 2000,
    });
  } catch (error) {
    console.error('Failed to delete position:', error);
    ElMessage({
      message: '删除失败',
      type: 'error',
      duration: 2000,
    });
  } finally {
    loading.close();
  }
};

const resetForm = () => {
  form.value.positionName = '';
  form.value.positionJD = '';
  form.value.companyInfo = '';
  form.value.customSettings = '';
};

onMounted(fetchPositions);
</script>

<style scoped lang="less">
.el-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.header {
  text-align: center;
  margin-bottom: 10px;
}

.upload-section {
  position: absolute;
  top: 20px;
  right: 20px;
}

.divider {
  border: 0;
  border-top: 1px solid #e0e0e0;
  margin: 20px 0; /* 调整上下间距 */
}

.el-table {
  flex: 1;
  overflow-y: auto;
}

.el-table th.gutter {
  width: 0 !important;
}

.resume-cell {
  display: flex;
  align-items: center;
}

.icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
  vertical-align: middle;
}

.el-button {
  display: flex;
  justify-content: center;
  align-items: center;
  vertical-align: middle;
}

.el-button .el-icon {
  font-size: 18px; /* 调整图标大小，使其更容易对齐 */
}

.el-button:hover {
  background-color: #f2f2f2;
}

.centered-header {
  text-align: center;
  width: 100%;
}

.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
}

.action-buttons .el-button {
  margin: 0 5px;
}

.button-container {
  display: flex;
  justify-content: center; /* 使保存按钮居中 */
  margin-top: 20px;
}
</style>
