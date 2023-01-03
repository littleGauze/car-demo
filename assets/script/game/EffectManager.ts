import { _decorator, Component, Node, Prefab, ParticleUtils, ParticleSystemComponent, instantiate } from 'cc';
import { Constants } from '../data/Constants';
import { CustomEventListener } from '../data/CustomEventListener';
import { PoolManager } from '../data/PoolManager';
import { AudioManager } from './AudioManager';
const { ccclass, property } = _decorator;

@ccclass('EffectManager')
export class EffectManager extends Component {
    @property(Prefab)
    breakTrail: Prefab = null

    @property(Prefab)
    coin: Prefab = null

    private _fallowTarget: Node = null
    private _currBreaking: Node = null
    private _coin: ParticleSystemComponent = null

    public start() {
        CustomEventListener.on(Constants.EventName.START_BRAKING, this._startBraking, this)
        CustomEventListener.on(Constants.EventName.END_BRAKING, this._endBraking, this)
        CustomEventListener.on(Constants.EventName.SHOW_COIN, this._showCoin, this)
    }

    update() {
        if (this._currBreaking && this._fallowTarget) {
            this._currBreaking.setWorldPosition(this._fallowTarget.worldPosition)
        }
    }

    private _startBraking(...args: any[]) {
        const fallow = this._fallowTarget = args[0]
        this._currBreaking = PoolManager.getNode(this.breakTrail, this.node)
        this._currBreaking.setWorldPosition(fallow.worldPosition)
        ParticleUtils.play(this._currBreaking)
    }

    private _endBraking() {
        const currBreaking = this._currBreaking
        ParticleUtils.stop(currBreaking)
        this.scheduleOnce(() => {
            PoolManager.setNode(currBreaking)
        }, 2)

        this._currBreaking = null
        this._fallowTarget = null
    }

    private _showCoin(...args: any[]) {
        const pos = args[0]
        if (!this._coin) {
            const coin = instantiate(this.coin) as Node
            coin.setParent(this.node)
            this._coin = coin.getComponent(ParticleSystemComponent)
        }
        this._coin.node.setWorldPosition(pos)
        this._coin.play()
        AudioManager.playSound(Constants.AudioSource.GET_MONEY)
    }
}

