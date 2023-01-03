import { _decorator, Component, Node, LabelComponent, sys } from 'cc';
import { Constants } from '../data/Constants';
import { CustomEventListener } from '../data/CustomEventListener';
import { GameData } from '../data/GameData';
const { ccclass, property } = _decorator;

@ccclass('MainUI')
export class MainUI extends Component {
    @property(LabelComponent)
    moneyLabel: LabelComponent = null

    private _clickTime = 0
    private _time = 0

    onEnable() {
        this.moneyLabel.string = `${GameData.instance.totalMoney}`
    }

    clickStart() {
        CustomEventListener.dispatch(Constants.EventName.GAME_START)
    }

    clickDebug() {
        const time = Date.now()
        if (time - this._time <= 200) {
            this._clickTime++
        } else {
            this._clickTime = 0
        }
        this._time = time

        if (this._clickTime >= 3) {
            sys.localStorage.removeItem(Constants.GameConfigID)
            this._clickTime = 0
            console.log('clear cache...')
        }
    }
}

