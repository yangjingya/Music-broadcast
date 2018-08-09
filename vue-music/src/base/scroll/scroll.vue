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
        },
        listenScroll:{
            type:Boolean,
            default:false
        },
        pullup:{
            type:Boolean,
            default:false
        },//开启上拉刷新
        refreshDelay:{
            type:Number,
            default:20
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

            if(this.listenScroll){//获取当前位置
                this.scroll.on('scroll',(pos)=>{
                    this.$emit('scroll',pos)
                })
            }

            if(this.pullup){
                this.scroll.on('scrollEnd',()=>{
                    if(this.scroll.y<=(this.scroll.maxScrollY+50)){
                        this.$emit('scrollToEnd')
                    }
                })
            }
        },
        enable(){
            this.scroll&&this.scroll.enable()
        },
        disable(){
            this.scroll&&this.scroll.disable()
        },
        refresh(){
            this.scroll&&this.scroll.refresh()
        },
        scrollTo(){
            this.scroll&&this.scroll.scrollTo.apply(this.scroll,arguments)//让scroll获取到scrollTo的功能，重定向this
        },
        scrollToElement(){//apply将参数传递到scroll的的函数中去
            this.scroll&&this.scroll.scrollToElement.apply(this.scroll,arguments)
        }
    },
    watch:{
        data(){
            setTimeout(()=>{
                this.refresh()
            },this.refreshDelay)
        }//因为data数据变化，则需要修改 BScroll
    }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    
</style>

