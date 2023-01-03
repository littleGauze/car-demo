import { _decorator, Component, Node, resources, Prefab, instantiate } from 'cc';
import { Constants } from '../data/Constants';
import { CustomEventListener } from '../data/CustomEventListener';
import { GameMap } from './GameMap';
const { ccclass, property } = _decorator;

@ccclass('MapManager')
export class MapManager extends Component {
    currPath: Node[] = []
    maxProgress = 0

    private _progress = 0

    private _currMap: Node = null

    resetMap() {
        this._currMap = this.node.children[0]
        const currMap = this._currMap.getComponent(GameMap)
        this.currPath = currMap.path
        this.maxProgress = currMap.maxProgress
    }

    loadMap(level: number, cb?: Function) {
        let map = 'map/map'
        if (level >= 100) {
            map += `${level}`
        } else if (level >= 10) {
            map += `1${level}`
        } else {
            map += `10${level}`
        }

        this._progress = 5
        this.scheduleOnce(this._loadingShchedule.bind(this), 0.2)
        resources.load(map, Prefab, (err, prefab) => {
            if (err) return console.warn(err)

            const mapNode = instantiate(prefab) as Node
            mapNode.parent = this.node
            this._progress = 0

            if (cb) cb()
        })
    }

    private _loadingShchedule() {
        if (this._progress <= 0) return
        this._progress--
        CustomEventListener.dispatch(Constants.EventName.UPDATE_PROGRESS, 40 / 5)
        this.scheduleOnce(this._loadingShchedule.bind(this), 0.4)
    }

    recycle() {
        if (this._currMap) {
            this._currMap.destroy()
            this._currMap = null
        }
    }
}

