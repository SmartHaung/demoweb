import Login from './views/Login.vue'
import NotFound from './views/404.vue'
import Home from './views/Home.vue'
import permission from './views/user/permission.vue'
import role from './views/user/role.vue'


let routes = [{
        path: '/login',
        component: Login,
        name: '',
        hidden: true
    },
    {
        path: '/404',
        component: NotFound,
        name: '',
        hidden: true
    },
    {
        path: '/',
        component: Home,
        name: '用户管理',
        iconCls: 'fa fa-id-card-o',
        children: [{
            path: '/permission',
            component: permission,
            name: '权限管理'
        }, {
            path: '/role',
            component: role,
            name: '角色管理'
        }]
    },
    {
        path: '/',
        component: Home,
        name: '',
        iconCls: 'fa fa-address-card',
        children: []
    },
    {
        path: '/',
        component: Home,
        name: 'Charts',
        iconCls: 'fa fa-bar-chart',
        children: [

        ]
    },
    {
        path: '*',
        hidden: true,
        redirect: {
            path: '/404'
        }
    }
];

export default routes;

function hasChildVisibaleOrItsefVisible(element, perminsStrlist) {
    if (element.children) {
        var flag = false;
        element.children.forEach(function (childElement) {
            if (hasChildVisibaleOrItsefVisible(childElement, perminsStrlist)) {
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
        element.hidden = !flag;
        return flag;
    }
}

var user = localStorage.getItem('user');
if (user) {
    var data = JSON.parse(user);
    if (data.userInfo && data.userInfo.perminsStrlist && data.userInfo.perminsStrlist.length > 0) {
        if (routes.length > 0) {
            routes.forEach(function (element) {
                hasChildVisibaleOrItsefVisible(element, data.userInfo.perminsStrlist);
            });
        }
    }
} else {
    routes.push({
        path: "/login"
    });
}