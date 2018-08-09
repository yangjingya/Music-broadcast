import {mapGetters,mapMutations,mapActions} from 'vuex'
import {playMode} from 'common/js/config.js'
import {shuffle} from 'common/js/util.js'

export const playListMixin={
    computed:{
        ...mapGetters([
            'playList'
        ])
    },
    mounted(){
        this.handlePlaylist(this.playList)
    },
    activated() {
        this.handlePlaylist(this.playList)
    },
    watch:{
        playList(newVal) {
            this.handlePlaylist(newVal)
        }
    },
    methods:{
        handlePlaylist() {
            throw new Error('component must implement handlePlaylist method')
        }
    }
}

export const playerMixin={
    computed:{
        iconMode(){
            if(this.mode===playMode.sequence){
                return 'icon-sequence'
            }else if(this.mode===playMode.loop){
                return 'icon-loop'
            }else{
                return 'icon-random'
            }
        },
        ...mapGetters([
            'sequenceList',
            'currentSong',
            'playList',
            'mode'
        ])
    },
    methods:{
        changeMode(){
            const mode=(this.mode+1)%3
            this.setPlayMode(mode)
            let list=null
            if(mode===playMode.random){
                list=shuffle(this.sequenceList)
            }else{
                list=this.sequenceList
            }
            this.resetCurrentIndex(list)
            this.setPlayList(list)
        },
        resetCurrentIndex(list){
            let index=list.findIndex((item)=>{
                return item.id===this.currentSong.id
            })
            this.setCurrentIndex(index)
        },
        ...mapMutations({
            setCurrentIndex:'SET_CURRENT_INDEX',
            setPlayingState:'SET_PLAYING_STATE',
            setPlayMode:'SET_PLAY_MODE',
            setPlayList:'SET_PLAYLIST'
        }),
    }
}

export const searchMixin={
    data(){
        return{
            query:'',
            refreshDelay:100
        }
    },
    computed:{
        ...mapGetters([
            'searchHistory'
        ])
    },
    methods:{
        addQuery(query){
            this.$refs.searchBox.setQuery(query)
        },
        saveSearch(){
            this.savaSearchHistory(this.query)
        },
        onQueryChange(query){
            this.query=query
        },
        saveSearch(){
            this.savaSearchHistory(this.query)
        },
        ...mapActions([
            'deleteSearchHistory',
            'savaSearchHistory'
        ])
    }
}