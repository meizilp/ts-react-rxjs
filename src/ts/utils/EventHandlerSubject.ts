import * as Rx from 'rxjs'

//可以用作EventHandler的Subject
class EventHandlerSubject<T extends Event> extends Rx.Subject<T> {
    constructor(destination?: Rx.Observer<T>, source?: Rx.Observable<T>) {
        super(destination, source)
    }
    //提供给外部使用的事件函数句柄，当被调用时触发subject调用next
    public handler(e: T) {
        this.next(e)
    }
}
export {EventHandlerSubject}
