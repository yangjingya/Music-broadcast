<template>
    <div ref="wrapper">
        <slot>

        </slot>
    </div>
</template>

<script type="text/ecmascript-6">
import BScroll from 'better-scroll'

export default {
    props:{
        probeType:{
            type:Number,   //指定监听事件的 当快速滑动时监听某些事件 当慢速滑动时监听某些事件
            default:1
        },
        click:{
            type:Boolean,
            default:true
        },
        data:{
            type:Array,
            default:null
        }
    },
    mounted(){
        setTimeout(()=>{
            this._initScroll()
        },20)
    },
    methods:{
        _initScroll(){
            if(!this.$refs.wrapper){
                return  //如果BScroll内部没有dom 则return
            }
            this.scroll=new BScroll(this.$refs.wrapper,{
                probeType:this.probeType,
                click:this.click
            })
        },
        enable(){
            this.scroll&&this.scroll.enable()
        },
        disable(){
            this.scroll&&this.scroll.disable()
        },
        refresh(){
            this.scroll&&this.scroll.refresh()
        }
    },
    watch:{
        data(){
            setTimeout(()=>{
                this.refresh()
            },20)
        }//因为data数据变化，则需要修改 BScroll
    }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    
</style>

