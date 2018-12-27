var mysql = require('mysql');
var config = require('../config/default.js')

var pool = mysql.createPool({
	host:config.database.HOST,
	user:config.database.USER,
	password:config.database.PASSWORD,
	database:config.database.DATABASE,
});

var query = (sql,val) => {
	return new Promise((resolve,reject)=>{
		pool.getConnection((err,connection)=>{
			if (err){
				return resolve(err)
			} else{
				connection.query(sql,val,(err,rows)=>{
					if (err) {
						reject(err)
					}else{
						resolve(rows)
					}
					connection.release()
				})
			}
		})
	})
}

let articles = 
    `create table if not exists articles(
      id INT NOT NULL AUTO_INCREMENT,
      articlename VARCHAR(1000) NOT NULL,
      authorname VARCHAR(100) NOT NULL,
      avator VARCHAR(100) NOT NULL DEFAULT '',
      description VARCHAR(1000) NOT NULL,
      time VARCHAR(100) NOT NULL,
      detail VARCHAR(1000) NOT NULL,
      url VARCHAR(1000) NOT NULL,
      looktime INT NOT NULL DEFAULT 0,
      liketime INT NOT NULL DEFAULT 0,
      commenttime INT NOT NULL DEFAULT 0,
      PRIMARY KEY ( id )
    ) CHARACTER SET = utf8;`
let classes = 
    `create table if not exists classes(
      id INT NOT NULL AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL,
      code_level_1 VARCHAR(100) NOT NULL DEFAULT '',
      code_level_2 VARCHAR(100) NOT NULL DEFAULT '',
      code_level_3 VARCHAR(100) NOT NULL DEFAULT '',
      code_level_4 VARCHAR(100) NOT NULL DEFAULT '',
      code_level_5 VARCHAR(100) NOT NULL DEFAULT '',
      price INT NOT NULL DEFAULT 100,
      teacher_id INT NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      week_day INT NOT NULL,
      description VARCHAR(1000) NOT NULL,
      PRIMARY KEY ( id ) 
    ) CHARACTER SET = utf8;`

let teachers =
    `create table if not exists teachers(
     id INT NOT NULL AUTO_INCREMENT,
     name VARCHAR(100) NOT NULL,
     email VARCHAR(300) NOT NULL,
     password VARCHAR(300) NOT NULL,
     avator VARCHAR(100) NOT NULL DEFAULT '',
     phone_number VARCHAR(300) NOT NULL DEFAULT '',
     wechat VARCHAR(300) NOT NULL DEFAULT '',
     PRIMARY KEY ( id )
    ) CHARACTER SET = utf8;`
let students =
    `create table if not exists students(
     id INT NOT NULL AUTO_INCREMENT,
     name VARCHAR(100) NOT NULL,
     email VARCHAR(300) NOT NULL,
     password VARCHAR(100) NOT NULL,
     avator VARCHAR(100) NOT NULL DEFAULT '',
     phone_number VARCHAR(300) NOT NULL DEFAULT '',
     wechat VARCHAR(300) NOT NULL DEFAULT '',
     PRIMARY KEY ( id )
    ) CHARACTER SET = utf8;`
let student_class = 
    `create table if not exists student_class(
      id INT NOT NULL AUTO_INCREMENT,
      student_id INT NOT NULL,
      student_name VARCHAR(100) NOT NULL,
      phone_number VARCHAR(300) NOT NULL DEFAULT '',
      wechat VARCHAR(300) NOT NULL DEFAULT '',
      class_id INT NOT NULL,
      add_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      pay INT NOT NULL DEFAULT 0,
      promo INT NOT NULL DEFAULT 0,
      PRIMARY KEY ( id )
    ) CHARACTER SET = utf8;`
let comments =
    `create table if not exists comments(
    id INT NOT NULL AUTO_INCREMENT,
    userName VARCHAR(100) NOT NULL,
    date VARCHAR(100) NOT NULL,
    content VARCHAR(100) NOT NULL,
    articlename VARCHAR(1000) NOT NULL,
    uid VARCHAR(100) NOT NULL,
    avator VARCHAR(100) NOT NULL DEFAULT '',
    PRIMARY KEY ( id )
    ) CHARACTER SET = utf8;`
let likes =
    `create table if not exists likes(
    id INT NOT NULL AUTO_INCREMENT,
    iLike VARCHAR(100) NOT NULL,
    userName VARCHAR(100) NOT NULL,
    articlename VARCHAR(100) NOT NULL,
    videoImg VARCHAR(100) NOT NULL,
    star VARCHAR(100) NOT NULL,
    uid VARCHAR(100) NOT NULL,
    PRIMARY KEY ( id )
    ) CHARACTER SET = utf8;`
let likesclasses = 
    `create table if not exists likesclasses(
      id INT NOT NULL AUTO_INCREMENT,
      iLike VARCHAR(100) NOT NULL,
      userName VARCHAR(100) NOT NULL,
      classname VARCHAR(100) NOT NULL,
      videoImg VARCHAR(100) NOT NULL,
      star VARCHAR(100) NOT NULL,
      uid VARCHAR(100) NOT NULL,
      PRIMARY KEY ( id )
    ) CHARACTER SET = utf8;`
