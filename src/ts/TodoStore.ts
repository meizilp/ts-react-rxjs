import * as Rx from 'rxjs'

import {TodoAction, ACTION_CREATE_TODO, ACTION_INIT_STORE, ACTION_DELETE_TODO, ACTION_TOGGLE_TODO, ACTION_UPDATE_TODO} from './TodoAction.ts'
import {Todo} from './Todo.ts'

const LOCAL_STORAGE_KEY = 'myTodo'

class TodoStore {
    public $update$: Rx.BehaviorSubject<TodoAction>  //接收action的Observer，所有的action都会触发其发射事件
    public todos$: Rx.Observable<Todo[]>  //基于subject通过scan函数得到的所有action效果叠加结果
    constructor() {
        this.$update$ = new Rx.BehaviorSubject({ type: ACTION_INIT_STORE, todos: TodoStore.loadFromLocal() })  //从本地存储加载数据
        this.todos$ = this.$update$
            .scan<Todo[]>(
            (todos, action) => {
                switch (action.type) {
                    case ACTION_INIT_STORE:
                        return action.todos  //初始化数据记录下来
                    case ACTION_CREATE_TODO:
                        return [...todos, action.todo]   //新建的todo加入新的结果数组
                    case ACTION_DELETE_TODO:
                        return todos.filter((todo) => todo != action.todo)  //被删除的元素被过滤掉，返回新数组
                    case ACTION_TOGGLE_TODO:
                        //如果不是要修改的对象原样返回，如果是那么新建一个对象复制原对象，并修改完成状态，最终所有对象组成一个新的数组返回
                        return todos.map((t) => {
                            return t !== action.todo ? t : Object.assign({}, t, { completed: !t.completed })
                        })
                    case ACTION_UPDATE_TODO:
                        //如果不是要修改的对象原样返回，如果是那么新建一个对象复制原对象，并修改标题，最终所有对象组成一个新的数组返回
                        return todos.map((t) => {
                            return t !== action.todo ? t : Object.assign({}, t, { title: action.newTitle })
                        })
                    default:
                        return todos;
                }
            }, [])  //scan操作符，把action的影响转换为一个数组。这儿使用了一个空数组进行初始化，如果不初始化，scan所形成observable发射的第一个元素将是subject的初始action，并不是一个数组。

        this.todos$.forEach(todos => TodoStore.saveToLocal(todos))
    }

    static saveToLocal(todos: Todo[]) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
    }

    static loadFromLocal(): Todo[] {
        let localStore = localStorage.getItem(LOCAL_STORAGE_KEY);
        return (localStore && JSON.parse(localStore)) || [];
    }

}

export {TodoStore}
