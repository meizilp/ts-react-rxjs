import * as Rx from 'rxjs'
import {Todo} from '../Todo.ts'
import {TodoAppState} from '../TodoStore.ts'
import {TodoActionReducer} from './TodoActions.ts'

class ActionCreate extends Rx.Subject<string>{
    constructor($update: Rx.Subject<TodoActionReducer>) {
        super()
        this.map<TodoActionReducer>(
            title => {
                return function(lastState: TodoAppState) {
                    return { todos: [...lastState.todos, { id: Date.now(), title: title, completed: false }] }
                }
            }
        ).subscribe($update)
    }
}

export {ActionCreate}