let createTable = ( sql ) => {
  return query( sql, [] )
}
// 建表
createTable(articles)
createTable(classes)
createTable(teachers)
createTable(students)
createTable(comments)
createTable(likes)
createTable(likesclasses)
createTable(student_class)
// 添加后台用户
let addUser = ( value ) => {
  var _sql = `insert into teachers set email=?,password=?`
  console.log(1)
  return query( _sql, value)
}
// 删除后台用户
let deleteUser = ( name ) => {
  var _sql = `delete from teachers where email="${name}"; `
  return query( _sql)
}
// 查找用户
let findUser = (name) => {
	var _sql = `select * from teachers where email="${name}"; `
  return query( _sql )
}
let findStudent = (name) => {
	var _sql = `select * from students where email="${name}"; `
  return query( _sql )
}
// 查询所有数据
let findData = (table) => {
	var _sql = `select * from ${table}; `
  return query( _sql )
}
// 分页数据查找
let findPageData = (table,page,num) => {
  var _sql = `select * from ${table} limit ${(page - 1) * num},${num}; `
  return query(_sql)
}

// 通过cls查找
let findDataByCls = (cls) => {
  var _sql = `select * from articles where classify="${cls}"; `
  return query( _sql )
}
// 通过id查找
let findClassById = (id) => {
	var _sql = `select * from classes where id="${id}"; `
  return query( _sql )
}

let findStudentListByClassId = (id) => {
  var _sql = `select * from student_class where class_id="${id}";`
  return query( _sql )
}

let findStudentListPageByClassId = (id,page,num) => {
  var _sql = `select * from student_class where class_id="${id}" limit ${(page - 1) * num},${num}; `
  return query(_sql)
}

// 增加article数据
let insertData = ( value ) => {
  var _sql = `insert into articles set articlename=?,authorname=?,avator=?,description=?,time=?,detail=?,url=?,looktime=?,liketime=?,commenttime=?;`
  return query( _sql, value )
}
let updateDataHasImg = ( value ) => {
  var _sql = `update articles set articlename=?,authorname=?,avator=?,description=?,time=?,detail=?,url=?,looktime=?,liketime=?,commenttime=? where id=?; `
  return query( _sql, value )
}
let updateDataNoneImg = ( value ) => {
  var _sql = `update articles set articlename=?,authorname=?,avator=?,description=?,time=?,detail=?,url=?,looktime=?,liketime=?,commenttime=? where id=?; ` 
  return query( _sql, value )
}
// let updateLikesImg = ( value ) => {
//   let _sql = `update likes set videoImg=? where uid=?; ` 
//   return query( _sql, value )
// }
let updateLikeName =  ( value ) => {
  var _sql = `update likes set articlename=? where uid=?; `
  return query(_sql, value)
}
let updateCommentName = (value) => {
  var _sql = `update comments set articlename=? where uid=?; `
  return query(_sql, value)
}
// 删除articles
let deleteArticle = ( id ) => {
  var _sql = `delete from articles where id="${id}"; `
  return query( _sql )
}
let getDataById = ( id ) => {
  var _sql = `select * from articles where id="${id}"; `
  return query( _sql )
}

let insertClass = (value) => {
  var _sql = `insert into classes set name=?, code_level_1=?,code_level_2=?,code_level_3=?,code_level_4=?,code_level_5=?, price=?, teacher_id=?, start_time=?, end_time=?, start_date=?, end_date=?, week_day=?, description=?;`
  return query(_sql, value)
}

let insertTeacher = (value) => {
  var _sql = `insert into teachers set name=?, email=?, password=?, avator=?, phone_number=?, wechat=?;`
  return query(_sql, value)
}
let updateClass = (value) => {
  var _sql = `update classes set name=?, code_level_1=?,code_level_2=?,code_level_3=?,code_level_4=?,code_level_5=?, price=?, teacher_id=?, start_time=?, end_time=?, start_date=?, end_date=?, week_day=?, description=? where id=?;`
  return query(_sql, value)
}
let deleteClass = (value) => {
  var _sql = `delete from classes where id="${value}";`
  return query(_sql)
}
let getClassDataById = ( id ) => {
  var _sql = `select * from classes where id="${id}"; `
  return query( _sql )
}

let insertStudentToClass = ( value ) => {
  var _sql = `insert into student_class set student_id=?,student_name=?,phone_number=?,wechat=?,class_id=?;`
  return query( _sql, value )
}



// 手机端相关功能

// 通过用户名查找用户
let findMobileUserByName = ( name ) => {
  var _sql = `select * from students where email="${ name }";`
  return query( _sql )
}

// 添加手机用户
let addMobileUser = ( value ) => {
  var _sql = `insert into students set name=?, email=?, password=?, phone_number=?, wechat=?`
  return query( _sql , value)
}
// 检测用户登录信息的有效性
let checkUser = (value) => {
  var _sql = `select * from students where userName=?;`
  return query(_sql, value)
}

