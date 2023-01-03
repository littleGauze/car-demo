import { _decorator, Component, Node, LabelComponent } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UpdateLabelValue')
export class UpdateLabelValue extends LabelComponent {

    private _startVal = 0
    private _endVal = 0
    private _diffVal = 0
    private _currTime = 0
    private _changeTime = 0
    private _isPlaying = false

    start() {

    }

    update(dt: number) {
        if (!this._isPlaying) return

        if (this._currTime < this._changeTime) {
            this._currTime += dt
            const targetValue = Math.floor(this._startVal + (this._currTime / this._changeTime * this._diffVal))
            this.string = `${targetValue}`
            return
        }

        this.string = `${this._endVal}`
    }

    playUpdateValue(start: number, end: number, changeTime: number) {
        this._startVal = start
        this._endVal = end
        this._diffVal = end - start
        this._currTime = 0
        this._changeTime = changeTime

        if (changeTime === 0) {
            this.string = `${this._endVal}`
            return
        }

        this.string = `${this._startVal}`
        this._isPlaying = true
    }
}

