// 引入数据库
import MongoDB from "mongodb";
import { MONGO_URL, MONGO_DB_NAME } from "../config/env.js";
// 创建Client
var MongoClient = MongoDB.MongoClient;
// 远程数据库地址
const url = MONGO_URL;
// 数据库名称
const DBname = MONGO_DB_NAME;
// 返回Promise的数据库操作
// 插入数据
function insertDb(col, form) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
            if (err) {
                reject(err);
            };
            // 找到数据库
            var dataBase = db.db(DBname);
            // 插入数据
            dataBase.collection(col).insertOne(form, function (err, result) {
                // result 一般是 {acknowledged: true, insertedId: new ObjectId("63ce57c812ddcb59a043ddcf")}
                if (err) {
                    reject(err);
                };
                resolve("Add data successfully");
                db.close();
            });
        });
    })
}
// 删除一条数据
function deleteData(col, form) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
            if (err) {
                reject(err);
            };
            // 找到数据库
            var dataBase = db.db(DBname);
            // 删除一条数据
            dataBase.collection(col).deleteOne(form, function (err, obj) {
                // obj 一般是 {acknowledged: true, deletedCount: 1}
                if (err) reject(err);
                resolve("Data deleted successfully");
                db.close();
            });
        });
    })
}
// 删除多条数据
function deleteDatas(col, form) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
            if (err) {
                reject(err);
            };
            // 找到数据库
            var dataBase = db.db(DBname);
            // 删除多条数据
            dataBase.collection(col).deleteMany(form, function (err, obj) {
                // obj 一般是 {acknowledged: true, deletedCount: 删除的数据条数}
                if (err) {
                    reject(err);
                }
                resolve(obj.deletedCount + " Documents deleted");
                db.close();
            });
        });
    })
}
// 查询数据
function findPro(col, form) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
            if (err) {
                reject(err);
            };
            // 找到数据库
            var dataBase = db.db(DBname);
            // 查询数据
            dataBase.collection(col).find(form).toArray((err, result) => {
                // result就是查询结果的数组
                if (err) {
                    reject(err);
                };
                resolve(result);// 查询结果的所有数据
                db.close();
            });
        });
    })
}
// 查询并排序
function findSort(col, form, mysort) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
            if (err) {
                reject(err);
            };
            // 找到数据库
            var dataBase = db.db(DBname);
            // 查询并排序
            dataBase.collection(col).find(form).sort(mysort).toArray((err, result) => {
                // result就是查询结果并排序的数组
                if (err) {
                    reject(err);// 查询结果并排序的所有数据
                }
                resolve(result);
                db.close();
            });
        });
    })
}
// 查询、限制数量、排序
function findLimitSort(col, form, mysort, num) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
            if (err) {
                reject(err);
            };
            // 找到数据库
            var dataBase = db.db(DBname);
            // 查询并排序
            dataBase.collection(col).find(form).limit(num).sort(mysort).toArray((err, result) => {
                // result就是查询结果并排序的数组
                if (err) {
                    reject(err);// 查询结果所有数据
                }
                resolve(result);
                db.close();
            });
        });
    })
}
// 更新数据
function updateDb(col, whereStr, updateStr) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
            if (err) {
                reject(err);
            };
            // 找到数据库
            var dataBase = db.db(DBname);
            // 更新数据
            dataBase.collection(col).updateOne(whereStr, updateStr, (err, result) => {
                if (err) {
                    reject(err);
                }
                resolve(result);
                // acknowledged(链接情况): true, modifiedCount(更新对象数): 1, upsertedId: null, upsertedCount: 0, matchedCount(匹配数据数): 1
                db.close();
            });
        });
    })
}
// 更新多条数据
function updateDbs(col, whereStr, updateStr) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
            if (err) {
                reject(err);
            };
            // 找到数据库
            var dataBase = db.db(DBname);
            // 更新数据
            dataBase.collection(col).updateMany(whereStr, updateStr, (err, result) => {
                if (err) {
                    reject(err);
                }
                resolve(result);
                // acknowledged(链接情况): true, modifiedCount(更新对象数): 2, upsertedId: null, upsertedCount: 0, matchedCount(匹配对象数): 2
                db.close();
            });
        });
    })
}

export {
    insertDb,
    deleteData,
    deleteDatas,
    findPro,
    findSort,
    findLimitSort,
    updateDb,
    updateDbs
}
