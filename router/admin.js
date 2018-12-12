var router = require('koa-router')()
var apiModel = require('../lib/sql.js')
var path = require('path')
var koaBody = require('koa-body')
var checkLogin = require('../middlewares/check.js').checkLogin
var http = require('http');
var fs = require('fs');

router.get('/admin', async(ctx, next) => {
    var page
    let dataLength = ''
    if (ctx.querystring == '') {
        page = 1
    }else{
        page = ctx.querystring.split('=')[1];
    }
    await checkLogin(ctx)
    await apiModel.findData('articles').then(res => {
        dataLength = res.length
    })
    await apiModel.findPageData('articles', page, 7).then(res => {
        data = JSON.parse(JSON.stringify(res))
    })
    await ctx.render('articlelist', {
        articles: data,
        session: ctx.session,
        dataLength: Math.ceil(dataLength / 7),
        nowPage:  parseInt(page)
    })
})
// 获取登录页面
router.get('/admin/signin', async(ctx, next) => {
    if (ctx.session.user) {
        await ctx.redirect('/admin')
    } else {
        await ctx.render('signin')
    }
})
// 登录 post
router.post('/admin/signin', koaBody(), async(ctx, next) => {
    var {email,password} = ctx.request.body
    await apiModel.findUser(email)
        .then(res => {
            
            if (res[0]['email'] === email) {
                console.log('成功', res[0]['email'], email)
                ctx.session.user = email;
                ctx.session.pass = password;
                ctx.redirect('/admin/classlist?page=1')
            }
        }).catch(() => {
            ctx.session.user = email;
            ctx.session.pass = password;
            apiModel.addUser([email, password])
        })
    // await ctx.redirect('/admin')

})
// 登出
router.get('/admin/signout', async(ctx, next) => {
    ctx.session = null;
    await ctx.redirect('/admin')
})

// 上传article数据
router.get('/admin/upload', async(ctx, next) => {
    await checkLogin(ctx)
    await ctx.render('upload', {
        session: ctx.session
    })
})

router.get('/admin/addTeacher', async(ctx, next) => {
    await checkLogin(ctx)
    await ctx.render('addTeacher', {
        session: ctx.session
    })
    console.log('add teacher')
})
// 上传article数据 post
router.post('/admin/upload', koaBody({
    multipart: true,
    "jsonLimit":"5mb",
    "textLimit":"5mb",
    "textLimit":"5mb",
    formidable: {
        uploadDir: './public/images'
    }
}), async(ctx, next) => {

    var i_body = Object.assign({},ctx.request.body)
    console.log('i_body', i_body)
    let {articlename,authorname,avator,description,
        time, detail, url} = i_body['fields']
    var img = i_body['files']['file']['path']
    var data = [articlename, authorname, img.match(/\w+/g)[2], description,
                 time, detail, 
                 url]
    console.log(data)
    await apiModel.insertData(data)
        .then((res) => {
            console.log('添加成功')
            ctx.body = {
                code:200,
                message:'上传成功'
            }
        }).catch(res => {
            ctx.body = {
                code: 500,
                message: '上传失败'
            }
        })
        
})

router.post('/admin/uploadClass', koaBody({
    multipart: true,
    "jsonLimit":"5mb"
}), async(ctx, next) => {

    var i_body = Object.assign({},ctx.request.body)
    console.log('i_body', i_body)
    let {name,code, teacher_id,price,start_time,
        end_time, start_date, end_date, week_day, description} = i_body['fields']
    var data = [name, code, parseInt(price),parseInt(teacher_id),start_time,
        end_time, start_date, end_date, parseInt(week_day[1]), description]
    console.log(data)
    await apiModel.insertClass(data)
        .then((res) => {
            console.log('添加成功')
            ctx.body = {
                code:200,
                message:'上传成功'
            }
        }).catch(res => {
            ctx.body = {
                code: 500,
                message: '上传失败'
            }
        })
        
})

