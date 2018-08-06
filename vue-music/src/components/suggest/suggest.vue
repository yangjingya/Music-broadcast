<template>
    <scroll class="suggest" :data="result" :pullup="pullup" @scrollToEnd="searchMore" ref="suggest">
        <ul class="suggest-list">
            <li class="suggest-item" v-for="item in result" @click="selectItem(item)">
                <div class="icon">
                    <i :class="getIconClass(item)"></i>
                </div>
                <div class="name">
                    <p class="text" v-html="getDisplayName(item)"></p>
                </div>
            </li>
            <loading v-show="hasMore" title=""></loading>
        </ul>
        <div class="no-result-wrapper">
            <no-result :title="query" :show="show"></no-result>
        </div>
    </scroll>
</template>

<script type="text/ecmascript-6">
    import {searchInfo} from 'api/search.js'
    import {ERR_OK} from 'api/config.js'
    import Scroll from 'base/scroll/scroll.vue'
    import {createSong,getInforForSongs} from 'common/js/song.js'
    import Loading from 'base/loading/loading.vue'
    import Singer from 'common/js/singer.js'
    import {mapMutations,mapActions} from 'vuex'
    import NoResult from 'base/no-result/no-result.vue'

    const TYPE_SINGER='singer'
    const PERPAGE=20

    export default{
        data(){
            return{
                page:1,
                result:[],
                pullup:true,
                hasMore:true,
                show:false
            }
        },
        props:{
            query:{
                type:String,
                default:''
            },
            showSinger:{
                type:Boolean,
                default:true
            }
        },
        methods:{
            search(){
                this.page=1
                this.hasMore=true
                this.$refs.suggest.scrollTo(0,0)
                searchInfo(this.query,this.showSinger,this.page,PERPAGE).then((res)=>{
                    // this.result=this._genResult(res.data)
                    this.result=[]
                    this._genResult(res.data)
                    this._checkMore(res.data)
                    if(res.data.song.list.length>0){
                        this.show=false
                    }else{
                        this.show=true
                    }
                })
            },
            getDisplayName(item){
                if(item.type===TYPE_SINGER){
                    return item.singername
                }else{
                    return `${item.name}-${item.singer}`
                }
            },
            getIconClass(item){
                if(item.type===TYPE_SINGER){
                    return 'icon-mine'
                }else{
                    return 'icon-music'
                }
            },
            selectItem(item){
                if(item.type===TYPE_SINGER){
                    const singer=new Singer({
                        id: item.singermid,
                        name: item.singername
                    })
                    this.$router.push({
                        path: `/search/${singer.id}`
                    })
                    this.setSinger(singer)
                }else{
                    this.insertSong(item)
                }
            },
            searchMore(){
                if(!this.hasMore){
                    return
                }
                this.page++
                searchInfo(this.query,this.showSinger,this.page,PERPAGE).then((res)=>{
                    // this.result=this._genResult(res.data)
                    this._genResult(res.data)
                    this._checkMore(res.data)
                })
            },
            _checkMore(data){
                const song=data.song
                if(!song.list.length||(song.curnum+song.curpage*PERPAGE)>song.totalnum){
                    this.hasMore=false
                }
            },
            _genResult(data){
                // let ret=[]
                if(data.zhida&&data.zhida.singerid&&this.page==1){
                    // ret.push({...data.zhida,...{type:TYPE_SINGER}})
                    this.result.push({...data.zhida,...{type:TYPE_SINGER}})
                }
                if(data.song){
                    // ret=ret.concat(this._normalizeSongs(data.song.list))
                    this._normalizeSongs(data.song.list)
                }
                // return ret
            },
            _normalizeSongs(list){
                // let ret=[]
                if(!list){
                    return
                }
                list.forEach((musicData) => {
                    if(musicData.songid&&musicData.albummid){
                        getInforForSongs(musicData.songmid).then((res)=>{
                            if(res.code===ERR_OK){
                                // ret.push(createSong(musicData,res.data.items[0].vkey))
                                this.result.push(createSong(musicData,res.data.items[0].vkey))
                            } 
                        })     
                    }
                })
                // return ret
            },
            ...mapMutations({
                setSinger:'SET_SINGER'
            }),
            ...mapActions([
                'insertSong'
            ])
        },
        watch:{
            query(){
                this.search()
            }
        },
        components:{
            Scroll,
            Loading,
            NoResult
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~common/stylus/variable"
    @import "~common/stylus/mixin"
    
    .suggest
        height: 100%
        overflow: hidden
        .suggest-list
            padding: 0 30px
            .suggest-item
                display: flex
                align-items: center
                padding-bottom: 20px
            .icon
                flex: 0 0 30px
                width: 30px
                [class^="icon-"]
                    font-size: 20px
                    color: $color-text-d
            .name
                flex: 1
                font-size: $font-size-medium
                color: black
                overflow: hidden
                .text
                    no-wrap()
        .no-result-wrapper
            position: absolute
            width: 100%
            top: 50%
            transform: translateY(-50%)
</style>
