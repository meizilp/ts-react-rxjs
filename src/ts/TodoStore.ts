import * as Rx from 'rxjs'

import {Todo} from './Todo.ts'
import {TodoActions, TodoActionReducer} from './actions/TodoActions.ts'

const LOCAL_STORAGE_KEY = 'myTodo'

interface TodoAppState {
    todos: Todo[]
}

class TodoStore {
    public $update: Rx.BehaviorSubject<TodoActionReducer>
    public state$: Rx.BehaviorSubject<TodoAppState>
    public actions: TodoActions

    constructor() {
        this.state$ = new Rx.BehaviorSubject<TodoAppState>({ todos: [] })
        this.$update = new Rx.BehaviorSubject<TodoActionReducer>(null)

        this.$update
            .scan<TodoAppState>((x: TodoAppState, y: TodoActionReducer) => {
                if (y) return y(x)
                else return x
            }, { todos: TodoStore.loadDataFromLocalStorage(LOCAL_STORAGE_KEY) })
            .subscribe(this.state$)

        this.state$
            .skip(1)
            .forEach(state => {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.todos))
            })

        this.actions = new TodoActions(this.$update)
    }

    private static loadDataFromLocalStorage(key: string): Todo[] {
        let localStore = localStorage.getItem(key);
        return (localStore && JSON.parse(localStore)) || [];
    }
}

export {TodoStore, TodoAppState}