router.post('/admin/addTeacher', koaBody({
    multipart: true,
    "jsonLimit":"5mb"
}), async(ctx, next) => {

    var i_body = Object.assign({},ctx.request.body)
    console.log('i_body', i_body)
    let {name,email, password,phone_number,wechat} = i_body['fields']
    var data = [name, email, password,'', phone_number,wechat]
    console.log(data)
    await apiModel.insertTeacher(data)
        .then((res) => {
            console.log('添加成功')
            ctx.body = {
                code:200,
                message:'上传成功'
            }
        }).catch(res => {
            ctx.body = {
                code: 500,
                message: '上传失败'
            }
        })
        
})
// 编辑页面
router.get('/admin/edit/:id', async(ctx, next) => {
    console.log('test')
    await apiModel.findDataById(ctx.params.id)
        .then(res => {
            data = JSON.parse(JSON.stringify(res))
        })
    await ctx.render('edit', {
        video: data[0],
        session: ctx.session
    })
})
// 编辑 post
router.post('/admin/edit/:id', koaBody({
    multipart: true,
    "formLimit":"5mb",
    "jsonLimit":"5mb",
    "textLimit":"5mb",
    formidable: {
        uploadDir: './public/images'
    }
}), async(ctx, next) => {
    var i_body = Object.assign({}, ctx.request.body)
    console.log('i_body', i_body)
    console.log('test 2 ')
    let {
        videoName,
        videoCountry,
        videoClassify,
        videoTime,
        videoStar,
        videoTimeLong,
        videoType,
        videoActors,
        videoDetail,
        file
    } = i_body['fields'];
    let img = ''
    if (Object.keys(i_body['files']).length == 0){
        img = file
    }else{
        img = i_body['files']['newFile']['path'].match(/\w+/g)[2]
    }
    var data = [videoName, videoCountry, videoClassify, videoTime,
        img, videoStar, videoTimeLong,
        videoType, videoActors, videoDetail,  ctx.params.id
    ]
    console.log(data)
    // 更改影片信息，喜欢和评论的列表也要相应更新，比如videName
    await apiModel.updateLikeName([videoName, ctx.params.id])
    await apiModel.updateCommentName([videoName, ctx.params.id])
    await Promise.all([
            apiModel.updateDataHasImg(data),
            apiModel.updateLikesImg([img,ctx.params.id])
        ])
        .then(() => {
            console.log('更新成功')
            ctx.body = {
                code:200,
                message:'修改成功'
            }
        }).catch(e=>{
            ctx.body = {
                code: 500,
                message: '修改失败'
            }
        })
         
})
// 删除
router.post('/admin/delete/:id', koaBody(), async(ctx, next) => {
    await apiModel.deleteVideo(ctx.params.id)
        .then(() => {
            ctx.body = 'success'
        }).catch((err) => {
            // console.log(err)
        })    
})

// 编辑页面
router.get('/admin/studentsListByClass/:id', async(ctx, next) => {
    console.log('studentsListByClass', ctx.params.id)
    var page,
    dataLength = '';
    if (ctx.querystring == '') {
        page = 1
    }else{
        page = ctx.querystring.split('=')[1];
    }
    // await checkLogin(ctx)
    await apiModel.findStudentListByClassId(ctx.params.id).then(res => {
        dataLength = res.length
    })
    await apiModel.findStudentListPageByClassId(ctx.params.id, page, 7).then(res => {
        data = res
    })
    console.log('studentsListByClass data', data);
    await ctx.render('studentsListByClass', {
        users: data,
        session: ctx.session,
        dataLength: Math.ceil(dataLength / 7),
        nowPage:  parseInt(page),
        classId: ctx.params.id
    })
})

router.get('/admin/showStudentsAddClass/:id', async(ctx, next) => {
    console.log('showStudentsAddClass', ctx.params.id)
    var page,
        dataLength = '';
    if (ctx.querystring == '') {
        page = 1
    }else{
        page = ctx.querystring.split('=')[1];
    }
    await apiModel.findData('students').then(res => {
        dataLength = res.length
    })
    await apiModel.findPageData('students',page,10).then(res=>{
        data = res
    })
    await ctx.render('mobileUserAddClass',{
        users:data,
        session:ctx.session,
        dataLength: Math.ceil(dataLength / 10),
        nowPage:  parseInt(page),
        classId: ctx.params.id
    })
})

