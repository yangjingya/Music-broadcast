import jsonp from 'common/js/jsonp'
import axios from 'axios'
import {commonParams,options} from './config'
import { Promise } from 'core-js';
import { resolve } from 'url';
import { reject } from 'when';

export function getRecommend(){
    const url='https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'

    const data=Object.assign({},commonParams,{
        platform:'h5',
        uin:0,
        needNewCode:1
    })

    return jsonp(url,data,options)
}

export function getDiscList(){
    const url='/api/getDiscList'

    const data=Object.assign({},commonParams,{
        picmid:1,
        rnd:Math.random(),
        loginUin:0,
        hostUin:0,
        platform:'yqq',
        needNewCode:0,
        categoryId:10000000,
        sortId:5,
        sin:0,
        ein:29,
        format:'json'
    })

    return axios.get(url,{
        params:data
    }).then((res)=>{
        return Promise.resolve(res.data)
    })
}