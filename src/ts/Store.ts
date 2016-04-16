import * as Rx from 'rxjs'

interface Action<T> {
    reduce(oriState: T): T
}

class Store<T> {
    //用来接收更新通知的subject
    public $dispatch: Rx.BehaviorSubject<Action<T>>
    //用来通知state发生变化的subject
    public state$: Rx.BehaviorSubject<T>

    constructor(initState: T) {
        //当前状态是个behaviorSubject，这样才能保持住上一个状态一直存在
        this.state$ = new Rx.BehaviorSubject<T>(null)
        this.$dispatch = new Rx.BehaviorSubject<Action<T>>(null)

        //通知subject接收到通知后，通过scan进行计算后通知状态对象。scan必须要有初始值，以避免把action作为了第一个state。        
        this.$dispatch
            .scan<T>((s: T, a: Action<T>) => {
                if (a) return a.reduce(s)
                else return s
            }, initState)
            .subscribe(this.state$)     
    }    
}

export {Store, Action}
