<template>
    <div class="singer">
        <listview :data="singerList" @select="selectSinger"></listview>
        <router-view></router-view>
    </div>
</template>

<script type="text/ecmascript-6">
import {getSingers} from 'api/singer.js'
import {ERR_OK} from 'api/config.js'
import Singer from 'common/js/singer.js'
import Listview from 'base/listview/listview.vue'
import {mapMutations} from 'vuex'

const HOT_NAME="热门"
const HOT_SINGER_LENGTH=10

export default {
    data(){
        return{
            singerList:[]
        }
    },
    created(){
        this._getSingers()
    },
    methods:{
        selectSinger(singer){
            this.$router.push({
                path:`/singer/${singer.id}`
            })
            this.setSinger(singer)
        },
        _getSingers(){
            getSingers().then((res)=>{
                if(res.code===ERR_OK){
                    this.singerList=this._normalizeSinger(res.data.list)
                }
            })
        },
        _normalizeSinger(list){
            let map={
                hot:{
                    title:HOT_NAME,
                    items:[]
                }
            }
            list.forEach((item,index) => {
                if(index<HOT_SINGER_LENGTH){
                    map.hot.items.push(new Singer({
                        id:item.Fsinger_mid,
                        name:item.Fsinger_name
                    }))
                }
                const key=item.Findex
                if(!map[key]){
                    map[key]={
                        title:key,
                        items:[]
                    }
                }
                map[key].items.push(new Singer({
                    id:item.Fsinger_mid,
                    name:item.Fsinger_name
                }))
           })
           //处理map
           let hot=[]
           let ret=[]
           for(let key in map){
               let val=map[key]
               if(val.title.match(/[a-zA-Z]/)){
                   ret.push(val)
               }else if(val.title===HOT_NAME){
                   hot.push(val)
               }
           }
           ret.sort((a,b)=>{
               return a.title.charCodeAt(0)-b.title.charCodeAt(0)
           })//sort的排序方法

           return hot.concat(ret) //用concat连接两个数组
       },
       ...mapMutations({
           setSinger:'SET_SINGER'
       })
    },
    components:{
       Listview
    }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    .singer
        position:fixed
        top 88px
        bottom 0
        width 100%
</style>

