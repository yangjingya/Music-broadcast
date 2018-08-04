import jsonp from 'common/js/jsonp'
import axios from 'axios'
import {commonParams,options} from './config'

export function getHot(){
    const url='https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg'

    const data=Object.assign({},commonParams,{
        uin: 0,
        format: 'json',
        platform: 'h5',
        needNewCode: 1,
        _: 1533347073209
    })

    return jsonp(url,data,options)
}

export function searchInfo(keyWord,Zhida,p){
    const url='/api/searchInfo'

    const data=Object.assign({},commonParams,{
        g_tk: 2124215696,
        uin: 0,
        format: 'json',
        platform: 'h5',
        needNewCode: 1,
        w: keyWord,
        zhidaqu: 1,
        catZhida: Zhida?1:0,
        t: 0,
        flag: 1,
        ie: 'utf-8',
        sem: 1,
        aggr: 0,
        perpage: 20,
        n: 20,
        p: p,
        remoteplace: 'txt.mqq.all',
        _: 1533361165911,
    })
    return axios.get(url,{
        params:data
    }).then((res)=>{
        return Promise.resolve(res.data)
    })
}