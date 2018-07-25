<template>
    <div>
        <ul>
            <li v-for="item in singerList">
                <img :src="item.singer_pic" >
                <h2>{{item.singer_name}}</h2>
                <p>{{item.country}}</p>
            </li>
        </ul>
    </div>
</template>

<script type="text/ecmascript-6">
import {getSingers} from 'api/singer.js'

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
       _getSingers(){
           getSingers().then((res)=>{
               this.singerList=res.singerList.data.singerlist
           })
       }
   }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    
</style>

