<template>
    <div class="search">
        <div class="search-box-wrapper">
            <search-box ref="searchBox" @query="onQueryChange"></search-box>
        </div>
        <div class="shortcut-wrapper" v-show="!query">
            <div class="shortcut">
                <div class="hot-key">
                    <h1 class="title">热门搜索</h1>
                    <ul>
                        <li @click="reload(specialKey.url)" class="sepcial" v-show="specialKey.val">
                            <span>{{specialKey.val}}</span>
                        </li>
                        <li @click="addQuery(item.k)" class="item" v-for="item in hotKey">
                            <span>{{item.k}}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="search-result" v-show="query">
            <suggest :query="query"></suggest>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
import SearchBox from 'base/search-box/search-box.vue'
import Suggest from 'components/suggest/suggest.vue'
import {getHot} from 'api/search.js'
import {ERR_OK} from 'api/config.js'

export default {
    data(){
        return{
            hotKey:[],
            query:''
        }
    },
    created(){
        this.specialKey={}
        this._getHot()
    },
    methods:{
        reload(url){
            window.location.href=url
        },
        addQuery(query){
            this.$refs.searchBox.setQuery(query)
        },
        onQueryChange(query){
            this.query=query
        },
        _getHot(){
            getHot().then((res)=>{
                if(res.code===ERR_OK){
                    if(res.data.special_key){
                        this.specialKey.val=res.data.special_key
                        this.specialKey.url=res.data.special_url
                    }
                    this.hotKey=res.data.hotkey.slice(0,7)
                }
            })
        }
    },
    components:{
        SearchBox,
        Suggest
    }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~common/stylus/variable"
    @import "~common/stylus/mixin"

    .search
        .search-box-wrapper
            margin: 0
        .shortcut-wrapper
            position: fixed
            top: 160px
            bottom: 0
            width: 100%
            .shortcut
                height: 100%
                overflow: hidden
                .hot-key
                    margin: 0 20px 20px 20px
                    .title
                        margin-bottom: 10px
                        font-size: $font-size-medium
                        color: rgba(0,0,0,0.6)
                        font-weight 700
                    .sepcial
                        display: inline-block
                        padding: 8px 14px
                        margin: 0 20px 10px 0
                        border 1px solid red
                        color red
                        border-radius: 30px
                        font-size: $font-size-medium
                    .item
                        display: inline-block
                        padding: 8px 14px
                        margin: 0 20px 10px 0
                        border 1px solid black
                        border-radius: 30px
                        font-size: $font-size-medium
                .search-history
                    position: relative
                    margin: 0 20px
                    .title
                        display: flex
                        align-items: center
                        height: 40px
                        font-size: $font-size-medium
                        color: $color-text-l
                        .text
                            flex: 1
                        .clear
                            extend-click()
                            .icon-clear
                                font-size: $font-size-medium
                                color: $color-text-d
        .search-result
            position: fixed
            width: 100%
            top: 160px
            bottom: 0
</style>

