<template>
    <transition name="slide">
        <music-list :songs="songs" :bg-image="bgImage" :title="title"></music-list>
    </transition>
</template>

<script type="text/ecmascript-6">
import {mapGetters} from 'vuex';
import {getSingerDetail} from 'api/singer.js'
import {ERR_OK} from 'api/config.js'
import {createSong,getInforForSongs} from 'common/js/song.js'
import MusicList from 'components/music-list/music-list.vue'

export default {
    data(){
      return{
          songs:[],
      }  
    },
    computed: {
        title(){
            return this.singer.name
        },
        bgImage(){
            return this.singer.avatar
        },
        ...mapGetters([
            "singer"
        ])
    },
    created() {
        this._getSingerDetail()
    },
    methods:{
        _getSingerDetail(){
            if(!this.singer.id){
                this.$router.push({
                    path:`/singer`
                })
                return
            }
            this.singerInfo=this.singer
            getSingerDetail(this.singer.id).then((res)=>{
                if(res.code===ERR_OK){
                    this.songs = this._normalizeSongs(res.data.list)           
                }
            })
        },
        _normalizeSongs(list){
            let ret=[]
            if(!list){
                return
            }
            list.forEach((item) => {
                let {musicData}=item//获取item的musicData对象,{}中的值对应item中与其相对的属性值
                if(musicData.songid&&musicData.albummid){
                    getInforForSongs(musicData.songmid).then((res)=>{
                       if(res.code===ERR_OK){
                           ret.push(createSong(musicData,res.data.items[0].vkey))
                       } 
                    })   
                }
            });
            return ret
        }
    },
    components:{
        MusicList
    }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~common/stylus/variable"

    .slide-enter-active,.slide-leave-active
        transition all 0.4s
    .slide-enter,.slide-leave-to
        transform translate3d(100%,0,0)

</style>

