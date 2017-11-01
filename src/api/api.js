import axios from 'axios';

let base = 'http://localhost:8080';

export const jsonpRequest = (url, object, params, alertMsg) => {
    if (!alertMsg) {
        alertMsg = false
    }
    if (!params) {
        params = {}
    }
    var user = localStorage.getItem('user');
    if (user) {
        user = JSON.parse(user);
        if (user && user.uuid) {
            params.uuid = user.uuid;
        }
    }
    return object.$http.jsonp(`${base}` + url, {
        params: params
    }).then(res => {
        if (res && res.data && res.data.code == 1001) {
            return res.data;
        } else if (res && res.data && res.data.code == 1003) {
            //未登录
            if (res.data.failCode == 1) {
                object.$message.error(res.data.failMsg);
                localStorage.removeItem('user');
                localStorage.removeItem('lastVue');
                object.$router.push('/login');
            } else {
                alertMsg && object.$message.error(res.data.failMsg);
            }
        } else {
            alertMsg && object.$message.error("未知错误");
        }
        return res.data;
    });
};
