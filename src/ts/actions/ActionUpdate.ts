import * as Rx from 'rxjs'
import {Todo} from '../Todo.ts'
import {TodoAppState} from '../TodoStore.ts'
import {TodoActionReducer} from './TodoActions.ts'

interface UpdateTodoInfo {
    toUpdateTodo: Todo
    newValue: Todo
}
class ActionUpdate extends Rx.Subject<UpdateTodoInfo> {
    constructor($update: Rx.Subject<TodoActionReducer>) {
        super()
        this.map<TodoActionReducer>(
            info => {
                return function(lastState: TodoAppState) {
                    return { todos: lastState.todos.map((t) => {
                            return t !== info.toUpdateTodo ? t : Object.assign({}, t, info.newValue)
                        })
                    }
                }
            }
        ).subscribe($update)
    }
}

export {ActionUpdate, UpdateTodoInfo}