import * as Rx from 'rxjs'
import {Todo} from '../Todo.ts'

import {TodoAppState} from '../TodoStore.ts'
import {ActionCreate} from './ActionCreate.ts'
import {ActionDelete} from './ActionDelete.ts'
import {ActionUpdate} from './ActionUpdate.ts'
import {ActionToggle} from './ActionToggle.ts'

interface TodoActionReducer {
    (lastState: TodoAppState): TodoAppState;
}

class TodoActions {
    public create: ActionCreate
    public delete: ActionDelete
    public update: ActionUpdate
    public toggle: ActionToggle
    constructor($update: Rx.Subject<TodoActionReducer>) {
        this.create = new ActionCreate($update)
        this.delete = new ActionDelete($update)
        this.update = new ActionUpdate($update)
        this.toggle = new ActionToggle($update)
    }
}

export {TodoActions, TodoActionReducer}
