import { _decorator, Component, Node, LabelComponent, SpriteComponent, SpriteFrame } from 'cc';
import { Constants } from '../data/Constants';
import { CustomEventListener } from '../data/CustomEventListener';
import { GameData, PlayerData } from '../data/GameData';
const { ccclass, property } = _decorator;

@ccclass('ResultUI')
export class ResultUI extends Component {
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

    @property(LabelComponent)
    progressLabel: LabelComponent = null

    @property(LabelComponent)
    moneyLabel: LabelComponent = null

    show() {
        const data = GameData.instance
        const maxProgress = data.maxProgress
        const currProgress = data.currProgress
        let idx = 0
        for (let i = 0; i < this.progress.length; i++) {
            const progress = this.progress[i]
            if (i >= maxProgress) {
                progress.node.active = false
            } else {
                progress.node.active = true
                idx = maxProgress - 1 - i
                if (idx >= currProgress) {
                    progress.spriteFrame = idx === currProgress && !data.isTakeOver ? this.progress2 : this.progress3
                } else {
                    progress.spriteFrame = this.progress1
                }
            }
        }

        this.srcSp.spriteFrame = this.levelFinished
        this.targetSp.spriteFrame = currProgress === maxProgress ? this.levelFinished : this.levelUnfinished
        this.progressLabel.string = `你完成了${currProgress}个订单`
        const level = GameData.instance.currLevel
        this.srcLevel.string = `${level}`
        this.targetLevel.string = `${level + 1}`
        this.moneyLabel.string = `${GameData.instance.money}`
    }

    btnClicked() {
        if (GameData.instance.currProgress === GameData.instance.maxProgress) {
            PlayerData.instance.passLevel(GameData.instance.money)
        }
        CustomEventListener.dispatch(Constants.EventName.NEW_LEVEL)
        CustomEventListener.dispatch(Constants.EventName.CLICK)
    }
}

