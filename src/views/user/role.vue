<template>
  <section>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-select v-model="filters.role" filterable placeholder="角色">
            <el-option value="">清空筛选</el-option>
            <el-option v-for="item in filters.resourceRoles" :key="item.roleName" :label="item.roleName" :value="item.roleId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="filters.permission" filterable placeholder="权限">
            <el-option value="">清空筛选</el-option>
            <el-option v-for="item in filters.resourcePermissons" :key="item.permissionName" :label="item.permissionName" :value="item.permissionId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="filters.user" filterable remote reserve-keyword placeholder="人员(编号/昵称/姓名/邮箱/手机)" :remote-method="filterUser"
            :loading="loading">
            <el-option value="">清空筛选</el-option>
            <el-option v-for="item in filters.resourceUsers" :key="item.userId" :label="item.userTruename+'('+item.userId+')'" :value="item.userId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryRole">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addRole">新增</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <el-col>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column label="角色名称" width="180">
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ scope.row.roleName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建人" width="180">
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ scope.row.userTruename }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ formatDate(scope.row.roleCreatedate.time)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="editRole(scope.row)">编辑角色</el-button>
            <el-button size="mini" type="warning" @click="editPermission(scope.row.roleId)">编辑权限</el-button>
            <el-button size="mini" type="success" @click="editUser(scope.row.roleId)">编辑成员</el-button>
            <el-button size="mini" type="danger" @click="deleteRole(scope.row.roleId)">删除角色</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="[5, 10, 15, 20]"
        :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-col>
    <el-dialog title="编辑权限" :visible.sync="dialogEditPermission">
      <el-row>
        <el-col :span="20">
          <el-input placeholder="输入关键字进行过滤" v-model="filterText">
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="success" @click="savePermission()" style="float:right">保存修改</el-button>
        </el-col>
      </el-row>
      <el-tree ref="tree" check-strictly :data="treeDate" show-checkbox node-key="id" :default-expanded-keys="[0]" :filter-node-method="filterNode"
        :props="defaultProps">
      </el-tree>
    </el-dialog>
    <el-dialog title="编辑成员" :visible.sync="dialogEditUser">
      <el-row>
        <el-col :span="8">
          <el-select v-model="editfilters.user" @change="queryUserIsInRole" filterable remote reserve-keyword placeholder="人员(编号/昵称/姓名/邮箱/手机)" :remote-method="filterEditUser"
            :loading="editUserloading">
            <el-option value="">清空筛选</el-option>
            <el-option v-for="item in editfilters.resourceUsers" :key="item.userId" :label="item.userTruename+'('+item.userId+')'" :value="item.userId">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-tag type="success" v-if="userInRole">该用户已经在角色内</el-tag>
          <el-tag type="danger" v-if="userNotInRole">该用户还未在在角色内</el-tag>
        </el-col>
        <el-col :span="8">
          <el-button type="warning" v-if="userInRole" @click="removeUserFromRole()">移除</el-button>
          <el-button type="success" v-if="userNotInRole" @click="addUserIntoRole()">添加</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </section>
</template>

