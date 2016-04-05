import {Todo} from './Todo.ts'

//初始化store
const ACTION_INIT_STORE = 'init_store'
//新增Todo的Action名称
const ACTION_CREATE_TODO = 'create'
//删除Todo的Action名称
const ACTION_DELETE_TODO = 'delete'
//改变Todo的完成状态
const ACTION_TOGGLE_TODO = 'toggle'
//更新TODO的title
const ACTION_UPDATE_TODO = 'update'
//操作Todo的Action模型
interface TodoAction {
    type: string,
    todo?: Todo
    todos?: Todo[]
    newTitle?: string
}

export {TodoAction}
export {ACTION_INIT_STORE, ACTION_CREATE_TODO, ACTION_DELETE_TODO, ACTION_TOGGLE_TODO, ACTION_UPDATE_TODO}