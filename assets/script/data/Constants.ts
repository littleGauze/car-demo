import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

enum EventName {
    GREETING = 'greeting',
    GOODBYTE = 'goodbye',
    FINISH_WALK = 'finish_walk',
    START_BRAKING = 'start_braking',
    END_BRAKING = 'end_breaking',
    SHOW_COIN = 'show_coin',
    GAME_START = 'game_start',
    GAME_OVER = 'game_over',
    NEW_LEVEL = 'new_level',
    SHOW_TALK = 'show_talk',
    SHOW_GUIDE = 'show_guide',
    CLICK = 'click',
    UPDATE_PROGRESS = 'update_progress',
}

enum CustomerState {
    NONE,
    GREETING,
    GOODBYTE
}

enum AudioSource {
    BACKGROUND = 'background',
    CLICK = 'click',
    CRASH = 'crash',
    GET_MONEY = 'getMoney',
    IN_CAR = 'inCar',
    NEW_ORDER = 'newOrder',
    START = 'start',
    STOP = 'stop',
    TOOTING1 = 'tooting1',
    TOOTING2 = 'tooting2',
    WIN = 'win'
}

enum PrefabMaps {
}

enum SpriteMaps {
    head1 = 'ui/head/head1/spriteFrame',
    head2 = 'ui/head/head2/spriteFrame', 
}

@ccclass('Constants')
export class Constants {
    public static EventName = EventName
    public static CustomerState = CustomerState
    public static AudioSource = AudioSource
    public static PrefabMaps = PrefabMaps
    public static SpriteMaps = SpriteMaps

    public static UIPage = {
        mainUI: 'mainUI',
        gameUI: 'gameUI',
        resultUI: 'resultUI',
    }

    public static Talks = [
        '老司机带带我',
        '哎~~ 出租车',
        '师傅等等我'
    ]

    public static GameConfigID = 'TAXI_GAME_CACHE'
    public static PlayInfoID = 'PLAYER_INFO'
    public static MaxLevel = 3
}

