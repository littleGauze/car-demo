import { _decorator, Component, Node, LabelComponent, Label } from 'cc';
import { Constants } from '../data/Constants';
import { CustomEventListener } from '../data/CustomEventListener';
import { UpdateLabelValue } from '../data/UpdateLabelValue';
const { ccclass, property } = _decorator;

@ccclass('LoadingUI')
export class LoadingUI extends Component {
    @property(UpdateLabelValue)
    progressLabel: UpdateLabelValue = null

    private _progress = 0

    onEnable() {
        CustomEventListener.on(Constants.EventName.UPDATE_PROGRESS, this.updateProgress, this)
    }

    onDisable() {
        CustomEventListener.off(Constants.EventName.UPDATE_PROGRESS, this.updateProgress, this)
    }

    show() {
        this.node.active = true
        this._progress = 50
        this.progressLabel.playUpdateValue(this._progress, this._progress, 0)
    }

    updateProgress(value: number) {
        this.progressLabel.playUpdateValue(this._progress, this._progress + value, 0.2)
        this._progress += value
    }

    finishLoading() {
        this.progressLabel.playUpdateValue(this._progress, 100, 0.2)
        this._progress = 100
        this.scheduleOnce(this._hide, .5)
    }

    private _hide() {
        this.node.active = false
    }
}

