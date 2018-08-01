<template>
    <div class="progress-bar" ref="progressBar" @click.prevent="progressClick">
        <div class="bar-inner">
            <div class="progress" ref="progress"></div>
            <div class="progress-btn-wrapper" ref="progressBtn"  @touchstart.prevent="progressTouchStart" @touchmove.prevent="progressTouchMove" @touchend.prevent="progressTouchEnd">
                <div class="progress-btn"></div>
            </div>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
    import {prefixStyle} from 'common/js/dom.js'

    const progressBarWidth=14
    const transform=prefixStyle('transform')

    export default{
        props:{
            percent:{
                type:Number,
                default:0
            }
        },
        watch:{
            percent(newPercent){
                if(newPercent>=0&&!this.touch.initiate){ 
                    const barWidth=this.$refs.progressBar.clientWidth-progressBarWidth
                    const offSetWidth=newPercent*barWidth
                    this._offSet(offSetWidth)
                }
            }
        },
        created(){
            this.touch={}
        },
        methods:{
            progressTouchStart(e){
                this.touch.initiate=true
                this.touch.startX=e.touches[0].pageX
                this.touch.left=this.$refs.progress.clientWidth
            },
            progressTouchMove(e){
                if(!this.touch.initiate){
                    return
                }
                const deltaX=e.touches[0].pageX-this.touch.startX
                const offSetWidth=Math.min(Math.max(0,this.touch.left+deltaX),this.$refs.progressBar.clientWidth-progressBarWidth) 
                this._offSet(offSetWidth)
            },
            progressTouchEnd(e){
                this.touch.initiate=false
                this._trrigerPercent()
            },
            progressClick(e){
                this._offSet(e.offsetX)
                this._trrigerPercent()
            },
            _offSet(offSetWidth){
                this.$refs.progress.style['width']=`${offSetWidth}px`
                this.$refs.progressBtn.style[transform]=`translate3d(${offSetWidth}px,0,0)`
            },
            _trrigerPercent(){
                const barWidth=this.$refs.progressBar.clientWidth-progressBarWidth
                const percent=this.$refs.progress.clientWidth/barWidth
                this.$emit('percentChange',percent)
            }
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~common/stylus/variable"

    .progress-bar
        height 30px
        .bar-inner
            position relative
            top 13px
            height 3px
            background rgba(0,0,0,0.1)
            .progress
                position absolute
                height 100%
                background $color-theme
            .progress-btn-wrapper
                position absolute
                left -8px
                top -13px
                width 30px
                height 30px
                .progress-btn
                    position relative
                    top 7px
                    left 7px
                    box-sizing border-box
                    width 14px
                    height 14px
                    border-radius 50%
                    background white
</style>

