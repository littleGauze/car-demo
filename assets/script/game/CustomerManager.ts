import { _decorator, Component, Node, Vec3, AnimationClip, AnimationComponent } from 'cc';
import { CustomEventListener } from '../data/CustomEventListener';
import { Constants } from '../data/Constants';
import { GameData } from '../data/GameData';
const { ccclass, property } = _decorator;

const EventName = Constants.EventName
const _tempVec = new Vec3

@ccclass('CustomerManager')
export class CustomerManager extends Component {
    @property(Node)
    customers: Node[] = []

    @property
    walkTime = 2

    private _currCustomer: Node = null
    private _startPos = new Vec3
    private _endPos = new Vec3
    private _inTheOrder = false
    private _deltaTime = 0
    private _state = Constants.CustomerState.NONE

    start() {
        CustomEventListener.on(EventName.GREETING, this._greetingCustomer, this)
        CustomEventListener.on(EventName.GOODBYTE, this._takingCustomer, this)
    }

    update(dt: number) {
        if (this._inTheOrder) {
            this._deltaTime += dt
            if (this._deltaTime > this.walkTime) {
                this._deltaTime = 0
                this._inTheOrder = false
                this._currCustomer.active = false
                if (this._state === Constants.CustomerState.GOODBYTE) {
                    this._currCustomer = null
                }

                CustomEventListener.dispatch(EventName.FINISH_WALK, this._state)
                CustomEventListener.dispatch(Constants.EventName.SHOW_GUIDE, true)
            } else {
                Vec3.lerp(_tempVec, this._startPos, this._endPos, this._deltaTime / this.walkTime)
                this._currCustomer.setWorldPosition(_tempVec)
            }
        }
    }

    private _greetingCustomer(...args: any[]) {
        const idx = Math.floor(Math.random() * this.customers.length)
        this._currCustomer = this.customers[idx]
        this._state = Constants.CustomerState.GREETING
        this._inTheOrder = true
        if (!this._currCustomer) return
        const carPos = args[0]
        const direction = args[1]

        Vec3.multiplyScalar(this._startPos, direction, 1.4)
        Vec3.multiplyScalar(this._endPos, direction, .5)
        this._startPos.add(carPos)
        this._endPos.add(carPos)

        this._currCustomer.setWorldPosition(this._startPos)
        this._currCustomer.active = true

        if (direction.x !== 0) {
            if (direction.x > 0) {
                this._currCustomer.eulerAngles = new Vec3(0, -90, 0)
            } else {
                this._currCustomer.eulerAngles = new Vec3(0, 90, 0)
            }
        } else {
            if (direction.z > 0) {
                this._currCustomer.eulerAngles = new Vec3(0, 180, 0)
            } else {
                this._currCustomer.eulerAngles = new Vec3()
            }
        }

        const animComp = this._currCustomer.getComponent(AnimationComponent)
        animComp.play('walk')

        CustomEventListener.dispatch(EventName.SHOW_TALK, idx + 1)
    }

    private _takingCustomer(...args: any[]) {
        this._state = Constants.CustomerState.GOODBYTE
        this._inTheOrder = true

        const carPos = args[0]
        const direction = args[1]

        Vec3.multiplyScalar(this._startPos, direction, .5)
        Vec3.multiplyScalar(this._endPos, direction, 1.4)
        this._startPos.add(carPos)
        this._endPos.add(carPos)

        this._currCustomer.setWorldPosition(this._startPos)
        this._currCustomer.active = true

        const data = GameData.instance
        data.money = data.money + Math.floor(30 + (data.currLevel / 2) * Math.random() * 10)

        if (direction.x !== 0) {
            if (direction.x > 0) {
                this._currCustomer.eulerAngles = new Vec3(0, 90, 0)
            } else {
                this._currCustomer.eulerAngles = new Vec3(0, -90, 0)
            }
        } else {
            if (direction.z > 0) {
                this._currCustomer.eulerAngles = new Vec3()
            } else {
                this._currCustomer.eulerAngles = new Vec3(0, 180, 0)
            }
        }

        const animComp = this._currCustomer.getComponent(AnimationComponent)
        animComp.play('walk')
    }
}

