import { _decorator, Component, Node, Enum, Vec3, macro } from 'cc';
const { ccclass, property } = _decorator;

enum ROAD_POINT_TYPE {
    NORMAL = 1,
    START,
    GREETING,
    GOODBYTE,
    END,
    AI_START,
}

enum ROAD_MOVE_TYPE {
    LINE = 1,
    CURVE,
}

Enum(ROAD_POINT_TYPE)
Enum(ROAD_MOVE_TYPE)

@ccclass('RoadPoint')
export class RoadPoint extends Component {
    public static RoadPointType = ROAD_POINT_TYPE
    public static RoadMoveType = ROAD_MOVE_TYPE

    @property({
        type: ROAD_POINT_TYPE
    })
    type = ROAD_POINT_TYPE.NORMAL

    @property({
        type: Node,
        visible(this: RoadPoint) {
            return this.type !== ROAD_POINT_TYPE.END
        },
    })
    nextStation: Node = null

    @property({
        type: ROAD_MOVE_TYPE,
        visible(this: RoadPoint) {
            return this.type !== ROAD_POINT_TYPE.END
        },
    })
    moveType = ROAD_MOVE_TYPE.LINE

    @property({
        visible(this: RoadPoint) {
            return this.type !== ROAD_POINT_TYPE.END && this.moveType === ROAD_MOVE_TYPE.CURVE
        },
    })
    clockwise = true

    @property({
        type: Vec3,
        visible(this: RoadPoint) {
            return this.type === ROAD_POINT_TYPE.GREETING || this.type === ROAD_POINT_TYPE.GOODBYTE
        },
    })
    direction = new Vec3(1, 0, 0)

    @property({
        visible(this: RoadPoint) {
            return this.type === ROAD_POINT_TYPE.AI_START
        },
    })
    interval = 3

    @property({
        visible(this: RoadPoint) {
            return this.type === ROAD_POINT_TYPE.AI_START
        },
    })
    delayTime = 0

    @property({
        visible(this: RoadPoint) {
            return this.type === ROAD_POINT_TYPE.AI_START
        },
    })
    speed = 0.05

    @property({
        visible(this: RoadPoint) {
            return this.type === ROAD_POINT_TYPE.AI_START
        },
    })
    cars = '201,202'

    private _arrCars: string[] = []
    private _cd: Function = null
    
    start() {
        this._arrCars = this.cars.split(',')
    }

    startScheduel(cd: Function) {
        if (this.type !== RoadPoint.RoadPointType.AI_START) return

        this.stopSchedule()
        this._cd = cd
        this.scheduleOnce(this._startDelay, this.delayTime)
    }

    stopSchedule() {
        this.unschedule(this._startDelay)
        this.unschedule(this._scheduleCD)
    }

    private _startDelay() {
        this._scheduleCD()
        this.schedule(this._scheduleCD, this.interval, macro.REPEAT_FOREVER)
    }

    private _scheduleCD() {
        const index = Math.floor(Math.random() * this._arrCars.length)
        if (this._cd) {
            this._cd(this, this._arrCars[index])
        }
    }
}

