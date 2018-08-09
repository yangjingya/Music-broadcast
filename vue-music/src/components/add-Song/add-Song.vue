<template>
    <transition name="slide">
        <div class="add-song" v-show="showFlag" @click.stop>
            <div class="header">
                <h1 class="title">添加歌曲到列表</h1>
                <div class="close" @click="hide">关闭</div>
            </div>
            <div>
                <search-box ref="searchBox" @query="onQueryChange" placeholder="搜索歌曲"></search-box>
            </div>
            <div class="shortcut" v-show="!query">
                <switches :switches="switches" :currentIndex="currentIndex" @switch="switchItem"></switches>
                <div class="list-wrapper">
                    <scroll ref="songlist" v-show="currentIndex===0" :data="playHistory" class="list-scroll">
                        <div class="list-inner">
                            <song-list :songs="playHistory" @select="selectSong"></song-list>
                        </div>
                    </scroll>
                    <scroll ref="searchlist" v-show="currentIndex===1" :data="playHistory" class="list-scroll" :refreshDelay="refreshDelay">
                        <div class="list-inner">
                            <search-list @select="addQuery" @delete="deleteSearchHistory" :searches="searchHistory"></search-list>
                        </div>
                    </scroll>
                </div>
            </div>
            <div class="search-result" v-show="query">
                <suggest :query="query" :showSinger="showSinger" @select="selectSuggest"></suggest>
            </div>
            <top-tip ref="toptip">
                <div class="tip-title">
                    <span class="text">一首歌曲已经添加到歌曲队列</span>
                </div>
            </top-tip>
        </div>
    </transition>
</template>

<script type="text/ecmascript-6">
    import SearchBox from 'base/search-box/search-box.vue'
    import Suggest from 'components/suggest/suggest.vue'
    import Switches from 'base/switches/switches'
    import Scroll from 'base/scroll/scroll.vue'
    import SongList from 'base/song-list/song-list.vue'
    import SearchList from 'base/search-list/search-list.vue'
    import TopTip from 'base/top-tip/top-tip.vue'
    import {searchMixin} from 'common/js/mixin.js'
    import {mapActions,mapGetters} from 'vuex'
    import Song from 'common/js/song.js'
    

    export default{
        mixins:[searchMixin],
        data(){
            return{
                showFlag:false,
                showSinger:false,
                currentIndex: 0,
                switches: [
                    {
                        name: '最近播放'
                    },
                    {
                        name: '搜索历史'
                    }
                ]
            }
        },
        methods:{
            show(){
                this.showFlag=true
                setTimeout(()=>{
                    if(this.currentIndex===0){
                        this.$refs.songlist.refresh()
                    }else{
                        this.$refs.searchlist.refresh()
                    }
                },20)
            },
            hide(){
                this.showFlag=false
            },
            selectSuggest(){
                this.saveSearch()
                this.showTip()
            },
            switchItem(index) {
                this.currentIndex = index
            },
            selectSong(song,index){
                if(index!==0){
                    this.insertSong(new Song(song))
                }
                this.showTip()
            },
            showTip(){
                this.$refs.toptip.show()
            },
            ...mapActions([
                "insertSong",
                "savePlayHistory"
            ])
        },
        computed:{
            ...mapGetters([
                "playHistory"
            ])
        },
        components:{
            SearchBox,
            Suggest,
            Switches,
            Scroll,
            SongList,
            SearchList,
            TopTip
        }
    }
</script>

<style lang="stylus" scoped  rel="stylesheet/stylus">
    @import "~common/stylus/variable"
    @import "~common/stylus/mixin"

    .add-song
        position: fixed
        top: 0
        bottom: 0
        width: 100%
        z-index: 200
        background: $color-background
        &.slide-enter-active, &.slide-leave-active
            transition: all 0.3s
        &.slide-enter, &.slide-leave-to
            transform: translate3d(100%, 0, 0)
        .header
            position: relative
            height: 44px
            text-align: center
            .title
                line-height: 44px
                font-size: $font-size-large
                color: $color-text
            .close
                position: absolute
                top: 0
                right: 8px
                display: block
                padding: 16px
                font-size: $font-size-medium
        .shortcut
            margin-top:20px
            .list-wrapper
                position: absolute
                top: 152px
                bottom: 0
                width: 100%
                .list-scroll
                    height: 100%
                    overflow: hidden
                    .list-inner
                        padding: 20px 30px
        .search-result
            position: fixed
            top: 124px
            bottom: 0
            width: 100%
        .tip-title
            text-align: center
            padding: 18px 0
            font-size: 0
            .icon-ok
                font-size: $font-size-medium
                color: $color-theme
                margin-right: 4px
            .text
                font-size: $font-size-medium
                color: $color-text
</style>

