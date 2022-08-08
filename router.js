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
        if (err) return res.json({code:0,msg:'查询失败',req})
        // 在signup表中查询每门课的报名人数
        result.forEach(item => {
            var sqlstr = 'SELECT count(*) as count FROM signup where c_id = ' + item.c_id;
            conf.query(sqlstr, (err, result) => {
                if (err) return res.json({code:0,msg:'查询失败',req})
                item.num = result[0].count;
            })
        })

        setTimeout(() => {
            res.json({code:1,msg:'查询成功',req:req.query,data:result})
        }, 10);
    })  
})

router.post('/AddClass', (req, res) => {
    // res.send(req.body)
    var sqlstr = 'INSERT INTO classes (s_time,c_name,time_long,place,price,num) VALUES ("' + req.body.s_time + '","' + req.body.c_name + '","' + req.body.time_long + '","' + req.body.place + '","' + req.body.price + '","' + req.body.num + '")';
    conf.query(sqlstr, (err, result) => {
        if (err) return res.json({code:0,msg:'添加失败',req})
        res.json({code:1,msg:'添加成功',req:req.body,data:result})
    })
})

router.get('/information/getSignupUsers', (req, res) => {
    var sqlstr = 'SELECT * FROM signup where c_id = "' + req.query.c_id + '"';
    conf.query(sqlstr, (err, result) => {
        if (err) return res.json({code:0,msg:'查询失败',req})
        else{
            // 根据用户id检测用户是否在default表中，若有，则加上default字段为true，若无，则加上default字段为false
            result.forEach(item => {
                var sqlstr2 = 'SELECT * from def where u_id = "' + item.u_id + '" and c_name = "' + item.c_name + '"';
                conf.query(sqlstr2, (err2, result2) => {
                    if (err2) {
                        item.default = false;
                    }
                    else{
                        if(result2.length > 0){
                            item.default = true;
                        }else{
                            item.default = false;
                        }
                    }
                    
                })
            })
            // 等待所有query结束，再返回
            setTimeout(() => {
                res.json({code:1,msg:'查询成功',req:req.query,data:result})
            }, 10);
        }
        
    })
})


router.post('/information/addDefault', (req, res) => {
    var sqlstr = 'INSERT INTO def (u_id,c_name) VALUES ("' + req.body.u_id + '","' + req.body.c_name + '")';
    conf.query(sqlstr, (err, result) => {
        if (err) return res.json({code:0,msg:'添加失败',req})
        res.json({code:1,msg:'添加成功',req:req.body,data:result})
    })
})


router.post('/login/login', (req, res) => {
    var sqlstr = 'select * from user where u_id = "' + req.body.u_id + '" and pwd = "' + req.body.pwd + '"';
    conf.query(sqlstr, (err, result) => {
        if (err) return res.json({code:0,msg:'登录失败',req})
        if(result.length > 0){
            res.json({code:1,msg:'登录成功',req:req.body,data:result})
        }else{
            res.json({code:0,msg:'登录失败',req:req.body})
        }
    })
})

module.exports = router;