import * as Rx from 'rxjs'

import {Todo} from './Todo.ts'
import {TodoActions, TodoActionReducer} from './actions/TodoActions.ts'

const LOCAL_STORAGE_KEY = 'myTodo'

//状态对象。
interface TodoAppState {
    todos: Todo[]
}

class TodoStore {
    //用来接收更新通知的subject
    public $update: Rx.BehaviorSubject<TodoActionReducer>
    //用来通知state发生变化的subject
    public state$: Rx.BehaviorSubject<TodoAppState>
    //外界可以向store发送的action通知
    public actions: TodoActions

    constructor() {
        //当前状态是个behaviorSubject，这样才能保持住上一个状态一直存在
        this.state$ = new Rx.BehaviorSubject<TodoAppState>({ todos: [] })
        this.$update = new Rx.BehaviorSubject<TodoActionReducer>(null)

        //通知subject接收到通知后，通过scan进行计算后通知状态对象。        
        this.$update
            .scan<TodoAppState>((x: TodoAppState, y: TodoActionReducer) => {
                if (y) return y(x)
                else return x
            }, { todos: TodoStore.loadDataFromLocalStorage(LOCAL_STORAGE_KEY) })
            .subscribe(this.state$)

        //状态发生改变时保存数据。第一次是加载数据所以跳过。        
        /*
         * 这儿使用this.$update.subscribe()通知而不是使用state$=this.$update.scan()是因为：
         * 如果使用后者，那么每次state$.forEach()时$udpate.scan()都还会执行一遍；并且如果多个地方调用forEach，
         * 比如保存、设置状态，有几次调用，scan就要执行几次。更大的问题是，每次forEach是scan所产生的state对象都是不一样的，
         * 也就是全局有了多个state对象，假设设置状态的forEach产生state1，保存产生state2，当某个操作触发更新时，
         * 此时操作的目标对象实在state1的数组中，而保存时会再次通过scan执行reduce函数，reduce函数中使用的状态对象是state2，
         * 就会造成找不到目标对象，执行逻辑错误。所以这儿使用一个subject作为一个代理，这样保存、设置状态都从这个代理获得同意的状态对象，
         * 就不会出现命名所有字段都一样，就是!==的情况了。
         */
        this.state$
            .skip(1)
            .forEach(state => {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.todos))
            })

        this.actions = new TodoActions(this.$update)
    }

    //从本地存储加载数据    
    private static loadDataFromLocalStorage(key: string): Todo[] {
        let localStore = localStorage.getItem(key);
        return (localStore && JSON.parse(localStore)) || [];
    }
}

export {TodoStore, TodoAppState}
