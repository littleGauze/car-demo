import { _decorator, Component, Node, Vec3, ParticleSystemComponent, RigidBody, BoxColliderComponent, ICollisionEvent, BoxCollider, RigidBodyComponent } from 'cc';
import { CustomEventListener } from '../data/CustomEventListener';
import { Constants } from '../data/Constants';
import { RoadPoint } from './RoadPoint';
import { AudioManager } from './AudioManager';
import { GameData } from '../data/GameData';
const { ccclass, property } = _decorator;

const _tempVec = new Vec3()
const EventName = Constants.EventName
const TOOTING_CD = 5

@ccclass('Car')
export class Car extends Component {
    private _currRoadPoint: RoadPoint = null
    private _pointA = new Vec3()
    private _pointB = new Vec3()

    private _currSpeed = 0
    private _maxSpeed = 0.2
    private _acceleration = 0.2
    private _isMoving = false
    private _offset = new Vec3()

    private _originRotation = 0
    private _targetRotation = 0
    private _centerPoint = new Vec3()
    private _rotMeature = 0

    private _isMain = false
    private _isInOrder = false
    private _isBraking = false
    private _gas: ParticleSystemComponent = null
    private _overCD: Function = null
    private _camera: Node = null

    private _tootingCd: number = 0
    private _minSpeed = 0.02
    private _isEngineStart = false

    set maxSpeed(speed: number) {
        this._maxSpeed = speed
    }

    start() {
        CustomEventListener.on(EventName.FINISH_WALK, this._finishWalk, this)
    }

    update(dt: number) {
        this._tootingCd = this._tootingCd > dt ? this._tootingCd - dt : 0
        if (!this._isMoving || this._isInOrder) return

        this._currSpeed += this._acceleration * dt
        if (this._currSpeed > this._maxSpeed) {
            this._currSpeed = this._maxSpeed
        }
        if (this._currSpeed < 0.001 && this._isMoving) {
            if (this._isEngineStart) {
                this._currSpeed = this._minSpeed
            } else {
                this._isMoving = false
                if (this._isBraking) {
                    this._isBraking = false
                    CustomEventListener.dispatch(EventName.END_BRAKING)
                }
            }
        }
        this._offset.set(this.node.worldPosition)
        switch (this._currRoadPoint.moveType) {
            case RoadPoint.RoadMoveType.CURVE:
                // 计算角度
                const offsetRotation = this._targetRotation - this._originRotation
                const currRotation = this._coverion(this.node.eulerAngles.y)
                const dir = this._targetRotation > this._originRotation ? 1 : -1
                let nextRotation = (currRotation - this._originRotation) + (this._currSpeed * this._rotMeature * dir)
                if (Math.abs(nextRotation) > Math.abs(offsetRotation)) {
                    nextRotation = offsetRotation
                }
                const target = this._originRotation + nextRotation
                _tempVec.set(0, target, 0)
                this.node.eulerAngles = _tempVec

                // 计算位移
                const sin = Math.sin(nextRotation * Math.PI / 180)
                const cos = Math.cos(nextRotation * Math.PI / 180)
                const xLength = this._pointA.x - this._centerPoint.x
                const zLength = this._pointA.z - this._centerPoint.z
                const xPos = cos * xLength + sin * zLength + this._centerPoint.x
                const zPos = -sin * xLength + cos * zLength + this._centerPoint.z
                this._offset.set(xPos, 0, zPos)
                break
            default:
                const z = this._pointB.z - this._pointA.z
                if (z !== 0) {
                    if (z > 0) {
                        this._offset.z += this._currSpeed
                        if (this._offset.z > this._pointB.z) {
                            this._offset.z = this._pointB.z
                        }
                    } else {
                        this._offset.z -= this._currSpeed
                        if (this._offset.z < this._pointB.z) {
                            this._offset.z = this._pointB.z
                        }
                    }
                } else {
                    const x = this._pointB.x - this._pointA.x
                    if (x > 0) {
                        this._offset.x += this._currSpeed
                        if (this._offset.x > this._pointB.x) {
                            this._offset.x = this._pointB.x
                        }
                    } else {
                        this._offset.x -= this._currSpeed
                        if (this._offset.x < this._pointB.x) {
                            this._offset.x = this._pointB.x
                        }
                    }
                }
                break
        }
        this.node.setWorldPosition(new Vec3(this._offset.x, 0, this._offset.z))
        Vec3.subtract(_tempVec, this._pointB, this._offset)
        if (_tempVec.length() <= 0.06) {
            this._arrivalStation()
        }
    }

