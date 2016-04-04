import * as Rx from 'rxjs'

//可以用作EventHandler的Subject
class EventHandlerSubject<T extends Event> extends Rx.Subject<T> {
    constructor(destination?: Rx.Observer<T>, source?: Rx.Observable<T>) {
        super(destination, source)
    }
    public handler(e: T) {
        this.next(e)
    }
}
export {EventHandlerSubject}
