import { _decorator, Component, Node, find, resources, Prefab, instantiate } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {
    static _dictPanel = new Map<string, Node>()

    public static showDialog(name: string, cb?: Function, ...args: any[]) {
        const scriptName = name.replace(/^(\w)/, t => t.toUpperCase())
        const show = panel => {
            const parent = find('Canvas')
            panel.parent = parent
            const comp = panel.getComponent(scriptName)
            if (comp && comp['show']) {
                comp['show'].apply(comp, args)
            }

            if (cb) {
                cb()
            }
        }
        if (this._dictPanel.has(name)) {
            const panel = this._dictPanel.get(name)
            return show(panel)
        }

        const path = `ui/${name}`
        resources.load(path, Prefab, (err, ui) => {
            if (err) {
                console.warn(err)
                return
            }

            const panel = instantiate(ui) as Node
            this._dictPanel.set(name, panel)
            show(panel)
        })
    }

    public static hideDialog(name: string, cb?: Function) {
        if (this._dictPanel.has(name)) {
            const panel = this._dictPanel.get(name)
            panel.parent = null
            const scriptName = name.replace(/^(\w)/, t => t.toUpperCase())
            const comp = panel.getComponent(scriptName)
            if (comp && comp['hide']) {
                comp['hide'].apply(comp)
            }
            if (cb) {
                cb()
            }
        }
    }
}

