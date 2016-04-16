import {Action} from '../Store.ts'
import {TodoAppState, Todo} from '../../index.tsx'


interface UpdateTodoInfo {
    toUpdateTodo: Todo
    newValue: Todo
}

class ActionUpdate implements Action<TodoAppState> {
    constructor(private info: UpdateTodoInfo) { }

    reduce(oriState: TodoAppState): TodoAppState {
        return {
            todos: oriState.todos.map(t => {
                return t !== this.info.toUpdateTodo ? t : Object.assign({}, t, this.info.newValue)
            })
        }
    }
}

export {ActionUpdate, UpdateTodoInfo}