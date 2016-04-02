/// <reference path="../typings/tsd.d.ts" />

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as Rx from 'rxjs'


//Todo数据模型
interface TodoItemModel {
    id?: number,
    title?: string,
    completed?: boolean
}

//新增Todo的Action名称
const ACTION_CREATE_TODO = 'create'
//删除Todo的Action名称
const ACTION_DELETE_TODO = 'delete'

//操作Todo的Action模型
interface TodoAction {
    type: string,
    todo?: TodoItemModel
}

//存储所有Todo的Store
class TodoStore implements Rx.Observer<TodoAction> {
    public todos: TodoItemModel[]
    public component: React.Component<any, any>
    constructor() {
        this.todos = []
    }
    next(value: TodoAction) {
        switch (value.type) {
            case ACTION_CREATE_TODO:
                value.todo.id = Date.now()
                this.todos.push(value.todo)
                this.component.setState({ data: this.todos })
                break;
            case ACTION_DELETE_TODO:
                let newTodos: TodoItemModel[] = [];
                this.todos.forEach(
                    x => {
                        if (x.id != value.todo.id) {
                            newTodos.push(x)
                        }
                    }
                )
                this.todos = newTodos;
                this.component.setState({ data: this.todos })
                break;
        }
    }
    error(e) {

    }
    complete() {

    }
}


//用来显示一条todo的组件。拥有一个data属性，数据是要显示的todo对象，拥有一个store属性，用来通知store响应动作
class TodoItem extends React.Component<{ store: TodoStore, data: TodoItemModel }, {}> {
    componentDidMount() {
        let btn_delete: HTMLButtonElement = this.refs['btn_delete'] as HTMLButtonElement;
        //从event生成的observable，每次点击按钮都会触发。
        let clickEvent = Rx.Observable.fromEvent(btn_delete, 'click')
        //按键事件触发后的系列处理
        let deleteTodo = clickEvent
            .map<TodoAction>(
            () => {
                return {
                    type: ACTION_DELETE_TODO,
                    todo: { id: this.props.data.id }
                }
            });  //请求删除指定id的todo

        //当删除todo有发生时通知store更新
        deleteTodo.subscribe(this.props.store)
    }

    render() {
        return (
            <div>
                {/*复选框控件。显示及修改当前todo的完成状态*/}
                <input type='checkbox' checked={this.props.data.completed} />
                {/*显示标题。*/}
                <label>{this.props.data.title}</label>
                {/*删除按钮*/}
                <button ref='btn_delete'>Delete</button>
            </div>
        );
    }
}

//显示todo列表的组件。拥有一个data属性，数据是要显示的所有todo对象数组，拥有一个store对象，是要为了传递给显示item的组件
class TodoList extends React.Component<{ store: TodoStore, data: TodoItemModel[] }, {}> {
    render() {
        //把todo对象数组映射为todo显示组件数组
        let list = this.props.data.map(x => <TodoItem data={x} store={this.props.store}/>)
        //返回组件形成的列表
        return (
            <div>
                {list}
            </div>
        );
    }
}

//APP组件，页面的入口组件。要求一个包含data字段的状态对象，data字段的数据类型是todo对象数组。
class App extends React.Component<{ store: TodoStore }, { data: TodoItemModel[] }> {
    /*
    *构造函数。给状态对象一个初始值。state的值必须是一个对象，不能是number之类。   
    *如果类定义原型那儿约定data是个number，这儿赋一个number上去，编译没问题，但运行时就会报错。    
    */
    constructor() {
        super()
        this.state = { data: [] };
    }

    componentDidMount() {
        //输入框。
        let input: HTMLInputElement = this.refs['titleInput'] as HTMLInputElement;
        //从event生成的observable，每次按键都会触发。
        let enterEvent = Rx.Observable.fromEvent(input, 'keypress')
        //按键事件触发后的系列处理
        let newTodo = enterEvent
            .filter((e: KeyboardEvent) => {
                return e.keyCode === 13
            }) //过滤只允许回车按键事件通过；
            .map(() => input.value) //获取当前输入区的值，映射为新的事件发射；
            .filter(v => v.length > 0)  //过滤只允许输入长度>0零的值通过；
            .map<TodoAction>(
            v => {
                return {
                    type: ACTION_CREATE_TODO,
                    todo: { title: v }
                }
            });  //根据输入值生成一个新的todo对象，映射为新的事件发射；

        //当新建todo有发生时通知store更新
        newTodo.subscribe(this.props.store)
        //当新建todo有发生时清空输入区。必须在store的订阅之后。否则input.value修改会触发事件。        
        newTodo.forEach((c) => {
            input.value = ''    //清空输入区内容，等待新的输入
        })

        //组件加载后设置输入焦点到输入区
        input.focus()
    }

    render() {
        return (
            <div>
                {/**标题文本 */}
                <h1>TODOS (rxjs) </h1>
                {/**标题输入区。指定一个ref名称，以便后面访问dom获取输入值 */}
                <input type="text" ref='titleInput'/>
                {/**显示一个总数。通过访问状态对象的数据获得。 */}
                <h2>Count: {this.state.data.length}</h2>
                {/**嵌入一个todo列表组件，设置其属性为状态对象的数据 */}
                <TodoList data={this.state.data} store={this.props.store}/>
            </div>
        );
    }
}

//将App组件渲染到页面的content元素中
let store = new TodoStore()
store.component = ReactDOM.render(<App store={store}/>, document.getElementById('content')) as React.Component<any, any>

