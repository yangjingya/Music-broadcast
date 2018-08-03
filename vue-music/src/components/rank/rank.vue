<template>
    <div class="rank" ref="rank">
        <scroll class="toplist" :data="topList" ref="topList">
            <ul>
                <li class="item" v-for="item in topList" @click="selectItem(item)">
                    <div class="icon">
                        <img width="100" height="100" v-lazy="item.picUrl">
                    </div>
                    <ul class="songlist">
                        <span class="topTitle">{{item.topTitle}}</span>
                        <li class="song" v-for="(song,index) in item.songList">
                            <span>{{index+1}}</span>
                            <span class="songname">{{song.songname}}</span>
                            <span>-{{song.singername}}</span>
                        </li>
                    </ul>
                </li>
            </ul>
        </scroll>
        <div class="loading-container" v-show="!topList.length">
            <loading></loading>
        </div>
        <router-view></router-view>
    </div>
</template>

<script type="text/ecmascript-6">
import {getRank} from 'api/rank.js'
import {ERR_OK} from 'api/config.js'
import {playListMixin} from 'common/js/mixin.js'
import Scroll from 'base/scroll/scroll.vue'
import Loading from 'base/loading/loading'
import {mapMutations} from 'vuex'

export default {
    mixins:[playListMixin],
    data(){
        return{
            topList:[]
        }
    },
    created(){
        this._getRank()
    },
    methods:{
        selectItem(item){
            this.$router.push({
                path: `/rank/${item.id}`
            })
            this.setTopList(item)
        },
        handlePlaylist(playList){
            const bottom = playList.length > 0 ? '60px' : ''
            this.$refs.rank.style.bottom = bottom
            this.$refs.topList.refresh()
        },
        _getRank(){
            getRank().then((res)=>{
                if(res.code===ERR_OK){
                    this.topList=res.data.topList
                }
            })
        },
        ...mapMutations({
            setTopList:'SET_TOP_LIST'
        })
    },
    components:{
        Scroll,
        Loading
    }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~common/stylus/variable"
    @import "~common/stylus/mixin"

    .rank
        position: fixed
        width: 100%
        top: 88px
        bottom: 0
        .toplist
            height: 100%
            overflow: hidden
            .item
                display: flex
                margin: 0 20px
                padding-top: 20px
                height: 100px
                &:last-child
                    padding-bottom: 20px
                .icon
                    flex: 0 0 100px
                    width: 100px
                    height: 100px
                .songlist
                    flex: 1
                    display: flex
                    flex-direction: column
                    justify-content: center
                    padding: 0 20px
                    height: 100px
                    overflow: hidden
                    background: $color-highlight-background
                    color: $color-text-d
                    font-size: $font-size-small
                    .topTitle
                        font-size:$font-size-large
                        color:black
                    .song
                        no-wrap()
                        line-height: 26px
                        .songname
                            font-size:$font-size-medium
                            color:black
            .loading-container
                position: absolute
                width: 100%
                top: 50%
                transform: translateY(-50%)
</style>

