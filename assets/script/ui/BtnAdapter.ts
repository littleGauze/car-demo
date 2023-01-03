import { _decorator, Component, Node } from 'cc';
import { Constants } from '../data/Constants';
import { CustomEventListener } from '../data/CustomEventListener';
import { AudioManager } from '../game/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('BtnAdapter')
export class BtnAdapter extends Component {
    @property
    soundName: string = ''

    @property
    delayTime: number = 0

    start() {
        CustomEventListener.on(Constants.EventName.CLICK, this._click, this)
    }

    private _click() {
        this.scheduleOnce(this.playSound, this.delayTime)
    }

    playSound() {
        if (!this.soundName) return
        AudioManager.playSound(this.soundName)
    }
}

