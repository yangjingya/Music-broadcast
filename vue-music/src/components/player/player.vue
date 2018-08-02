<template>
    <div class="player" v-show="playList.length>0">
        <transition name="normal" @enter="enter" @after-enter="afterEnter" @leave="leave" @after-leave="afterLeave"> 
            <div class="normal-player" v-show="fullScreen">
                <div class="background">
                    <img width="100%" height="100%" :src="currentSong.image">
                </div>
                <div class="top">
                    <div class="back" @click="back">
                        <i class="icon-back"></i>
                    </div>
                    <h1 class="title">{{currentSong.name}}</h1>
                    <h2 class="subtitle">{{currentSong.singer}}</h2>
                </div>
                <div class="middle">
                    <div class="middle-l">
                        <div class="cd-wrapper" ref="cdWrapper">
                            <div class="cd" :class="cdLoop">
                                <img class="image" :src="currentSong.image">
                            </div>
                        </div>
                    </div>
                    <scroll class="middle-r" ref="lyricList" :data="currentSongContent&&currentSongContent.lines">
                        <div class="lyric-wrapper">
                            <div v-if="currentSongContent">
                                <p ref="lyricLine" :class="{'current':currentLineNumber===index}" class="text" v-for="(line,index) in currentSongContent.lines">
                                    {{line.txt}}
                                </p>
                            </div>
                        </div>
                    </scroll>
                </div>
                <div class="bottom">
                    <div class="progress-wrapper">
                        <span class="time time-l">{{format(currentTime)}}</span>
                        <div class="progress-bar-wrapper">
                            <progress-bar :percent="percent" @percentChange="onProgressPercentChange"></progress-bar>
                        </div>
                        <span class="time time-r">{{format(currentSong.duration)}}</span>
                    </div>
                    <div class="operators">
                        <div class="icon i-left" @click="changeMode">
                            <i :class="iconMode"></i>
                        </div>
                        <div class="icon i-left" :class="disableCls">
                            <i @click="prev" class="icon-prev" ></i>
                        </div>
                        <div class="icon i-center" :class="disableCls">
                            <i @click="togglePlaying" :class="playIcon"></i>
                        </div>
                        <div class="icon i-right" :class="disableCls">
                            <i @click="next" class="icon-next"></i>
                        </div>
                        <div class="icon i-right">
                            <i class="icon-not-favorite"></i>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
        <transition name="mini">
            <div class="mini-player" v-show="!fullScreen" @click="open">
                <div class="icon">
                    <img :class="cdLoop" width="40" height="40" :src="currentSong.image">
                </div>
                <div class="text">
                    <h2 class="name">{{currentSong.name}}</h2>
                    <p class="desc">{{currentSong.singer}}</p>
                </div>
                <div class="control">
                    <progress-circle radius="32" :percent="percent">
                        <i @click.stop="togglePlaying" class="icon-mini" :class="miniIcon"></i>
                    </progress-circle>
                </div>
                <div class="control">
                    <i class="icon-playlist" ></i>
                </div>
            </div>
        </transition>
        <audio ref="audio" :src="currentSong.url" @canplay="ready" @error="error" @timeupdate="updateTime" @ended="end"></audio>
    </div>
</template>