    setEntry(entry: Node, isMain = false) {
        this.node.setWorldPosition(entry.worldPosition)
        this._isMain = isMain
        this._currRoadPoint = entry.getComponent(RoadPoint)
        if (!this._currRoadPoint) {
            console.warn('There is no RoadPoint in ', entry.name)
            return
        }

        this._pointA.set(entry.worldPosition)
        this._pointB.set(this._currRoadPoint.nextStation.worldPosition)

        const z = this._pointB.z - this._pointA.z
        if (z !== 0) {
            if (z < 0) {
                this.node.eulerAngles = new Vec3()
            } else {
                this.node.eulerAngles = new Vec3(0, 180, 0)
            }
        } else {
            const x = this._pointB.x - this._pointA.x
            if (x > 0) {
                this.node.eulerAngles = new Vec3(0, 270, 0)
            } else {
                this.node.eulerAngles = new Vec3(0, 90, 0)
            }
        }

        const collider = this.node.getComponent(BoxColliderComponent)
        collider.on('onCollisionEnter', this._onCollistionEnter, this)
        if (this._isMain) {
            const gasNode = this.node.getChildByName('gas')
            this._gas = gasNode.getComponent(ParticleSystemComponent)
            this._gas.play()
        }

        this._resetPhysical()
    }

    setCamera(camera: Node, pos: Vec3, rotation: number) {
        if (this._isMain) {
            this._camera = camera
            this._camera.parent = this.node
            this._camera.setPosition(pos)
            this._camera.eulerAngles = new Vec3(rotation, 0, 0)
        }
    }

    startRunning() {
        if (this._currRoadPoint) {
            this._isMoving = true
            this._acceleration = 0.2
            this._isEngineStart = true
        }
    }

    stopRunning() {
        this._acceleration = -0.3
        CustomEventListener.dispatch(EventName.START_BRAKING, this.node)
        // this._isBraking = true
        if (this._isMoving) {
            AudioManager.playSound(Constants.AudioSource.STOP)
        }
    }

    moveAfterFinished(cd: Function) {
        this._overCD = cd
    }

    stopImmediately() {
        this._currSpeed = 0
        this._isMoving = false
        this._isEngineStart = false
    }

    private _arrivalStation() {
        this._pointA.set(this._pointB)
        this._currRoadPoint = this._currRoadPoint.nextStation.getComponent(RoadPoint)
        if (this._currRoadPoint.nextStation) {
            this._pointB.set(this._currRoadPoint.nextStation.worldPosition)

            if (this._isMain) {
                if (this._isBraking) {
                    this._isBraking = false
                    CustomEventListener.dispatch(EventName.END_BRAKING)
                }
                if (this._currRoadPoint.type === RoadPoint.RoadPointType.GREETING) {
                    this._greetingCustomer()
                } else if (this._currRoadPoint.type === RoadPoint.RoadPointType.GOODBYTE) {
                    this._takingCustomer()
                }
            }

            if (this._currRoadPoint.moveType === RoadPoint.RoadMoveType.CURVE) {
                this._originRotation = this._coverion(this.node.eulerAngles.y)
                if (this._currRoadPoint.clockwise) {
                    this._targetRotation = this._originRotation - 90

                    if ((this._pointA.z > this._pointB.z && this._pointA.x < this._pointB.x) || (this._pointA.z < this._pointB.z && this._pointA.x > this._pointB.x)) {
                        this._centerPoint.set(this._pointB.x, 0, this._pointA.z)
                    } else {
                        this._centerPoint.set(this._pointA.x, 0, this._pointB.z)
                    }
                } else {
                    this._targetRotation = this._originRotation + 90

                    if ((this._pointB.z > this._pointA.z && this._pointA.x < this._pointB.x) || (this._pointA.z < this._pointB.z && this._pointA.x > this._pointB.x)) {
                        this._centerPoint.set(this._pointB.x, 0, this._pointA.z)
                    } else {
                        this._centerPoint.set(this._pointA.x, 0, this._pointB.z)
                    }
                }
                Vec3.subtract(_tempVec, this._pointA, this._centerPoint)
                const r = _tempVec.length()
                this._rotMeature = 90 / (Math.PI * r / 2)
            }
        } else {
            if (this._isMain) {
                AudioManager.playSound(Constants.AudioSource.WIN)
                this._gameOver()
            }
            this._isMoving = false
            this._currRoadPoint = null
            if (this._overCD) {
                this._overCD(this)
                this._overCD = null
            }
        }
    }

