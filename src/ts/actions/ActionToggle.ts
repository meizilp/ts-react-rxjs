import {Todo} from '../Todo.ts'
import {TodoAppState, Action} from '../TodoStore.ts'

class ActionToggle implements Action {
    constructor(private todo: Todo) { }

    reduce(oriState: TodoAppState): TodoAppState {
        return {
            todos: oriState.todos.map(t => {
                return t !== this.todo ? t : Object.assign({}, t, { completed: !t.completed })
            })
        }
    }
}

export {ActionToggle}