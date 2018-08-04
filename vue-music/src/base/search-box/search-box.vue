<template>
    <div class="search-box">
        <div class="search">
            <i class="icon-search"></i>
            <input class="box" v-model="query"  :placeholder="placeholder">
        </div>
        <span @click="clear" class="clear" v-show="query">取消</span>
    </div>
</template>

<script type="rext/ecmascript-6">
    export default{
        props:{
            placeholder:{
                type:String,
                default:'搜索歌曲、歌手'
            }
        },
        data(){
            return{
                query:''
            }
        },
        created(){
            this.$watch('query',(newQuery)=>{
                this.$emit('query',newQuery)
            })
        },
        methods:{
            clear(){
                this.query=''
            }
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus" >
    @import "~common/stylus/variable"

    .search-box
        display flex
        align-items center
        box-sizing border-box
        width 100%
        padding 10px
        height 56px
        background rgb(244,244,244)
        font-size 0
        .search
            background white
            flex 1
            display flex
            padding-left 5px
            align-items center
            .icon-search
                flex:0 0 24px
                font-size: 24px
                color:  rgba(0,0,0,0.3)
                line-height 36px
            .box
                flex: 1
                line-height: 18px
                background: white
                height 32px
                color:  rgba(0,0,0,0.3)
                font-size: 16px
                outline none
                padding 0 5px
                &::placeholder
                    color: rgba(0,0,0,0.3)
        .clear
            margin-left:8px
            font-size: 16px
            color: rgba(0,0,0,0.8)
</style>