<script type="text/ecmascript-6">
    import {mapGetters,mapMutations} from 'vuex' 
    import lyric from 'lyric-parser'
    import animations from 'create-keyframe-animation'
    import {prefixStyle} from 'common/js/dom.js'
    import ProgressBar from 'base/progress-bar/progress-bar.vue'
    import ProgressCircle from 'base/progress-circle/progress-circle'
    import {playMode} from 'common/js/config.js'
    import {shuffle} from 'common/js/util.js'
    import Scroll from 'base/scroll/scroll.vue'

    const transform=prefixStyle('transform')
    export default{
        data(){
            return{
                songReady:false,
                currentTime:0,
                currentSongContent:[],
                currentLineNumber:0
            }
        },
        methods:{
            back(){
                this.setFullScreen(false)
            },
            open(){
                this.setFullScreen(true)
            },
            enter(el,done){
                const{x,y,scale}=this.getPosAndScale()

                let animation={
                    0:{
                        transform:`translate3d(${x}px,${y}px,0) scale(${scale})`
                    },
                    60:{
                        transform:`translate3d(0,0,0) scale(1.1)`
                    },
                    100:{
                        transform:`translate3d(0,0,0) scale(1)`
                    }
                }

                animations.registerAnimation({
                    name:'move',
                    animation,
                    presets:{
                        duration:400,
                        easing:'linear'
                    }
                })

                animations.runAnimation(this.$refs.cdWrapper,'move',done)
            },
            afterEnter(){
                animations.unregisterAnimation('move')
                this.$refs.cdWrapper.style.animation=''
            },
            leave(el,done){
                this.$refs.cdWrapper.style['transition']='all 0.4s'
                const {x,y,scale}=this.getPosAndScale()
                this.$refs.cdWrapper.style[transform]=`translate3d(${x}px,${y}px,0) scale(${scale})`
                this.$refs.cdWrapper.addEventListener('transitionend',done)
            },
            afterLeave(){
                this.$refs.cdWrapper.style.transition=''
                this.$refs.cdWrapper.style.transform=''
            },
            getPosAndScale(){
                const targetWidth=40
                const paddingLeft=40
                const paddingBottom=30
                const paddingTop=80
                const width=window.innerWidth*0.8
                const scale=targetWidth/width
                const x=-(window.innerWidth/2-paddingLeft)
                const y=window.innerHeight-paddingTop-width/2-paddingBottom
                return {
                    x,
                    y,
                    scale
                }
            },
            togglePlaying(){
                this.setPlayingState(!this.playing)
            },
            prev(){
                if(!this.songReady){
                    return
                }
                let index=this.currentIndex-1
                if(index===-1){
                    index=this.playList.length-1
                }
                this.setCurrentIndex(index)
                if(!this.playing){
                    this.togglePlaying()
                }
                this.songReady=false
            },
            next(){
                if(!this.songReady){
                    return
                }
                let index=this.currentIndex+1
                if(index===this.playList.length){
                    index=0
                }
                this.setCurrentIndex(index)
                if(!this.playing){
                    this.togglePlaying()
                }
                this.songReady=false
            },
            ready(){
                this.songReady=true
            },
            error(){
                this.songReady=true//出现网络错误时 不影响使用
            },
            updateTime(e){
                this.currentTime=e.target.currentTime
            },
            format(interval){    
                interval=interval|0 //正数的向下取整
                const minite=interval/60 |0
                const second=interval%60>9?interval%60:'0'+interval%60
                return `${minite}:${second}`
            },
            onProgressPercentChange(percent){
                this.$refs.audio.currentTime=percent*this.currentSong.duration
                if(!this.playing){
                    this.togglePlaying()
                }
            },
            changeMode(){
                const mode=(this.mode+1)%3
                this.setPlayMode(mode)
                let list=null
                if(mode===playMode.random){
                    list=shuffle(this.sequenceList)
                }else{
                    list=this.sequenceList
                }
                console.log(this.sequenceList)
                this.resetCurrentIndex(list)
                this.setPlayList(list)
            },
            resetCurrentIndex(list){
                let index=list.findIndex((item)=>{
                    return item.id===this.currentSong.id
                })
                this.setCurrentIndex(index)
            },
            loop(){
                this.$refs.audio.currentTime=0
                this.$refs.audio.play()
            },
            end(){
                if(this.mode===playMode.loop){
                    this.loop()
                }else{
                    this.next()
                }
            },
            getSongsContent(){
                this.currentSong.getSongsContent().then((songContent)=>{
                    this.currentSongContent=new lyric(songContent,this.handleLyric)
                    if(this.playing){
                        this.currentSongContent.play()
                    }
                })
            },
            handleLyric({lineNum,txt}){
                this.currentLineNumber=lineNum
                if(lineNum>5){
                    let lineEl=this.$refs.lyricLine[lineNum-5]
                    this.$refs.lyricList.scrollToElement(lineEl,1000)
                }else{
                    this.$refs.lyricList.scrollTo(0,0,1000)
                }
            },
            ...mapMutations({
                setFullScreen:'SET_FULL_SCREEN',
                setPlayingState:'SET_PLAYING_STATE',
                setCurrentIndex:'SET_CURRENT_INDEX',
                setPlayMode:'SET_PLAY_MODE',
                setPlayList:'SET_PLAYLIST'
            })
        },
        computed:{
            cdLoop(){
                return this.playing?'play':'play pause'
            },
            playIcon(){
                return this.playing?'icon-pause':'icon-play'
            },
            miniIcon(){
                return this.playing?'icon-pause-mini':'icon-play-mini'
            },
            iconMode(){
                if(this.mode===playMode.sequence){
                    return 'icon-sequence'
                }else if(this.mode===playMode.loop){
                    return 'icon-loop'
                }else{
                    return 'icon-random'
                }
            },
            disableCls(){
                return this.songReady?'':'disabled'
            },
            percent(){
                return this.currentTime/this.currentSong.duration
            },
            ...mapGetters([
                'fullScreen',
                'playList',
                'currentSong',
                'playing',
                'currentIndex',
                'mode',
                'sequenceList'
            ])
        },
        watch:{
            currentSong(newSong,oldSong){
                if(newSong.id===oldSong.id){
                    return
                }
                this.$nextTick(()=>{
                    this.$refs.audio.play()
                    this.getSongsContent()
                })
            },
            playing(whetherPlay){
                const audio=this.$refs.audio
                this.$nextTick(()=>{
                    whetherPlay?audio.play():audio.pause()
                })
            }
        },
        components:{
            ProgressBar,
            ProgressCircle,
            Scroll
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~common/stylus/variable"
    @import "~common/stylus/mixin"
    .player
        .normal-player
            position:fixed
            left:0
            right:0
            top:0
            bottom:0
            z-index:150
            background:black
            .background
                position:absolute
                left:0
                top:0
                width:100%
                height:100%
                z-index:-1
                opacity:0.6
                filter:blur(20px)
            .top
                position:relative
                margin-bottom:25px
                .back
                    position:absolute
                    top:0
                    left:6px
                    z-index:50
                    .icon-back
                        display:block
                        padding:9px
                        font-size:$font-size-large-x
                        color:white
                        transform:rotate(-90deg)
                .title
                    width:70%
                    margin:0 auto
                    line-height 40px
                    text-align center
                    no-wrap()
                    font-size $font-size-large
                    color $color-text-dd
                .subtitle
                    line-height 20px
                    text-align center
                    font-size $font-size-medium
                    color $color-text-dd
            .middle
                position fixed
                width 100%
                top 80px
                bottom 170px
                white-space nowrap
                font-size 0
                .middle-l
                    display inline-block
                    vertical-align top
                    position relative
                    width 100%
                    height 0
                    padding-top 80%
                    .cd-wrapper
                        position absolute
                        left 10%
                        top 0
                        width 80%
                        height 100%
                        border 10px solid rgba(0,0,0,0.3)
                        border-radius 50%
                        .cd
                            width 100%
                            height 100%
                            box-sizing border-box
                            &.play
                                animation rotate 20s linear infinite
                            &.pause
                                animation-play-state paused
                            .image
                                position absolute
                                left 0
                                top 0
                                width 100%
                                height 100%
                                border-radius 50%
                    .playing-lyric-wrapper
                        width: 80%
                        margin: 30px auto 0 auto
                        overflow: hidden
                        text-align: center
                        .playing-lyric
                            height: 20px
                            line-height: 20px
                            font-size: $font-size-medium
                            color: $color-text-l
                .middle-r
                    display: inline-block
                    vertical-align: top
                    width: 100%
                    height: 100%
                    overflow: hidden
                    .lyric-wrapper
                        width: 80%
                        margin: 0 auto
                        overflow: hidden
                        text-align: center
                        .text
                            line-height: 32px
                            color: rgba(255,255,255,0.6)
                            font-size: $font-size-medium
                            &.current
                                color: $color-theme
            .bottom
                position: absolute
                bottom: 50px
                width: 100%
                .dot-wrapper
                    text-align: center
                    font-size: 0
                    .dot
                        display: inline-block
                        vertical-align: middle
                        margin: 0 4px
                        width: 8px
                        height: 8px
                        border-radius: 50%
                        background: $color-text-l
                        &.active
                            width: 20px
                            border-radius: 5px
                            background: $color-text-ll
                .progress-wrapper
                    display: flex
                    align-items: center
                    width: 80%
                    margin: 0px auto
                    padding: 10px 0
                    .time
                        color: rgba(255,255,255,0.6)
                        font-size: $font-size-small
                        flex: 0 0 30px
                        line-height: 30px
                        width: 30px
                        &.time-l
                            text-align: left
                        &.time-r
                            text-align: right
                    .progress-bar-wrapper
                        flex: 1
                .operators
                    display: flex
                    align-items: center
                    .icon
                        flex: 1
                        color: $color-text-dd
                        &.disable
                            color: $color-text-ddd
                        i
                            font-size: 30px
                    .i-left
                        text-align: right
                    .i-center
                        padding: 0 20px
                        text-align: center
                        i
                            font-size: 40px
                    .i-right
                        text-align: left
                    .icon-favorite
                        color: $color-sub-theme
            &.normal-enter-active, &.normal-leave-active
                transition: all 0.4s
                .top, .bottom
                    transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
            &.normal-enter, &.normal-leave-to
                opacity: 0
                .top
                    transform: translate3d(0, -100px, 0)
                .bottom
                    transform: translate3d(0, 100px, 0)
        .mini-player
            display:flex
            align-items:center
            position:fixed
            left:0
            bottom:0
            z-index:180
            width:100%
            height:60px
            background:white
            border-top:1px solid rgba(0,0,0,0.1)
            &.mini-enter-active, &.mini-leave-active
                transition: all 0.4s
            &.mini-enter, &.mini-leave-to
                opacity: 0
            .icon
                flex: 0 0 40px
                width: 40px
                padding: 0 10px 0 20px
                img
                    border-radius: 50%
                    &.play
                        animation: rotate 10s linear infinite
                    &.pause
                        animation-play-state: paused
            .text
                display: flex
                flex-direction: column
                justify-content: center
                flex: 1
                line-height: 20px
                overflow: hidden
                .name
                    margin-bottom: 2px
                    no-wrap()
                    font-size: $font-size-medium
                    color: $color-text
                .desc
                    no-wrap()
                    font-size: $font-size-small
                    color: $color-text-d
            .control
                flex: 0 0 30px
                width: 30px
                padding: 0 10px
                .icon-play-mini, .icon-pause-mini
                    font-size: 30px
                    color: $color-theme-dd
                .icon-playlist
                    font-size: 30px
                    color: $color-theme
                .icon-mini
                    font-size: 32px
                    position: absolute
                    left: 0
                    top: 0

    @keyframes rotate
        0%
            transform: rotate(0)
        100%
            transform: rotate(360deg)
</style>
