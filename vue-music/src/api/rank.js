import jsonp from 'common/js/jsonp'
import axios from 'axios'
import {commonParams,options} from './config'

export function getRank(){
    const url='/api/getRank'

    const data=Object.assign({},commonParams,{
        uin: 0,
        format: 'json',
        platform: 'h5',
        needNewCode: 1,
        _:1533295325715
    })

    return axios.get(url,{
        params:data
    }).then((res)=>{
        return Promise.resolve(res.data)
    })
}

export function getMusicList(topid){
    const url=' https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg'

    const data=Object.assign({},commonParams,{
        uin: 0,
        format: 'json',
        platform: 'h5',
        needNewCode: 1,
        tpl: 3,
        page: 'detail',
        type: 'top',
        topid: topid,
        _: 1533299204272
    })

    return jsonp(url,data,options)
}