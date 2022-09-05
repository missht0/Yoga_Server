const path = require('path');
const cors = require('cors');
// 导入express
const express = require('express');
const compression = require('compression');

// 创建express实例
const app = express();
// 导入路由模块
const router = require('./router');
// 注册路由模块
app.use(compression());
app.use(router);
app.use(cors());  //允许跨域
// 调用监听函数
app.listen(8000, () => {
    console.log('server is running at port 8000');
    }
);
// 静态资源目录
// app.use(express.static(path.join(__dirname,'/public')));
app.use(express.static('../Yoga/dist'));


