import { _decorator, Component, Node, LabelComponent, SpriteComponent, SpriteFrame, AnimationComponent } from 'cc';
import { Constants } from '../data/Constants';
import { CustomEventListener } from '../data/CustomEventListener';
import { GameData } from '../data/GameData';
import { AudioManager } from '../game/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('GameUI')
export class GameUI extends Component {
    @property(LabelComponent)
    targetLevel: LabelComponent = null

    @property(LabelComponent)
    srcLevel: LabelComponent = null

    @property(SpriteComponent)
    targetSp: SpriteComponent = null

    @property(SpriteComponent)
    srcSp: SpriteComponent = null

    @property(SpriteFrame)
    levelFinished: SpriteFrame = null

    @property(SpriteFrame)
    levelUnfinished: SpriteFrame = null

    @property(SpriteComponent)
    progress: SpriteComponent[] = []


    @property(SpriteFrame)
    progress1: SpriteFrame = null

    @property(SpriteFrame)
    progress2: SpriteFrame = null

    @property(SpriteFrame)
    progress3: SpriteFrame = null

    @property(SpriteComponent)
    avatar: SpriteComponent = null

    @property(LabelComponent)
    content: LabelComponent = null

    @property(Node)
    talkNode: Node = null

    @property(Node)
    guideNode: Node = null

    private _data: GameData = null

    show() {
        this._data = GameData.instance
        this._refreshUI()
        this._showGuide(true)

        CustomEventListener.on(Constants.EventName.GREETING, this._greeting, this)
        CustomEventListener.on(Constants.EventName.GOODBYTE, this._taking, this)
        CustomEventListener.on(Constants.EventName.SHOW_TALK, this._showTalk, this)
        CustomEventListener.on(Constants.EventName.SHOW_GUIDE, this._showGuide, this)
    }

    hide() {
        CustomEventListener.off(Constants.EventName.GREETING, this._greeting, this)
        CustomEventListener.off(Constants.EventName.GOODBYTE, this._taking, this)
        CustomEventListener.off(Constants.EventName.SHOW_TALK, this._showTalk, this)
        CustomEventListener.off(Constants.EventName.SHOW_GUIDE, this._showGuide, this)
    }

    private _greeting() {
        this.progress[this._data.maxProgress - 1 - this._data.currProgress].spriteFrame = this.progress2
    }

    private _taking() {
        this.progress[this._data.maxProgress - this._data.currProgress].spriteFrame = this.progress1
        if (this._data.currProgress === this._data.maxProgress) {
            this.targetSp.spriteFrame = this.levelFinished
        }
    }

    private _showTalk(customerId: string) {
        const talks = Constants.Talks
        const idx = Math.floor(Math.random() * talks.length)
        const str = talks[idx]
        this.content.string = str
        this.talkNode.active = true
        this.avatar.spriteFrame = this._data.getSpriteFrame(`head${customerId}`)
        AudioManager.playSound(Constants.AudioSource.NEW_ORDER)

        this.scheduleOnce(() => {
            this.talkNode.active = false
        }, 2)

    }

    private _showGuide(isShow: boolean) {
        this.guideNode.active = isShow
        if (isShow) {
            const anim = this.guideNode.getComponent(AnimationComponent)
            anim.play('guide')
        }
    }

    private _refreshUI() {
        for (let i = 0; i < this.progress.length; i++) {
            const progress = this.progress[i]
            if (i >= this._data.maxProgress) {
                progress.node.active = false
            } else {
                progress.node.active = true
                progress.spriteFrame = this.progress3
            }
        }

        const level = this._data.currLevel
        this.srcLevel.string = `${level}`
        this.targetLevel.string = `${level + 1}`
        this.srcSp.spriteFrame = this.levelFinished
        this.targetSp.spriteFrame = this.levelUnfinished
    }
}

