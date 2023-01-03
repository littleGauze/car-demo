import { _decorator, Component, Node, resources, AudioClip, AudioSource } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AudioManager')
export class AudioManager {
    private static _instance: AudioManager = null
    private static _audioSource: AudioSource = null

    static get instance() {
        if (this._instance) return this._instance
        this._instance = new AudioManager()
        return this._instance
    }

    init(audioSource: AudioSource) {
        AudioManager._audioSource = audioSource
    }

    public static playMusic(name: string) {
        const path = `audio/music/${name}`
        resources.load(path, AudioClip, (err: any, clip: AudioClip) => {
            if (err) {
                console.warn(err)
                return
            }

            this._audioSource.clip = clip
            this._audioSource.loop = true
            this._audioSource.volume = .5
            if (!this._audioSource.playing) {
                this._audioSource.play()
            }
        })
    }

    public static playSound(name: string) {
        const path = `audio/sound/${name}`
        resources.load(path, AudioClip, (err: any, clip: AudioClip) => {
            if (err) {
                console.warn(err)
                return
            }

            this._audioSource.playOneShot(clip, 1)
        })
    }
}

