import {Action} from '../Store.ts'
import {TodoAppState, Todo} from '../../index.tsx'

class ActionCreate implements Action<TodoAppState> {
    constructor(private todo: Todo) { }

    reduce(oriState: TodoAppState): TodoAppState {
        return { todos: [...oriState.todos, this.todo] }
    }
}

export {ActionCreate}