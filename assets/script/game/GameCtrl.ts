import { _decorator, Component, Node, AudioSource, PhysicsSystem } from 'cc';
import { Configuration } from '../data/Configuration';
import { Constants } from '../data/Constants';
import { CustomEventListener } from '../data/CustomEventListener';
import { GameData, PlayerData } from '../data/GameData';
import { LoadingUI } from '../ui/LoadingUI';
import { UIManager } from '../ui/UIManager';
import { AudioManager } from './AudioManager';
import { CarManager } from './CarManager';
import { MapManager } from './MapManager';
const { ccclass, property } = _decorator;

@ccclass('GameCtrl')
export class GameCtrl extends Component {
    @property(MapManager)
    mapManager: MapManager = null

    @property(CarManager)
    carManager: CarManager = null

    @property(LoadingUI)
    loadingUI: LoadingUI = null

    private _audioSource: AudioSource = null

    private _isOver = false
    private _lastMapID = null

    onLoad() {
        Configuration.instance.init()
        PlayerData.instance.loadFromCache()
        this.loadingUI.show()
        this._lastMapID = GameData.instance.currLevel
        this.mapManager.loadMap(this._lastMapID, this._finishLoading.bind(this))
        this._audioSource = this.getComponent(AudioSource)
        AudioManager.instance.init(this._audioSource)
        AudioManager.playMusic(Constants.AudioSource.BACKGROUND)

        PhysicsSystem.instance.enable = true
        PhysicsSystem.instance.allowSleep = false

    }

    start() {
        this.node.on(Node.EventType.TOUCH_START, this._touchStart, this)
        this.node.on(Node.EventType.TOUCH_END, this._touchEnd, this)
        CustomEventListener.on(Constants.EventName.GAME_START, this._gameStart, this)
        CustomEventListener.on(Constants.EventName.GAME_OVER, this._gameOver, this)
        CustomEventListener.on(Constants.EventName.NEW_LEVEL, this._newLevel, this)
    }

    private _touchStart(touch: Touch, event: TouchEvent) {
        !this._isOver && this.carManager.controlMoving(true)
    }

    private _touchEnd(touch: Touch, event: TouchEvent) {
        !this._isOver && this.carManager.controlMoving(false)
    }

    private _gameStart() {
        UIManager.hideDialog(Constants.UIPage.mainUI)
        UIManager.showDialog(Constants.UIPage.gameUI)
    }

    private _gameOver() {
        UIManager.hideDialog(Constants.UIPage.gameUI)
        UIManager.showDialog(Constants.UIPage.resultUI)

        this._isOver = true
    }

    private _newLevel() {
        UIManager.hideDialog(Constants.UIPage.resultUI)
        UIManager.showDialog(Constants.UIPage.mainUI)

        const level = GameData.instance.currLevel
        if (this._lastMapID === level) {
            this._reset()
            return
        }
        this.mapManager.recycle()
        this.loadingUI.show()
        this.mapManager.loadMap(level, this._finishLoading.bind(this))
        this._lastMapID = level
    }

    private _reset() {
        UIManager.showDialog(Constants.UIPage.mainUI)
        this._isOver = false
        this.mapManager.resetMap()
        this.carManager.reset(this.mapManager.currPath)
        GameData.instance.maxProgress = this.mapManager.maxProgress
        GameData.instance.reset()
        GameData.instance.money = 0
    }

    private _finishLoading() {
        this._reset()
        this.loadingUI.finishLoading()
    }
}
