import {Todo} from '../Todo.ts'
import {TodoAppState, Action} from '../TodoStore.ts'

class ActionDelete implements Action {
    constructor(private toDeleteTodo: Todo) { }

    reduce(oriState: TodoAppState): TodoAppState {
        return { todos: oriState.todos.filter((todo) => todo != this.toDeleteTodo) }
    }
}

export {ActionDelete}