<script>
import { jsonpRequest } from "../../api/api";
import util from "../../common/js/util";
util.formatDate.format(new Date(), "yyyy-MM-dd");
export default {
  data() {
    return {
      treeDate: [],
      rolePermission: [],
      defaultProps: {
        children: "children",
        label: "label"
      },
      editfilters: {
        user: "",
        resourceUsers: []
      },
      filters: {
        role: "",
        permission: "",
        user: "",
        resourceUsers: [],
        resourceRoles: [],
        resourcePermissons: []
      },
      filterText: "",
      loading: false,
      editUserloading: false,
      tableData: [],
      total: 0,
      pageSize: 5,
      currentPage: 1,
      dialogEditPermission: false,
      dialogEditUser: false,
      roleId: 0,
      userInRole: false,
      userNotInRole: false
    };
  },
  methods: {
    queryUserIsInRole() {
      if (
        this.editfilters.user &&
        this.editfilters.user != 0 &&
        this.roleId &&
        this.roleId != 0
      ) {
        jsonpRequest(
          "/user/countUserInRole",
          this,
          {
            roleId: this.roleId,
            userId: this.editfilters.user
          },
          true
        ).then(resData => {
          if (resData.code == 1001) {
            resData.count > 0
              ? (this.userInRole = true)
              : (this.userNotInRole = true);
          }
        });
      }
    },
    removeUserFromRole() {
      if (
        this.editfilters.user &&
        this.editfilters.user != 0 &&
        this.roleId &&
        this.roleId != 0
      ) {
        jsonpRequest(
          "/user/removeUserFromRole",
          this,
          {
            roleId: this.roleId,
            userId: this.editfilters.user
          },
          true
        ).then(resData => {
          if (resData.code == 1001) {
            this.userInRole = false;
            this.userNotInRole = true;
            window.this.$message.info("删除成功");
          }
        });
      } else {
        this.$message.error("删除成功");
      }
    },
    addUserIntoRole() {
      if (
        this.editfilters.user &&
        this.editfilters.user != 0 &&
        this.roleId &&
        this.roleId != 0
      ) {
        jsonpRequest(
          "/user/addUserIntoRole",
          this,
          {
            roleId: this.roleId,
            userId: this.editfilters.user
          },
          true
        ).then(resData => {
          if (resData.code == 1001) {
            this.userInRole = true;
            this.userNotInRole = false;
            window.this.$message.info("添加成功");
          }
        });
      } else {
        this.$message.error("添加成功");
      }
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    savePermission() {
      jsonpRequest(
        "/user/editRolePermission",
        this,
        {
          roleId: this.roleId,
          selectPermissions: JSON.stringify(this.$refs.tree.getCheckedKeys())
        },
        true
      ).then(resData => {
        if (resData.code == 1001) {
          this.$message.info("保存成功");
          this.dialogEditPermission = false;
        }
      });
    },
    addRole() {
      this.$prompt("请输入角色名称", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      }).then(({ value }) => {
        jsonpRequest(
          "/user/addRole",
          this,
          {
            roleName: value
          },
          true
        ).then(resData => {
          if (resData.code == 1001) {
            window.this.$message.info("新增成功");
            window.this.queryRole();
          }
        });
      });
    },
    editRole(roleData) {
      this.$prompt("请输入角色名称", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      }).then(({ value }) => {
        jsonpRequest(
          "/user/editRole",
          this,
          {
            roleId: roleData.roleId,
            roleName: value
          },
          true
        ).then(resData => {
          if (resData.code == 1001) {
            window.this.$message.info("修改成功");
            roleData.roleName = value;
          }
        });
      });
    },
    editPermission(roleId) {
      this.roleId = roleId;
      this.dialogEditPermission = true;
      if (!this.treeDate || this.treeDate.length == 0) {
        jsonpRequest(
          "/user/queryAllPermission",
          this,
          null,
          true
        ).then(data => {
          if (data.code == 1001) {
            window.this.treeDate = window.this.formatPermissionData(
              data.permissionList
            );
          }
        });
      }
      this.queryPermissionByRoleid(roleId);
    },
    queryPermissionByRoleid(roleId) {
      jsonpRequest(
        "/user/queryPermissionByRoleId",
        this,
        {
          roleId: roleId
        },
        true
      ).then(data => {
        if (data.code == 1001) {
          if (data.permissionList && data.permissionList.length > 0) {
            data.permissionList.forEach(function(currentPermission) {
              window.this.rolePermission.push(currentPermission.permissionId);
            });
          }
          window.this.$refs.tree.setCheckedKeys(window.this.rolePermission);
        }
      });
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
              children: currentPermission.children
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
          children: []
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
    editUser(roleId) {
      this.roleId = roleId;
      this.dialogEditUser = true;
    },
    deleteRole(roleId) {
      jsonpRequest(
        "/user/removeRole",
        this,
        {
          roleId: roleId
        },
        true
      ).then(resData => {
        if (resData.code == 1001) {
          window.this.$message.info("删除成功");
          window.this.queryRole();
        }
      });
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.queryRole();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.queryRole();
    },
    filterEditUser(query) {
      this.userInRole = false;
      this.userNotInRole = false;
      this.filterUser(query, true);
    },
    filterUser(query, isEidt) {
      if (query !== "") {
        isEidt ? (this.editUserloading = true) : (this.loading = true);
        setTimeout(() => {
          isEidt ? (this.editUserloading = false) : (this.loading = false);
          jsonpRequest(
            "/user/queryFilterUser",
            this,
            {
              filterString: query
            },
            true
          ).then(resData => {
            if (resData.code == 1001) {
              isEidt
                ? (this.editfilters.resourceUsers = resData.users)
                : (this.filters.resourceUsers = resData.users);
            }
          });
        }, 200);
      } else {
        isEidt ? (this.editfilters.user = "") : (this.filters.user = "");
      }
    },
    queryAllPermission() {
      jsonpRequest("/user/queryAllPermission", this, null, true).then(data => {
        if (data.code == 1001) {
          window.this.filters.resourcePermissons = data.permissionList;
        }
      });
    },
    queryAllRole() {
      jsonpRequest("/user/queryAllRole", this, null, true).then(data => {
        if (data.code == 1001) {
          window.this.filters.resourceRoles = data.roleList;
        }
      });
    },
    queryRole() {
      jsonpRequest(
        "/user/queryRole",
        this,
        {
          role: this.filters.role,
          permission: this.filters.permission,
          user: this.filters.user,
          pageSize: this.pageSize,
          currentPage: this.currentPage
        },
        true
      ).then(data => {
        if (data.code == 1001) {
          window.this.total = data.total;
          window.this.tableData = data.roleList;
        }
      });
    },
    formatDate(date) {
      return util.formatDate.format(new Date(date), "yyyy-MM-dd hh:mm:ss");
    },
    init() {
      this.queryAllPermission();
      this.queryAllRole();
      this.queryRole();
    }
  },
  mounted: function() {
    window.this = this;
    this.init();
  },
  watch: {
    dialogEditPermission: function(val) {
      if (!val) {
        this.rolePermission = [];
        this.filterText = "";
        this.roleId = 0;
      }
    },
    dialogEditUser: function(val) {
      if (!val) {
        this.roleId = 0;
        this.editfilters.user = "";
        this.userInRole = false;
        this.userNotInRole = false;
      }
    },
    filterText(val) {
      this.userInRole = false;
      this.userNotInRole = false;
      this.$refs.tree.filter(val);
    },
    editfilters: function() {
      alert(1);
    }
  }
};
</script>