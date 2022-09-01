const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
var moment = require('moment');
var conf = require('./conf')
const router = express.Router();
router.use(bodyParser.json());
// const sqlstr = 'SELECT * FROM classes';
// conf.query(sqlstr,(err,result)=>{
//     if(err)return console.log(err)
//     console.log(result)
//     console.log(moment(result[0].s_time).format('YYYY-MM-DD HH:mm:ss'));
// })

router.post('/', (req, res) => {
    res.send(req.body);
})

router.get('/getClassByMon', (req, res) => {
    var sqlstr = 'SELECT * FROM classes where s_time like "%' + req.query.mon + '%"';
    conf.query(sqlstr, (err, result) => {
        if (err) return res.json({ code: 0, msg: '查询失败', req })
        // 在signup表中查询每门课的报名人数
        result.forEach(item => {
            var sqlstr = 'SELECT count(*) as count FROM signup where c_id = ' + item.c_id;
            conf.query(sqlstr, (err, result) => {
                if (err) return res.json({ code: 0, msg: '查询失败', req })
                item.n_num = result[0].count;
            })
        })

        setTimeout(() => {
            res.json({ code: 1, msg: '查询成功', req: req.query, data: result })
        }, 10);
    })
})

router.post('/AddClass', (req, res) => {
    // res.send(req.body)
    var sqlstr = 'INSERT INTO classes (s_time,c_name,time_long,place,price,num) VALUES ("' + req.body.s_time + '","' + req.body.c_name + '","' + req.body.time_long + '","' + req.body.place + '","' + req.body.price + '","' + req.body.num + '")';
    conf.query(sqlstr, (err, result) => {
        if (err) return res.json({ code: 0, msg: '添加失败', req })
        res.json({ code: 1, msg: '添加成功', req: req.body, data: result })
    })
})

router.get('/getSignupUsers', (req, res) => {
    var sqlstr = 'SELECT * FROM signup where c_id = "' + req.query.c_id + '"';
    conf.query(sqlstr, (err, result) => {
        if (err) return res.json({ code: 0, msg: '查询失败', req })
        else {
            // 根据用户id检测用户是否在default表中，若有，则加上default字段为true，若无，则加上default字段为false
            result.forEach(item => {
                var sqlstr2 = 'SELECT * from def where u_id = "' + item.u_id + '" and c_id = "' + item.c_id + '"';
                conf.query(sqlstr2, (err2, result2) => {
                    if (err2) {
                        item.default = false;
                    }
                    else {
                        if (result2.length > 0) {
                            item.default = true;
                        } else {
                            item.default = false;
                        }
                    }

                })
            })
            // 等待所有query结束，再返回
            setTimeout(() => {
                res.json({ code: 1, msg: '查询成功', req: req.query, data: result })
            }, 10);
        }

    })
})


router.post('/addDefault', (req, res) => {
    var sqlstr = 'INSERT INTO def (u_id,c_name,s_time,c_id) VALUES ("' + req.body.u_id + '","' + req.body.c_name + '","' + req.body.s_time + '","' + req.body.c_id + '")';
    conf.query(sqlstr, (err, result) => {
        if (err) return res.json({ code: 0, msg: '添加失败', req })
        res.json({ code: 1, msg: '添加成功', req: req.body, data: result })
    })
})

router.post('/deleteDefault', (req, res) => {
    var sqlstr = 'DELETE FROM def WHERE u_id = "' + req.body.u_id + '" and c_id = "' + req.body.c_id + '"';
    conf.query(sqlstr, (err, result) => {
        if (err) return res.json({ code: 0, msg: '删除失败', req })
        res.json({ code: 1, msg: '删除成功', req: req.body, data: result })
    })
})

router.post('/login', (req, res) => {
    var sqlstr = 'select * from user where u_id = "' + req.body.u_id + '" and pwd = "' + req.body.pwd + '"';
    conf.query(sqlstr, (err, result) => {
        if (err) return res.json({ code: 0, msg: '登录失败', req })
        if (result.length > 0) {
            res.json({ code: 1, msg: '登录成功', req: req.body, data: result })
        } else {
            res.json({ code: 0, msg: '登录失败', req: req.body })
        }
    })
})


router.get('/isDefault', (req, res) => {
    var sqlstr = 'SELECT * from def where u_id = "' + req.query.u_id + '" and c_name = "' + req.query.c_name + '"';
    conf.query(sqlstr, (err, result) => {
        if (err) return res.json({ code: 0, msg: '查询失败', req })
        // 删除result中的非本月的数据
        result = result.filter(item => {
            return moment(item.s_time).format('YYYY-MM') == moment().format('YYYY-MM');
        })
        if (result.length > 1) {
            res.json({ code: 1, msg: '无报名权限', req: req.query, data: true })
        } else {
            res.json({ code: 1, msg: '有报名权限', req: req.query, data: false })
        }
    })
})

router.post('/signup', (req, res) => {
    // 将u_id,c_id,u_name,c_name,signup插入signup表中
    var sqlstr = 'INSERT INTO signup (u_id,c_id,u_name,c_name,signup) VALUES ("' + req.body.u_id + '","' + req.body.c_id + '","' + req.body.u_name + '","' + req.body.c_name + '","' + req.body.signup + '")';
    conf.query(sqlstr, (err, result) => {
        if (err) return res.json({ code: 0, msg: '报名失败', req })
        res.json({ code: 1, msg: '报名成功', req: req.body, data: result })
    })
})

router.post('/signdown', (req, res) => {
    // 根据u_id,c_id从signup表中删除字段
    var sqlstr = 'DELETE FROM signup WHERE u_id = "' + req.body.u_id + '" and c_id = "' + req.body.c_id + '"';
    conf.query(sqlstr, (err, result) => {
        if (err) return res.json({ code: 0, msg: '取消报名失败', req })
        res.json({ code: 1, msg: '取消报名成功', req: req.body, data: result })
    })
})






module.exports = router;