<template>
    <div class="no-result" v-show="show">
        <div class="no-result-icon">
            <img src="~common/image/noAnswer.png">
        </div>
        <p class="no-result-text">很抱歉，没有找到与“{{title}}”相关的结果</p>
    </div>
</template>

<script type="text/ecmascript-6">
    export default{
        props:{
            title:{
                type:String,
                default:''
            },
            show:{
                type:Boolean,
                default:false
            }
        },
        created(){
            console.log(this.show)
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~common/stylus/variable"

    .no-result
        text-align center
        .no-result-icon img
            width 86px
            height 90px
            margin 0 auto 
            background-size 86px 90px
        .no-result-text
            margin-top 30px
            font-size $font-size-medium
            color rgba(0,0,0,0.5)
</style>
