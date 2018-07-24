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
            type:Number
        }
    }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    
</style>