// 修改手机用户名 comment和like表也要修改
let updateMobileName = ( value ) => {
  var _sql = `update students set userName=? where userName=?;`
  return query( _sql , value)
}
let updateMobileCommentName = ( value ) => {
  var _sql = `update comments set userName=? where userName=?;`
  return query( _sql , value)
}
let updateMobileLikeName = ( value ) => {
  var _sql = `update likes set userName=? where userName=?;`
  return query( _sql , value)
}

// 添加头像
let updateMobileAvator = ( value ) => {
  var _sql = `update students set avator=? where userName=?;`
  return query( _sql , value)
}
// 修改评论里的头像
let updateMobileCommentAvator = ( value ) => {
  var _sql = `update comments set avator=? where userName=?;`
  return query( _sql , value)
}
// 增加评论
let addComment = (value) => {
  var _sql = `insert into comments set userName=?,date=?,content=?,articlename=?,uid=?,avator=?;`
  return query( _sql , value )
}
// 通过id获取评论
let getCommentById = (id) => {
  var _sql = `select * from comments where uid="${id}"; `
  return query( _sql )
}
// 通过用户名获取评论
let getCommentByUser = (name) => {
  var _sql = `select * from comments where userName="${name}"; `
  return query( _sql )
}
// 删除评论
let deleteComment = (id) => {
  var _sql = `delete from comments where id="${id}"; `
  return query( _sql )
}
// 增加like
let addLike = (value) => {
  var _sql = `insert into likes set iLike=?,userName=?,articlename=?,videoImg=?,star=?,uid=?; `
  return query( _sql , value )
}
// 获取单个article里的用户like状态
let getLike = (name,uid) => {
  var _sql = `select * from likes where userName='${name}' AND uid='${uid}'; `
  return query( _sql )
}
// 获取个人中心自己like/dislike的列表
let getLikeList = (name,num) => {
  var _sql = `select * from likes where userName='${name}' AND iLike='${num}'; `
  return query( _sql )
}
// 获取喜欢的数量
let getLikeStar = (type,uid) => {
  var _sql = `select count(*) from likes where iLike='${type}' AND uid='${uid}' ; `
  return query( _sql )
}
// 获取单篇文章like/dislike总的数量
let getUidLikeLength = (uid) => {
  var _sql = `select count(*) from likes where uid='${uid}'; `
  return query( _sql )
}
// // 更新article star分数
// let updateArticleStar = (value) => {
//   var _sql = `update articles set star=? where id=?; `
//   return query( _sql,value )
// }
// 更新likes star分数
let updateLikeStar = (value) => {
  var _sql = `update likes set star=? where uid=?; `
  return query( _sql,value )
}
// 搜索
let search = ( value ) => {
  var _sql = `select * from articles where name like '%${value}%';`
  return query( _sql )
}

let getteachers = ( value ) => {
  var _sql = `select * from teachers`
  return query(_sql)
}

let getTeachersById = (id) => {
  var _sql = `select * from teachers where id="${id}";`
  return query(_sql)
}

let getTeachersByName = (user) => {
  var _sql = `select * from teachers where email="${user}";`
  return query(_sql)
}

let getClasses = ( value ) => {
  var _sql = `select * from classes`
  return query(_sql)
} 

let getClassesByTeacherId = (value) => {
  var _sql = `select * from classes where teacher_id="${value}";`
  return query(_sql)
}

let getPageClassesByTeacherId = (value, page,num) => {
  var _sql = `select * from classes where teacher_id="${value}" limit ${(page - 1) * num},${num}; `
  return query(_sql)
}

let getarticles = ( value ) => {
  var _sql = `select * from articles`
  return query(_sql)
}

let addClass = ( value ) => {
  var _sql = `insert into student_class set student_id=?, class_id=?;`
  return query(_sql, value)
}

let getClassesByStudentId = ( studentId ) => {
  var _sql = `select * from student_class where student_id="${studentId}";`
  return query(_sql);
}

module.exports = {
	addUser,
  deleteUser,
  findUser,
  findStudent,
  findData,
  findPageData,
	insertData,
  findClassById,
  findStudentListByClassId,
  findStudentListPageByClassId,
	updateDataHasImg,
	updateDataNoneImg,
  updateLikeName, 
  updateCommentName,
	deleteArticle,
  findDataByCls,
  getDataById,
  insertClass,
  updateClass,
  deleteClass,
  getClasses,
  getClassDataById,
  addMobileUser,
  findMobileUserByName,
  checkUser,
  addComment,
  getCommentById,
  getCommentByUser,
  addLike,
  getLike,
  getLikeList,
  getLikeStar,
  updateLikeStar,
  getUidLikeLength,
  deleteComment,
  updateMobileAvator,
  updateMobileCommentAvator,
  updateMobileName,
  updateMobileCommentName,
  updateMobileLikeName,
  search,
  getteachers,
  getTeachersById,
  getTeachersByName,
  getarticles,
  addClass,
  getClassesByTeacherId,
  getPageClassesByTeacherId,
  getClassesByStudentId,
  insertTeacher,
  insertStudentToClass
}