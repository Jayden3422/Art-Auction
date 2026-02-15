import {createToken, verifyToken} from "./token.js";// 引入token操作函数
// 引入数据库相关操作
import { insertDb, deleteData, deleteDatas, findPro, findSort, findLimitSort, updateDb, updateDbs } from "./Mongo.js";
import { JWT_SALT } from "../config/env.js";
// Promise处理
import { isFine, allPro } from "./promise.js";
// 密码盐
const salt = JWT_SALT;

// 权限列表
async function permission(userForm, res, pid) {
    let per = await findPro('permission', { ID: pid });
    if(isFine(per).judge) {
        throw per.value;
    }
    var tokForm = {
        EMAIL: userForm.EMAIL,
        Permission: pid,// 权限
        pids: per[0].ARRAY
    }
    let token = createToken(salt, tokForm);// 将密码盐和登录信息结合生成token防止信息泄露
    var form = {
        userForm: userForm,
        token: token
    }
    let info = null;

    if(pid == 0) {
        info = await updateDb('buyr_user', { "EMAIL": userForm.EMAIL }, {$set: {PASS_SALT: token}});
    }else if(pid == 1) {
        info = await updateDb('seller', { "EMAIL": userForm.EMAIL }, {$set: {PASS_SALT: token}});
    }else if(pid == 2) {
        info = await updateDb('admin', { "EMAIL": userForm.EMAIL }, {$set: {PASS_SALT: token}});
    }
    if(isFine(info).judge) {
        throw info.value;
    }
    res.send(form);
}

// 设置拍卖时间结束后的操作
async function final() {
    try {
        var nowDate = new Date();
        // 没有结束
        let goodsList = await findPro("goods", {END_TIME: {$gte: nowDate}, GOOD_STATE: 0});
        if(isFine(goodsList).judge) {
            throw goodsList.value;
        }
        for(let i = 0; i < goodsList.length; i++) {
            console.log(goodsList[i].START_TIME <= nowDate)
            setTimeout(() => {
                // 设置拍卖品交易价格并生成订单
                setPrice(goodsList[i].GOOD_ID, goodsList[i].START_TIME <= nowDate);
            }, new Date(goodsList[i].END_TIME).valueOf() - nowDate.valueOf())
        }
    }catch(e) {
        console.log(e);
    }
    async function setPrice(GOOD_ID, isStart) {
        let priceInfo = await findSort("price_info", {GOOD_ID: GOOD_ID}, { TIME: -1 });
        if(isFine(priceInfo).judge) {
            throw priceInfo.value;
        }
        console.log(GOOD_ID);
        console.log(priceInfo);
        if(priceInfo[0] || !isStart) {
            var date = new Date();
            let resy = await findPro('goods', {GOOD_ID: GOOD_ID});
            var form = {
                ORDER_ID: date.valueOf(),
                USER_ID: priceInfo[0].BUYR_ID,
                SELLER_ID: resy[0].UPLOADER_ID,
                GOOD_ID: GOOD_ID,
                COUNT: resy[0].COUNT,
                TOTAL_PRICE: priceInfo[0].PRICE,
                ADDRESS: "",
                NAME: "",
                PHONE: "",
                ORDER_STATUS: 0,
                PD: 0,// 下单未支付
                EMS: "",
                PAY_METHOD: 1,
                CREATED_BY: -1, // 系统默认植入
                CREATED_TIME: date,
            }
            let insertRes = await insertDb('buyr_order', form);
            if(isFine(insertRes).judge) {
                throw insertRes.value;
            }
            let upDateRes = await updateDb('goods', {GOOD_ID: GOOD_ID}, {$set: { PRICE: priceInfo[0].PRICE }});
            if(isFine(upDateRes).judge) {
                throw upDateRes.value;
            }
        }else {
            failGood(GOOD_ID);
        }
    }
    async function failGood(ID) {
        let upDateRes = await updateDb('goods', {GOOD_ID: ID}, {$set: { PRICE: 0, GOOD_STATE: 1 }});
        if(isFine(upDateRes).judge) {
            throw upDateRes.value;
        }
    }
}
export {
    permission,
    final,
    salt
}