router.post('/admin/AddStudentToClass', koaBody({
    multipart: true,
    "jsonLimit":"5mb"
}), async(ctx, next) => {

    console.log('AddStudentToClass')
    var i_body = Object.assign({},ctx.request.body)
    console.log('i_body', i_body)
    let {student_id,student_name,phone_number,wechat,
        class_id} = i_body['fields']
    var data = [student_id, student_name, phone_number, wechat,
        class_id]
    console.log(data)
    await apiModel.insertStudentToClass(data)
        .then((res) => {
            console.log('添加成功')
            ctx.body = {
                code:200,
                message:'上传成功'
            }
        }).catch(res => {
            ctx.body = {
                code: 500,
                message: '上传失败'
            }
        })


    var page,
    dataLength = '';
    if (ctx.querystring == '') {
        page = 1
    }else{
        page = ctx.querystring.split('=')[1];
    }
    // await checkLogin(ctx)
    await apiModel.findStudentListByClassId(ctx.params.id).then(res => {
        dataLength = res.length
    })
    await apiModel.findStudentListPageByClassId(ctx.params.id, page, 7).then(res => {
        data = res
    })
    console.log('studentsListByClass data', class_id);
    await ctx.render('studentsListByClass', {
        users: data,
        session: ctx.session,
        dataLength: Math.ceil(dataLength / 7),
        nowPage:  parseInt(page),
        classId: class_id
    })
        
})

router.post('/admin/deleteClassById/:id', koaBody(), async(ctx, next) => {
    console.log('delete Class');
    await apiModel.deleteClass(ctx.params.id)
        .then(() => {
            ctx.body = 'success'
        }).catch((err) => {
            console.log(err)
        })    
})

// 后台管理员列表
router.get('/admin/adminUser',async(ctx,next)=>{
    var page,
        dataLength = '';
    if (ctx.querystring == '') {
        page = 1
    }else{
        page = ctx.querystring.split('=')[1];
    }
    await apiModel.findData('teachers').then(res => {
        dataLength = res.length
    })
    await apiModel.findPageData('teachers', page, 15).then(res => {
        data = res
    })
    await ctx.render('adminUser', {
        users: data,
        session: ctx.session,
        dataLength: Math.ceil(dataLength / 15),
        nowPage:  parseInt(page)
    })
})
// 手机端用户列表
router.get('/admin/mobileUser',async(ctx,next)=>{
    var page,
        dataLength = '';
    if (ctx.querystring == '') {
        page = 1
    }else{
        page = ctx.querystring.split('=')[1];
    }
    await apiModel.findData('students').then(res => {
        dataLength = res.length
    })
    await apiModel.findPageData('students',page,10).then(res=>{
        data = res
    })
    console.log('mobileusers', data);
    await ctx.render('mobileUser',{
        users:data,
        session:ctx.session,
        dataLength: Math.ceil(dataLength / 10),
        nowPage:  parseInt(page)
    })
})
// 手机端用户列表
router.get('/admin/classlist',async(ctx,next)=>{
    var page,
     dataLength = '';
    if (ctx.querystring == '') {
        page = 1
    }else{
        page = ctx.querystring.split('=')[1];
    }
    // await checkLogin(ctx)
    await apiModel.findData('classes').then(res => {
        dataLength = res.length
    })
    await apiModel.findPageData('classes', page, 7).then(res => {
        data = res
    })
    for (var i = 0; i < data.length; i++) {
        await apiModel.getTeachersById(data[i].teacher_id).then(res => {
            console.log('teacher', res);
            data[i].teacherName = res[0].username;
        })
        var startDate = new Date(data[i].start_date)
        var endDate = new Date(data[i].end_date)
        data[i].start_date = (startDate.getMonth() + 1) + '/' + startDate.getDate() + '/' + startDate.getFullYear()
        data[i].end_date = (endDate.getMonth() + 1) + '/' + endDate.getDate() + '/' + endDate.getFullYear()
        switch (data[i].week_day) {
            case 0:
                data[i].week_day = '星期日'
                break;
            case 1:
                data[i].week_day = '星期一'
                break;
            case 2:
                data[i].week_day = '星期二'
                break;
            case 3:
                data[i].week_day = '星期三'
                break;
            case 4:
                data[i].week_day = '星期四'
                break;
            case 5:
                data[i].week_day = '星期五'
                break;
            case 6:
                data[i].week_day = '星期六'
                break;
            default:
                data[i].week_day = '未确定日期'

        }
        
    }

    console.log('classlist', data);
    await ctx.render('classlist', {
        classes: data,
        session: ctx.session,
        dataLength: Math.ceil(dataLength / 7),
        nowPage:  parseInt(page)
    })
})

