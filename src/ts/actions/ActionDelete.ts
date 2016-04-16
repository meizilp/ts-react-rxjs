import {Action} from '../Store.ts'
import {TodoAppState, Todo} from '../../index.tsx'

class ActionDelete implements Action<TodoAppState> {
    constructor(private toDeleteTodo: Todo) { }

    reduce(oriState: TodoAppState): TodoAppState {
        return { todos: oriState.todos.filter((todo) => todo != this.toDeleteTodo) }
    }
}

export {ActionDelete}