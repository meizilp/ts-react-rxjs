import * as Rx from 'rxjs'
import {Todo} from '../Todo.ts'
import {TodoAppState} from '../TodoStore.ts'
import {TodoActionReducer} from './TodoActions.ts'

class ActionToggle extends Rx.Subject<Todo> {
    constructor($update: Rx.Subject<TodoActionReducer>) {
        super()
        this.map<TodoActionReducer>(
            todo => {
                return function(lastState: TodoAppState) {
                    return { 
                        todos: lastState.todos.map((t) => {
                            return t !== todo ? t : Object.assign({}, t, { completed: !t.completed })
                        }),
                        name: Date.now()
                    }
                }
            }
        ).subscribe($update)
    }
}

export {ActionToggle}