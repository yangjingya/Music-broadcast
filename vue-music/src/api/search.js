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