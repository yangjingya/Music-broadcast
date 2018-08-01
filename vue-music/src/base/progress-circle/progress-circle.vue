<template>
    <div class="progress-circle">
        <svg :width="radius" :height="radius"  viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <circle class="progress-bar" r="50" cx="50" cy="50" fill="transparent" stroke-dasharray="314" :stroke-dashoffset="circlePercent"></circle>
        </svg>
        <slot></slot>
    </div>
</template>

<script type="text/ecmascript-6">
    const radiusLength=314

    export default{
        props:{
            radius:{
                type:String,
                default:100
            },
            percent:{
                type:Number,
                default:0
            }
        },
        created(){
            this.circlePercent=0
        },
        methods:{
        },
        watch:{
            percent(newPercent){
                this.circlePercent=radiusLength-newPercent*radiusLength
            }
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~common/stylus/variable"

    .progress-circle
        position: relative
        circle
            stroke-width: 8px
            transform-origin: center
            &.progress-bar
                transform: scale(0.9) rotate(-90deg)
                stroke: $color-theme
</style>
