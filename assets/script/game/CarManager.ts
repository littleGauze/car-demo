import { _decorator, Component, Node, resources, Prefab, Vec3, misc, macro } from 'cc';
import { Constants } from '../data/Constants';
import { CustomEventListener } from '../data/CustomEventListener';
import { PoolManager } from '../data/PoolManager';
import { AudioManager } from './AudioManager';
import { Car } from './Car';
import { RoadPoint } from './RoadPoint';
const { ccclass, property } = _decorator;

@ccclass('CarManager')
export class CarManager extends Component {
    @property(Car)
    mainCar: Car = null

    @property(Node)
    camera: Node = null

    @property
    cameraPos = new Vec3(0, 8, 8)

    @property
    cameraRotation = -45

    private _currPath: Node[] = []
    private _aiCars: Car[] = []

    start() {
        CustomEventListener.on(Constants.EventName.GAME_START, this._gameStart, this)
        CustomEventListener.on(Constants.EventName.GAME_OVER, this._gameOver, this)
    }

    reset(points: Node[]) {
        if (!points.length) {
            console.warn('There is no points in this map')
            return
        }

        this._recycleAllAICar()
        this._currPath = points
        this._createMainCar(points[0])
        this._startSchedule()
    }

    private _createMainCar(point: Node) {
        this.mainCar.setEntry(point, true)
        this.mainCar.setCamera(this.camera, this.cameraPos, this.cameraRotation)
    }

    private _gameStart() {
        this.schedule(this._checkIsCloseToAiCar, .2, macro.REPEAT_FOREVER)
    }

    private _gameOver() {
        this._stopSchedule()
        this.mainCar.stopImmediately()
        this.camera.setParent(this.node.parent, true)
        for (let i = 0; i < this._aiCars.length; i++) {
            const car = this._aiCars[i]
            car.stopImmediately()
        }
        this.unschedule(this._checkIsCloseToAiCar)
    }

    controlMoving(isRunning = true) {
        if (isRunning) {
            CustomEventListener.dispatch(Constants.EventName.SHOW_GUIDE, false)
            this.mainCar.startRunning()
        } else {
            this.mainCar.stopRunning()
        }
    }

    private _startSchedule() {
        for (let i = 1; i < this._currPath.length; i++) {
            const roadPoint = this._currPath[i].getComponent(RoadPoint)
            roadPoint.startScheduel(this._createEnemy.bind(this))
        }
    }

    private _stopSchedule() {
        for (let i = 1; i < this._currPath.length; i++) {
            const roadPoint = this._currPath[i].getComponent(RoadPoint)
            roadPoint.stopSchedule()
        }
    }

    private _createEnemy(road: RoadPoint, carId: string) {
        resources.load(`car/car${carId}`, Prefab, (err, prefab: Prefab) => {
            if (err) {
                console.warn(err)
                return
            }

            const car = PoolManager.getNode(prefab, this.node)
            const carComp = car.getComponent(Car)
            this._aiCars.push(carComp)
            carComp.setEntry(road.node)
            carComp.maxSpeed = road.speed
            carComp.startRunning()
            carComp.moveAfterFinished(this._recycleAiCar.bind(this))
        })
    }

    private _recycleAiCar(car: Car) {
        const index = this._aiCars.indexOf(car)
        if (index >= 0) {
            PoolManager.setNode(car.node)
            this._aiCars.splice(index, 1)
            car.node.parent = null
        }
    }

    private _recycleAllAICar() {
        for (let i = 0; i < this._aiCars.length; i++) {
            const car = this._aiCars[i]
            PoolManager.setNode(car.node)
        }
        this._aiCars.length = 0
    }

    private _checkIsCloseToAiCar() {
        const mainPos = this.mainCar.node.worldPosition
        for (let i = 0; i < this._aiCars.length; i++) {
            const aiCar = this._aiCars[i]
            const pos = aiCar.node.worldPosition
            if (Math.abs(pos.x - mainPos.x) <= 2 && Math.abs(pos.z - mainPos.z) <= 2) {
                return this.mainCar.tooting()
            }
        }
    }
}