    private _onCollistionEnter(event: ICollisionEvent) {
        if (event.selfCollider.node.name !== 'car101' || event.otherCollider.node.name === 'Ground') return
        const otherCollider = event.otherCollider
        const otherRigidBody = otherCollider.getComponent(RigidBodyComponent)
        otherRigidBody.useGravity = true
        otherRigidBody.applyForce(new Vec3(0, 2000, 500), new Vec3(0, .5, 0))

        const rigidBody = this.node.getComponent(RigidBodyComponent)
        rigidBody.useGravity = true
        this._gameOver()
        AudioManager.playSound(Constants.AudioSource.CRASH)
    }

    private _greetingCustomer() {
        GameData.instance.isTakeOver = false
        this._isInOrder = true
        this._isMoving = false
        this._isEngineStart = false
        this._currSpeed = 0
        CustomEventListener.dispatch(EventName.GREETING, this.node.worldPosition, this._currRoadPoint.direction)
        this._gas.stop()
        AudioManager.playSound(Constants.AudioSource.STOP)
    }

    private _takingCustomer() {
        GameData.instance.isTakeOver = true
        GameData.instance.currProgress++
        this._isInOrder = true
        this._isMoving = false
        this._isEngineStart = false
        this._currSpeed = 0
        CustomEventListener.dispatch(EventName.GOODBYTE, this.node.worldPosition, this._currRoadPoint.direction)
        CustomEventListener.dispatch(EventName.SHOW_COIN, this.node.worldPosition)
        this._gas.stop()
        AudioManager.playSound(Constants.AudioSource.STOP)
        AudioManager.playSound(Constants.AudioSource.IN_CAR)
        this.scheduleOnce(() => {
            AudioManager.playSound(Constants.AudioSource.START)
        }, .5)
    }

    private _finishWalk(...args: any[]) {
        if (!this._isMain) return
        const state = args[0]
        this._isInOrder = false
        this._gas.play()
        if (state === Constants.CustomerState.GREETING) {
            AudioManager.playSound(Constants.AudioSource.IN_CAR)
            this.scheduleOnce(() => {
                AudioManager.playSound(Constants.AudioSource.START)
            }, .5)
        }
    }

    private _gameOver() {
        this._isMoving = false
        this._currSpeed = 0
        CustomEventListener.dispatch(EventName.GAME_OVER)
    }

    private _resetPhysical() {
        const rigidBody = this.node.getComponent(RigidBodyComponent)
        rigidBody.useGravity = false
        rigidBody.sleep()
        rigidBody.wakeUp()
    }

    private _coverion(value: number) {
        let a = value
        if (a <= 0) {
            a += 360
        }
        return a
    }

    tooting() {
        if (this._tootingCd > 0) return
        this._tootingCd = TOOTING_CD
        const tooting = Math.floor(Math.random() * 2) ? Constants.AudioSource.TOOTING1 : Constants.AudioSource.TOOTING2
        AudioManager.playSound(tooting)
    }

}

