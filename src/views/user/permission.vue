<template>
  <el-row>
    <el-input placeholder="输入关键字进行过滤" v-model="filterText">
    </el-input>
    <el-tree class="filter-tree" :data="data" :props="defaultProps" show-checkbox node-key="id" default-expand-all :expand-on-click-node="false"
      :filter-node-method="filterNode" :render-content="renderContent" ref="tree2">
    </el-tree>
    <el-dialog title="新增权限" :visible.sync="addDialogVisible" width="30%" center>
      <el-form ref="form" :model="addPermission" label-width="80px">
        <el-form-item label="权限名称">
		  	  <el-input v-model="addPermission.permission_name"></el-input>
        </el-form-item>
        <el-form-item label="权限路径">
		  	  <el-input v-model="addPermission.permission_url"></el-input>
	    	</el-form-item>
        <el-form-item label="权限类别">
		    	<el-select v-model="addPermission.permission_type" placeholder="请选择权限类别">
             <el-option v-for="item in permissionTypeOptions" :key="item.value" :label="item.label" :value="item.value">
             </el-option>
		  	  </el-select>
		    </el-form-item>
        <el-form-item label="权限排序">
		  	  <el-input v-model="addPermission.permission_sortid"></el-input>
        </el-form-item>
     </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click.prevent="closeAddPermission">取 消</el-button>
        <el-button type="primary" @click.prevent="addOrEditPermission">确 定</el-button>
      </span>
    </el-dialog>
  </el-row>
</template>

