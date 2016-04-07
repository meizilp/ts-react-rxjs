import * as Rx from 'rxjs'
import {Todo} from '../Todo.ts'
import {TodoAppState} from '../TodoStore.ts'
import {TodoActionReducer} from './TodoActions.ts'

class ActionDelete extends Rx.Subject<Todo> {
    constructor($update: Rx.Subject<TodoActionReducer>) {
        super()
        this.map<TodoActionReducer>(
            toDeleteTodo => {
                return function(lastState: TodoAppState) {
                    return { todos: lastState.todos.filter((todo) => todo != toDeleteTodo) }
                }
            }
        ).subscribe($update)
    }
}

export {ActionDelete}