import { _decorator, Component, Node, sys } from 'cc';
import { Constants } from './Constants';
const { ccclass, property } = _decorator;

@ccclass('Configuration')
export class Configuration {
  private _jsonData = {}
  private _markSave = false
  private static _instance: Configuration = null

  public static get instance() {
    if (!this._instance) {
      this._instance = new Configuration()
    }
    return this._instance
  }

  init() {
    const localStorage = sys.localStorage.getItem(Constants.GameConfigID)
    if (localStorage) {
      this._jsonData = JSON.parse(localStorage)
    }

    setInterval(this._scheduleSave.bind(this), 500)
  }

  getConfigData(key: string) {
    const data = this._jsonData[key]
    return data || ''
  }

  setConfigData(key: string, value: string) {
    this._jsonData[key] = value
    this._markSave = true
  }

  private _scheduleSave() {
     if (!this._markSave) return

     const data = JSON.stringify(this._jsonData)
     sys.localStorage.setItem(Constants.GameConfigID, data)
     this._markSave = false
  }
}

