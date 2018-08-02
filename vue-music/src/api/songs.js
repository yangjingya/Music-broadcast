import axios from 'axios'
import {commonParams} from './config'

export function getSongs (songmid) {
    const url = '/api/getSongsContent'
   
    const data = Object.assign({}, commonParams, {
        pcachetime:+new Date(),
        songmid:songmid,
        loginUin:0,
        hostUin:0,
        platform:'yqq',
        needNewCode: 0,
        format:'json'
    })

    return axios.get(url,{
        params:data
    }).then((res)=>{
        return Promise.resolve(res.data)
    })
   
  }