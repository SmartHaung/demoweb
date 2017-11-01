<template>
  <el-form :model="loginForm" :rules="rules2" ref="loginForm" label-position="left" label-width="0px" class="demo-ruleForm login-container">
    <h3 class="title">系统登录</h3>
    <el-form-item prop="account">
       <el-input type="text" v-model="loginForm.account" auto-complete="off" placeholder="账号(编号/姓名/昵称/手机号/邮箱)"></el-input>
    </el-form-item>
    <el-form-item prop="password">
      <el-input type="password" v-model="loginForm.password" auto-complete="off" placeholder="密码"></el-input>
    </el-form-item>
    <el-form-item style="width:100%;">
      <el-button type="primary" style="width:100%;" @click.native.prevent="handleSubmit" :loading="logining">登录</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { jsonpRequest } from "../api/api";
export default {
  data() {
    return {
      elementIndex: 0,
      url: "",
      logining: false,
      loginForm: {
        account: "",
        password: ""
      },
      rules2: {
        account: [{ required: true, message: "请输入账号", trigger: "blur" }],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }]
      },
      checked: true
    };
  },
  methods: {
    hasChildVisibaleOrItsefVisible(element, perminsStrlist, _this) {
      if (element.children) {
        var flag = false;
        element.children.forEach(function(childElement) {
          if (
            _this.hasChildVisibaleOrItsefVisible(
              childElement,
              perminsStrlist,
              _this
            )
          ) {
            flag = true;
          }
        });
        element.hidden = !flag;
        return flag;
      } else {
        var flag = false;
        for (var index = 0; index < perminsStrlist.length; index++) {
          if (element.name == perminsStrlist[index]) {
            flag = true;
            break;
          }
        }
        if (_this.elementIndex == 0 && flag) {
          _this.url = element.path;
          _this.elementIndex++;
        }
        element.hidden = !flag;
        return flag;
      }
    },
    handleSubmit(ev) {
      var _this = this;
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.logining = true;
          var loginParams = {
            account: this.loginForm.account,
            password: this.loginForm.password
          };
          jsonpRequest("/user/login", this, loginParams, true).then(data => {
            this.logining = false;
            if (data.code == 1001) {
              localStorage.setItem(
                "user",
                JSON.stringify({ uuid: data.uuid, userInfo: data.userInfo })
              );
              if (
                data.userInfo &&
                data.userInfo.perminsStrlist &&
                data.userInfo.perminsStrlist.length > 0
              ) {
                if (
                  this.$router.options &&
                  this.$router.options.routes &&
                  this.$router.options.routes.length > 0
                ) {
                  this.$router.options.routes.forEach(function(element) {
                    _this.hasChildVisibaleOrItsefVisible(
                      element,
                      data.userInfo.perminsStrlist,
                      _this
                    );
                  });
                }
                this.$router.push({ path: _this.url });
              }
            }
          });
        } else {
          return false;
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.login-container {
  -webkit-border-radius: 5px;
  border-radius: 5px;
  -moz-border-radius: 5px;
  background-clip: padding-box;
  margin: 180px auto;
  width: 350px;
  padding: 35px 35px 15px 35px;
  background: #fff;
  border: 1px solid #eaeaea;
  box-shadow: 0 0 25px #cac6c6;
  .title {
    margin: 0px auto 40px auto;
    text-align: center;
    color: #505458;
  }
  .remember {
    margin: 0px 0px 35px 0px;
  }
}
</style>