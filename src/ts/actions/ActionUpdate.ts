import {Todo} from '../Todo.ts'
import {TodoAppState, Action} from '../TodoStore.ts'

interface UpdateTodoInfo {
    toUpdateTodo: Todo
    newValue: Todo
}

class ActionUpdate implements Action {
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