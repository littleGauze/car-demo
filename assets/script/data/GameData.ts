import { _decorator, Component, Node, Game, Prefab, resources, SpriteFrame } from 'cc';
import { Configuration } from './Configuration';
import { Constants } from './Constants';
const { ccclass, property } = _decorator;

@ccclass('GameData')
export class GameData {
    private static _instance: GameData = null
    private _prefabMap = new Map<string, Prefab>()
    private _spriteMap = new Map<string, SpriteFrame>()

    playerData: PlayerData = null

    constructor() {
        this._loadRes()
        this.playerData = PlayerData.instance
    }

    public static get instance() {
        if (!this._instance) {
            this._instance = new GameData()
        }
        return this._instance
    }

    currProgress = 0
    maxProgress = 0
    isTakeOver = true
    money = 0

    get currLevel() {
        return this.playerData.playInfo.level
    }

    get totalMoney() {
        return this.playerData.playInfo.gold
    }

    private _loadRes() {
        const maps = Constants.PrefabMaps
        for (const name in maps) {
            resources.load(maps[name], Prefab, (err, prefab) => {
                if (err) return console.warn(err)
                this._prefabMap.set(name, prefab)
            })
        }

        const sps = Constants.SpriteMaps
        for (const name in sps) {
            resources.load(sps[name], SpriteFrame, (err, sp) => {
                if (err) return console.warn(err)
                this._spriteMap.set(name, sp)
            })
        }
    }

    getPrefab(name: string) {
        if (!this._prefabMap.has(name)) return null
        return this._prefabMap.get(name)
    }

    getSpriteFrame(name: string) {
        if (!this._spriteMap.has(name)) return null
        return this._spriteMap.get(name)
    }

    reset() {
        this.currProgress = 0
    }
}

interface IPlayerInfo {
    level: number
    gold: number
}

@ccclass('PlayerData')
export class PlayerData {
    playInfo: IPlayerInfo = { level: 1, gold: 0 }

    private static _instance: PlayerData = null
    constructor() {
    }

    public static get instance() {
        if (!this._instance) {
            this._instance = new PlayerData()
        }
        return this._instance
    }

    loadFromCache() {
        const info = Configuration.instance.getConfigData(Constants.PlayInfoID)
        if (info) {
            this.playInfo = JSON.parse(info)
        }
    }

    passLevel(rewardMoney: number) {
        this.playInfo.level++
        if (this.playInfo.level > Constants.MaxLevel) {
            this.playInfo.level = 1
        }
        this.playInfo.gold += rewardMoney
        this.savePlayerInfoToCache()
    }

    savePlayerInfoToCache() {
        const data = JSON.stringify(this.playInfo)
        Configuration.instance.setConfigData(Constants.PlayInfoID, data)
    }
}
