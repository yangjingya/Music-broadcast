<template>
    <transition name="slide">
        <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
    </transition>
</template>

<script type="text/ecmascript-6">
    import MusicList from 'components/music-list/music-list'
    import {mapGetters} from 'vuex'
    import {getSongList} from 'api/recommend'
    import {ERR_OK} from 'api/config.js'
    import {createSong,getInforForSongs} from 'common/js/song.js'

    export default{
        data(){
            return{
                songs:[]
            }
        },
        created(){
            this._getSongList()
        },
        methods:{
            _getSongList(){  
                if(!this.disc.dissid){
                    this.$router.push('/recommend')
                    return
                }
                getSongList(this.disc.dissid).then((res)=>{
                    this.songs = this._normalizeSongs(res.cdlist[0].songlist)
                })
            },
            _normalizeSongs(list){
                let ret=[]
                if(!list){
                    return
                }
                list.forEach((musicData,index) => {
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
                return this.disc.dissname
            },
            bgImage(){
                return this.disc.imgurl
            },
            ...mapGetters([
                'disc'
            ])
        },
        components:{
            MusicList
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">

    .slide-enter-active,.slide-leave-active
        transition:all 0.3s
    .slide-enter,.slide-leave-to
        transform translate3d(100%,0,0)
</style>