// 手机端用户列表
router.get('/admin/myClass',async(ctx,next)=>{
    var page,
     dataLength = '';
     var teacherId;
    if (ctx.querystring == '') {
        page = 1
    }else{
        page = ctx.querystring.split('=')[1];
    }
    apiModel.getTeachersByName(ctx.session.user).then(res => {
        console.log('id',res);
        teacherId = res[0].id;
    });
    await apiModel.getClassesByTeacherId(teacherId).then(res => {
        dataLength = res.length
    })
    await apiModel.getPageClassesByTeacherId(teacherId, page, 7).then(res => {
        console.log('idid',teacherId);
        data = res
    })
    for (var i = 0; i < data.length; i++) {
        await apiModel.getTeachersById(data[i].teacher_id).then(res => {
            console.log('teacher', res);
            data[i].teacherName = res[0].username;
        })
        var startDate = new Date(data[i].start_date)
        var endDate = new Date(data[i].end_date)
        data[i].start_date = (startDate.getMonth() + 1) + '/' + startDate.getDate() + '/' + startDate.getFullYear()
        data[i].end_date = (endDate.getMonth() + 1) + '/' + endDate.getDate() + '/' + endDate.getFullYear()
        switch (data[i].week_day) {
            case 0:
                data[i].week_day = '星期日'
                break;
            case 1:
                data[i].week_day = '星期一'
                break;
            case 2:
                data[i].week_day = '星期二'
                break;
            case 3:
                data[i].week_day = '星期三'
                break;
            case 4:
                data[i].week_day = '星期四'
                break;
            case 5:
                data[i].week_day = '星期五'
                break;
            case 6:
                data[i].week_day = '星期六'
                break;
            default:
                data[i].week_day = '未确定日期'

        }
        
    }
    await ctx.render('myClass', {
        classes: data,
        session: ctx.session,
        dataLength: Math.ceil(dataLength / 7),
        nowPage:  parseInt(page)
    })
})

router.get('/admin/getClassesCalendar', async(ctx, next) => {
    var userId = 1;
    await apiModel.getTeachersByName(ctx.session.user).then(res => {
        userId = res[0].id;
        console.log('userid', userId);
    }).catch((err) => {

    });
    var events = [];
    await apiModel.getClassesByTeacherId(userId).then(res => {
        var index = 1;
        for (var i = 0; i < res.length; i++) {
            var ev = res[i];
            var day = ev.week_day;
            var date1 = new Date(ev.start_date);
            var date2 = new Date(ev.end_date);
            var dates = getDaysBetweenDates(new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()), 
                                                    new Date(date2.getFullYear(), date2.getMonth(), date2.getDate()), day);
            
            for (var j = 0; j < dates.length; j++) {
                var tempDate = dates[j];
                var year = tempDate.getFullYear();
                var month = tempDate.getMonth() + 1;
                var date = tempDate.getDate();
                events.push({
                    id: index,
                    text: ev.class_name,
                    start_date: year + '-' + month + '-' + date + ' ' + ev.start_time,
                    end_date: year + '-' + month + '-' + date + ' ' + ev.end_time
                })
                index++;
            }
        }
        ctx.body = events

        function getDaysBetweenDates(start, end, day) {
            var result = [];
            // Copy start date
            var current = new Date(start);
            // Shift to next of required days
            current.setDate(current.getDate() + (day - current.getDay() + 7) % 7);
            // While less than end date, add dates to result array
            while (current < end) {
                result.push(new Date(+current));
                current.setDate(current.getDate() + 7);
            }
            return result;  
        }        
    }).catch((err) => {
        console.log(err)
    })
})
// 手机端评论列表
router.get('/admin/comment',async(ctx,next)=>{
    var page,
    dataLength = '';
    if (ctx.querystring == '') {
        page = 1
    }else{
        page = ctx.querystring.split('=')[1];
    }
    await apiModel.findData('comments').then(res => {
        dataLength = res.length
    })
    await apiModel.findPageData('comments', page, 15).then(res => {
        data = res
    })
    // console.log(dataLength)
    await ctx.render('comments', {
        comments: data,
        session: ctx.session,
        dataLength: Math.ceil(dataLength / 15),
        nowPage:  parseInt(page)
    })
})
// 手机端like列表
router.get('/admin/like',async(ctx,next)=>{
    var page,
        dataLength = '';
    if (ctx.querystring == '') {
        page = 1
    }else{
        page = ctx.querystring.split('=')[1];
    }
    await apiModel.findData('likes').then(res => {
        dataLength = res.length
    })
    await apiModel.findPageData('likes', page, 15).then(res => {
        data = res
    })
    await ctx.render('likes', {
        likes: data,
        session: ctx.session,
        dataLength: Math.ceil(dataLength / 15),
        nowPage: parseInt(page)
    })
})

router.get('/admin/calendar',async(ctx,next)=>{

    await ctx.render('calendar', {
    })
})
module.exports = router