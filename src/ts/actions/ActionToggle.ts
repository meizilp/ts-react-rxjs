import {Action} from '../Store.ts'
import {TodoAppState, Todo} from '../../index.tsx'

class ActionToggle implements Action<TodoAppState> {
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