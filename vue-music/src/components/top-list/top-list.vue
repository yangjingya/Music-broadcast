<template>
    <transition name="slide">
        <music-list :rank="rank" :title="title" :bg-image="bgImage" :songs="songs"></music-list>
    </transition>
</template>

<script type="text/ecmascript-6">
import MusicList from 'components/music-list/music-list.vue'
import {mapGetters} from 'vuex'
import {getMusicList} from 'api/rank'
import {createSong,getInforForSongs} from 'common/js/song.js'
import {ERR_OK} from 'api/config.js'
export default {
    data(){
        return{
            songs:[],
            rank:true
        }
    },
    created(){
        this._getMusicList()
    },
    methods:{
        _getMusicList(){
            if(!this.topList.id){
                this.$router.push('/rank')
                return
            }
            getMusicList(this.topList.id).then((res)=>{
                this.songs = this._normalizeSongs(res.songlist)
            })
        },
        _normalizeSongs(list){
            let ret=[]
            if(!list){
                return
            }
            list.forEach((item,index) => {
                let musicData=item.data
                if(musicData.albummid&&musicData.songmid){
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
    computed:{
        title(){
            return this.topList.topTitle
        },
        bgImage(){
            if(this.songs.length){
                return this.topList.picUrl
            }
        },
        ...mapGetters([
            'topList'
        ])
    },
    components:{
        MusicList
    }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    .slide-enter-active, .slide-leave-active
        transition: all 0.3s ease
    .slide-enter, .slide-leave-to
        transform translate3d(100%, 0, 0)
</style>

