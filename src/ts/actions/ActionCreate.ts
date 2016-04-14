import {Todo} from '../Todo.ts'
import {TodoAppState, Action} from '../TodoStore.ts'

class ActionCreate implements Action {
    constructor(private todo: Todo) { }

    reduce(oriState: TodoAppState): TodoAppState {
        return { todos: [...oriState.todos, this.todo] }
    }
}

export {ActionCreate}