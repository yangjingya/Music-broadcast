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
                <div class="middle" @touchstart.prevent="middleTouchStart" @touchmove.prevent="middleTouchMove" @touchend="middleTouchEnd">
                    <div class="middle-l" ref="middleL">
                        <div class="cd-wrapper" ref="cdWrapper">
                            <div class="cd" :class="cdLoop">
                                <img class="image" :src="currentSong.image">
                            </div>
                        </div>
                        <div class="playing-lyric-wrapper">
                            <div class="playing-lyric">{{playingLyric}}</div>
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
                    <div class="dot-wrapper">
                        <span class="dot" :class="{'active':currentShow==='cd'}"></span>
                        <span class="dot" :class="{'active':currentShow==='lyric'}"></span>
                    </div>
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
                        <div class="icon i-right" @click.stop="toggleFavourite(currentSong)">
                            <i class="icon" :class="getFavouriteIcon(currentSong)"></i>
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
                <div class="control" @click.stop="showPlayList">
                    <i class="icon-playlist" ></i>
                </div>
            </div>
        </transition>
        <playlist ref="playlist"></playlist>
        <audio ref="audio" :src="currentSong.url" @play="ready" @error="error" @timeupdate="updateTime" @ended="end"></audio>
    </div>
</template>

<script type="text/ecmascript-6">
    import {mapGetters,mapMutations,mapActions} from 'vuex' 
    import lyric from 'lyric-parser'
    import animations from 'create-keyframe-animation'
    import {prefixStyle} from 'common/js/dom.js'
    import ProgressBar from 'base/progress-bar/progress-bar.vue'
    import ProgressCircle from 'base/progress-circle/progress-circle'
    import Scroll from 'base/scroll/scroll.vue'
    import Playlist from 'components/playlist/playlist.vue'
    import {playerMixin} from 'common/js/mixin'
    import {playMode} from 'common/js/config.js'
    

    const transform=prefixStyle('transform')
    const transitionDuration=prefixStyle('transitionDuration')
    export default{
        mixins:[playerMixin],
        data(){
            return{
                songReady:false,
                currentTime:0,
                currentSongContent:null,
                currentLineNumber:0,
                currentShow:'cd',
                playingLyric:''
            }
        },
        created(){
            this.touch={}
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
                if(!this.songReady){
                    return
                }
                this.setPlayingState(!this.playing)
                if(this.currentSongContent){
                    this.currentSongContent.togglePlay()
                }
            },
            prev(){
                if(!this.songReady){
                    return
                }
                if(this.playList.length===1){
                    this.loop()
                    return
                }else{
                    let index=this.currentIndex-1
                    if(index===-1){
                        index=this.playList.length-1
                    }
                    this.setCurrentIndex(index)
                    if(!this.playing){
                        this.togglePlaying()
                    }
                }
                this.songReady=false
            },
            next(){
                if(!this.songReady){
                    return
                }
                if(this.playList.length===1){
                    this.loop()
                    return
                }else{
                    let index=this.currentIndex+1
                    if(index===this.playList.length){
                        index=0
                    }
                    this.setCurrentIndex(index)
                    if(!this.playing){
                        this.togglePlaying()
                    }
                }
                this.songReady=false
            },
            ready(){
                this.songReady=true
                this.savePlayHistory(this.currentSong)
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
                const currentTime=percent*this.currentSong.duration
                this.$refs.audio.currentTime=currentTime
                if(!this.playing){
                    this.togglePlaying()
                }
                if(this.currentSongContent){
                    this.currentSongContent.seek(currentTime*1000)
                }
            },
            loop(){
                this.$refs.audio.currentTime=0
                this.$refs.audio.play()
                if(this.currentSongContent){
                    this.currentSongContent.seek(0)
                }
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
                    if(this.currentSong.songContent!==songContent){
                        return
                    }
                    this.currentSongContent=new lyric(songContent,this.handleLyric)
                    if(this.playing){
                        this.currentSongContent.play()
                    }
                }).catch(()=>{
                    this.currentSongContent=null
                    this.playingLyric=''
                    this.currentLineNumber=0
                })
            },
            handleLyric({lineNum,txt}){
                this.currentLineNumber = lineNum
                if (lineNum > 5) {
                let lineEl = this.$refs.lyricLine[lineNum - 5]
                this.$refs.lyricList.scrollToElement(lineEl, 1000)
                } else {
                this.$refs.lyricList.scrollTo(0, 0, 1000)
                }
                this.playingLyric = txt
            },
            middleTouchStart(e){
                this.touch.initiated = true
                // 用来判断是否是一次移动
                this.touch.moved = false
                const touch = e.touches[0]
                this.touch.startX = touch.pageX
                this.touch.startY = touch.pageY
            },
            middleTouchMove(e){
                if(!this.touch.initiated){
                    return
                }
                const deltaX=e.touches[0].pageX-this.touch.startX
                const deltaY=e.touches[0].pageY-this.touch.startY
                if(Math.abs(deltaY)>Math.abs(deltaX)){
                    return
                }
                if (!this.touch.moved) {
                    this.touch.moved = true
                }
                const left=this.currentShow==='cd'?0:-window.innerWidth
                const offsetWidth=Math.min(Math.max(-window.innerWidth,left+deltaX),0)
                this.touch.percent=Math.abs(offsetWidth/window.innerWidth)
                this.$refs.lyricList.$el.style[transform]=`translate3d(${offsetWidth}px,0,0)`
                this.$refs.lyricList.$el.style[transitionDuration]=0
                this.$refs.middleL.style['opacity']=1-this.touch.percent
                this.$refs.middleL.style[transitionDuration]=0
            },
            middleTouchEnd(){
                if (!this.touch.moved) {
                    return
                }
                let offsetWidth
                let opacity
                if(this.currentShow==='cd'){
                    if(this.touch.percent>0.1){
                        offsetWidth=-window.innerWidth
                        this.currentShow='lyric'
                        opacity=0
                    }else{
                        offsetWidth=0
                        opacity=1
                    }
                }else{
                    if(this.touch.percent<0.9){
                        offsetWidth=0
                        this.currentShow='cd'
                        opacity=1
                    }else{
                        offsetWidth=-window.innerWidth
                        opacity=0
                    }
                }
                const time=300
                this.$refs.lyricList.$el.style[transform]=`translate3d(${offsetWidth}px,0,0)`
                this.$refs.lyricList.$el.style[transitionDuration]=`${time}ms`
                this.$refs.middleL.style['opacity']=opacity
                this.$refs.middleL.style[transitionDuration]=`${time}ms`
                this.touch.initiated = false
            },
            showPlayList(){
                this.$refs.playlist.show()
            },
            ...mapMutations({
                setFullScreen:'SET_FULL_SCREEN'
            }),
            ...mapActions([
                'savePlayHistory'
            ])
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
            disableCls(){
                return this.songReady?'':'disabled'
            },
            percent(){
                return this.currentTime/this.currentSong.duration
            },
            ...mapGetters([
                'fullScreen',
                'playing',
                'currentIndex'
            ])
        },
        watch:{
            currentSong(newSong,oldSong){
                if(!newSong.id){
                    return
                }
                if(newSong.id===oldSong.id){
                    return
                }
                if(this.currentSongContent){
                    this.currentSongContent.stop()
                }
                clearTimeout(this.timer)
                this.timer=setTimeout(()=>{
                    this.$refs.audio.play()
                    this.getSongsContent()
                },1000)
            },
            playing(newPlaying) {
                const audio = this.$refs.audio
                this.$nextTick(() => {
                    newPlaying ? audio.play() : audio.pause()
                })
            },
        },
        components:{
            ProgressBar,
            ProgressCircle,
            Scroll,
            Playlist
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
                        margin: 60px auto 0 auto
                        overflow: hidden
                        text-align: center
                        .playing-lyric
                            height: 20px
                            line-height: 20px
                            font-size: $font-size-medium
                            color: rgb(255,255,255)
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
                        background: rgba(255,255,255,0.2)
                        &.active
                            width: 20px
                            border-radius: 5px
                            background: rgba(255,255,255,0.5)
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

