import { commonParams } from "../../api/config";
import Axios from "../../../node_modules/axios";

export default class Song{
    constructor({id,mid,singer,name,album,duration,image,url}){
        this.id=id
        this.mid=mid
        this.singer=singer
        this.name=name
        this.album=album
        this.duration=duration
        this.image=image
        this.url=url
    }
}

export function createSong(musicData,vKey){
    return new Song({
        id:musicData.songid,
        mid:musicData.songmid,
        singer:filterSinger(musicData.singer),
        name:musicData.songname,
        album:musicData.albumname,
        duration:musicData.interval,
        image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
        url:`http://dl.stream.qqmusic.qq.com/C400${musicData.songmid}.m4a?vkey=${vKey}&guid=8911966654&uin=0&fromtag=66`
    })
    
}

function filterSinger(singer){
    let ret=[]
    if(!singer){
        return ''
    }
    singer.forEach((s) => {
        ret.push(s.name)
    });

    return ret.join('/')
}

export function getInforForSongs(songmid){
    const url="/api/getInforForSongs"

    const data=Object.assign({},commonParams,{
        loginUin: 0,
        hostUin: 0,
        platform: 'yqq',
        needNewCode: 0,
        songmid:songmid,
        filename: 'C400'+songmid+'.m4a',
        guid: 8911966654,
        cid: 205361747,
        uin: 0,
        format:'json'
    })

    return Axios.get(url,{
        params:data
    }).then((res)=>{
       return Promise.resolve(res.data)
    })
}