<script>
import { jsonpRequest } from "../../api/api";
export default {
  data() {
    return {
      permissionTypeOptions: [
        {
          value: 1,
          label: "菜单权限"
        },
        {
          value: 2,
          label: "数据权限"
        }
      ],
      filterText: "",
      data: [],
      defaultProps: {
        children: "children",
        label: "label"
      },
      permission: null,
      removePermission: "",
      addDialogVisible: false,
      addPermission: {
        permission_url: "",
        permission_name: "",
        permission_type: "",
        permission_parentid: 0,
        permission_sortid: 0,
        permission_id: 0
      },
      currentStore: null,
      currentData: null,
      operationType: ""
    };
  },
  methods: {
    closeAddPermission() {
      this.addDialogVisible = false;
    },
    addOrEditPermission() {
      var addPermissionParams = {
        permissionId: this.addPermission.permission_id,
        permissionUrl: this.addPermission.permission_url,
        permissionName: this.addPermission.permission_name,
        permissionType: this.addPermission.permission_type,
        permissionSortid: this.addPermission.permission_sortid
      };
      if (this.addPermission.permission_name == "") {
        this.$message.error("请填写权限名称");
        return;
      }
      if (this.addPermission.permission_type == "") {
        this.$message.error("请填写权限类别");
        return;
      }
      if (this.operationType == "add") {
        addPermissionParams.permissionParentid = this.addPermission.permission_parentid;
        jsonpRequest("/user/addPermission", this, addPermissionParams, true)
          .then(resData => {
            if (resData.code == 1001) {
              this.$message.info("新增成功");
              window.this.currentStore.append(
                {
                  id: resData.permissionId,
                  label: addPermissionParams.permissionName,
                  permission_url: addPermissionParams.permissionUrl,
                  permission_sortid: addPermissionParams.permissionSortid,
                  permission_type: addPermissionParams.permissionType,
                  children: []
                },
                window.this.currentData
              );
              addPermissionParams.permissionId = resData.permissionId;

              this.addDialogVisible = false;
            }
          })
          .catch(() => {
            this.$message.error("新增失败");
          });
      } else if (
        this.addPermission.permission_url == this.currentData.permission_url &&
        this.addPermission.permission_name == this.currentData.label &&
        this.addPermission.permission_type ==
          this.currentData.permission_type &&
        this.addPermission.permission_sortid ==
          this.currentData.permission_sortid
      ) {
        this.$message.warning("未做任何修改");
        this.addDialogVisible = false;
      } else {
        jsonpRequest("/user/editPermission", this, addPermissionParams, true)
          .then(resData => {
            if (resData.code == 1001) {
              this.$message.info("修改成功");
              window.this.currentData.label =
                addPermissionParams.permissionName;
              window.this.currentData.permission_type =
                addPermissionParams.permissionType;
              window.this.currentData.permission_sortid =
                addPermissionParams.permissionSortid;
              window.this.currentData.permission_url =
                addPermissionParams.permissionUrl;
              this.addDialogVisible = false;
            }
          })
          .catch(() => {
            this.$message.error("修改失败");
          });
      }
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    append(store, data) {
      this.addDialogVisible = true;
      this.currentStore = store;
      this.currentData = data;
      this.addPermission.permission_parentid = data.id;
      this.operationType = "add";
    },
    edit(store, data) {
      this.addDialogVisible = true;
      this.addPermission.permission_url = data.permission_url;
      this.addPermission.permission_name = data.label;
      this.addPermission.permission_type = data.permission_type;
      this.addPermission.permission_sortid = data.permission_sortid;
      this.addPermission.permission_id = data.id;
      this.currentStore = store;
      this.currentData = data;
      this.operationType = "edit";
    },
    remove(store, data) {
      this.$confirm("确认要删除吗?", "提示", { type: "warning" }).then(() => {
        jsonpRequest(
          "/user/removePermission",
          this,
          { permissionId: data.id },
          true
        ).then(resData => {
          if (resData.code == 1001) {
            store.remove(data);
            this.$message.info("删除成功");
          }
        });
      });
    },
    renderContent(h, { node, data, store }) {
      if (data.id == 0) {
        return (
          <span>
            <span>
              <span>{node.label}</span>
            </span>
            <span style="float: right; margin-right: 20px">
              <el-button
                type="primary"
                size="mini"
                on-click={() => this.append(store, data)}
              >
                新增子权限
              </el-button>
            </span>
          </span>
        );
      } else
        return (
          <span>
            <span>
              <span>{node.label}</span>
            </span>
            <span style="float: right; margin-right: 20px">
              <el-button
                type="primary"
                size="mini"
                on-click={() => this.append(store, data)}
              >
                新增子权限
              </el-button>
              <el-button
                type="success"
                size="mini"
                on-click={() => this.edit(store, data)}
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                size="mini"
                on-click={() => this.remove(store, data)}
              >
                删除
              </el-button>
            </span>
          </span>
        );
    },
    fillChildrenPemission(parentId, permissionArray, allPermission) {
      if (allPermission && allPermission.length > 0) {
        var childPermissions = allPermission.filter(function(item) {
          return item.permissionParentid == parentId;
        });
        if (childPermissions && childPermissions.length > 0) {
          childPermissions.forEach(function(currentPermission) {
            currentPermission.children = [];
            permissionArray.push({
              id: currentPermission.permissionId,
              label: currentPermission.permissionName,
              children: currentPermission.children,
              permission_url: currentPermission.permissionUrl,
              permission_sortid: currentPermission.permissionSortid,
              permission_type: currentPermission.permissionType
            });
            window.this.fillChildrenPemission(
              currentPermission.permissionId,
              currentPermission.children,
              allPermission
            );
          });
        }
      }
    },
    formatPermissionData(permissions) {
      var formatedPermission = [
        {
          id: 0,
          label: "全部权限",
          children: [],
          permission_url: "",
          permission_sortid: 0,
          permission_type: ""
        }
      ];
      if (permissions && permissions.length > 0) {
        this.fillChildrenPemission(
          0,
          formatedPermission[0].children,
          permissions
        );
      }
      return formatedPermission;
    },
    queryAllPermission() {
      jsonpRequest("/user/queryAllPermission", this, null, true).then(data => {
        if (data.code == 1001) {
          window.this.permission = data.permissionList;
          window.this.data = window.this.formatPermissionData(
            data.permissionList
          );
        }
      });
    }
  },
  mounted: function() {
    window.this = this;
    this.queryAllPermission();
  },
  watch: {
    addDialogVisible: function(val) {
      if (!val) {
        this.addPermission.permission_url = "";
        this.addPermission.permission_name = "";
        this.addPermission.permission_type = "";
        this.addPermission.permission_parentid = 0;
        this.addPermission.permission_sortid = 0;
        this.addPermission.permission_id = 0;
        this.currentStore = null;
        this.currentData = null;
        this.operationType = "";
      }
    },
    filterText(val) {
      this.$refs.tree2.filter(val);
    }
  }
};
</script>

