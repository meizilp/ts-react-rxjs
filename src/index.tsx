/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" /> 
/// <reference path="../typings/tsd.d.ts" />

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as Rx from 'rxjs'

import {EventHandlerSubject} from './ts/utils/EventHandlerSubject.ts'

//Todo数据模型
interface TodoItemModel {
    id?: number,
    title?: string,
    completed?: boolean
}

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
    todo?: TodoItemModel
    todos?: TodoItemModel[]
    newTitle?: string
}

const LOCAL_STORAGE_KEY = 'myTodo'
function saveToLocal(todos: TodoItemModel[]) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
}
function loadFromLocal(): TodoItemModel[] {
    let localStore = localStorage.getItem(LOCAL_STORAGE_KEY);
    return (localStore && JSON.parse(localStore)) || [];
}

class TodoStore {
    public subject: Rx.BehaviorSubject<TodoAction>  //接收action的Observer，所有的action都会触发其发射事件
    public todosObservable: Rx.Observable<TodoItemModel[]>  //基于subject通过scan函数得到的所有action效果叠加结果
    constructor() {
        this.subject = new Rx.BehaviorSubject({ type: ACTION_INIT_STORE, todos: loadFromLocal() })  //从本地存储加载数据
        this.todosObservable = this.subject
            .scan<TodoItemModel[]>(
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
    }
}

//用来显示一条todo的组件。拥有一个data属性，数据是要显示的todo对象，拥有一个store属性，用来通知store响应动作
class TodoItem extends React.Component<{ store: TodoStore, data: TodoItemModel }, { isEditing: boolean }> {
    private lblDbClickEventSubject: EventHandlerSubject<any>;
    private inputKeyUpEventSubject: EventHandlerSubject<any>;
    private btnDeleteClickEventSubject: EventHandlerSubject<any>;
    private cbChangeEventSubject: EventHandlerSubject<any>;
    constructor() {
        super()
        this.state = { isEditing: false }
        this.lblDbClickEventSubject = new EventHandlerSubject<any>()
        this.inputKeyUpEventSubject = new EventHandlerSubject<any>()
        this.btnDeleteClickEventSubject = new EventHandlerSubject<any>()
        this.cbChangeEventSubject = new EventHandlerSubject<any>()
    }

    componentDidUpdate() {
        if (this.state.isEditing) {
            let input = this.refs['title_input'] as HTMLInputElement
            input.value = this.props.data.title
            input.focus()
        }
    }

    componentDidMount() {
        this.btnDeleteClickEventSubject
            .map<TodoAction>(() => {
                return {
                    type: ACTION_DELETE_TODO,
                    todo: this.props.data
                }
            }).subscribe(this.props.store.subject)

        this.cbChangeEventSubject
            .map<TodoAction>(() => {
                return {
                    type: ACTION_TOGGLE_TODO,
                    todo: this.props.data
                }
            }).subscribe(this.props.store.subject)

        this.lblDbClickEventSubject.subscribe(
            () => {
                this.setState({ isEditing: true })
            }
        )

        //按键事件触发后的系列处理
        let confirmEditTodo = this.inputKeyUpEventSubject
            .filter((e: KeyboardEvent) => {
                return e.keyCode === 13
            }) //过滤只允许回车按键事件通过；
            .map((e) => {
                let input = e.target as HTMLInputElement
                 return input.value }) //获取当前输入区的值，映射为新的事件发射；
            .filter(v => v.length > 0)  //过滤只允许输入长度>0零的值通过；
            .map<TodoAction>(
            v => {
                this.setState({isEditing:false})
                return {
                    type: ACTION_UPDATE_TODO,
                    todo: this.props.data,
                    newTitle:v
                }
            }).subscribe(this.props.store.subject)

        let cancelEditEvent = this.inputKeyUpEventSubject
            .filter((e: KeyboardEvent) => {
                return e.keyCode === 27   //过滤只允许ESC按键事件通过；
            }).subscribe(() => {
                this.setState({ isEditing: false })
            }
            )
    }

    render() {
        if (this.state.isEditing) {
            return (
                <div>
                    <input type="text" ref='title_input' onKeyUp={e => this.inputKeyUpEventSubject.handler(e) }/>
                </div>
            )
        } else {
            return (
                <div>
                    {/*复选框控件。显示及修改当前todo的完成状态*/}
                    <input type='checkbox' checked={this.props.data.completed} onChange={e => this.cbChangeEventSubject.handler(e) }/>
                    {/*显示标题。*/}
                    <label onDoubleClick={e => this.lblDbClickEventSubject.handler(e) }>{this.props.data.title}</label>
                    {/*删除按钮*/}
                    <button onClick={e => this.btnDeleteClickEventSubject.handler(e) }>Delete</button>
                </div>
            );
        }
    }
}

//显示todo列表的组件。拥有一个data属性，数据是要显示的所有todo对象数组，拥有一个store对象，是要为了传递给显示item的组件
class TodoList extends React.Component<{ store: TodoStore, data: TodoItemModel[] }, {}> {
    render() {
        //把todo对象数组映射为todo显示组件数组;store传递给item
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
    private inputTitleKeyupEventSubject: EventHandlerSubject<any>;
    /*
    *构造函数。给状态对象一个初始值。state的值必须是一个对象，不能是number之类。   
    *如果类定义原型那儿约定data是个number，这儿赋一个number上去，编译没问题，但运行时就会报错。    
    */
    constructor() {
        super()
        this.state = { data: [{ id: Date.now(), title: 'app init data' }] };
        this.inputTitleKeyupEventSubject = new EventHandlerSubject<any>()
    }

    componentDidMount() {
        //输入框。
        let input: HTMLInputElement = this.refs['titleInput'] as HTMLInputElement;
        //按键事件触发后的系列处理
        let newTodo = this.inputTitleKeyupEventSubject
            .filter((e: KeyboardEvent) => {
                return e.keyCode === 13
            }) //过滤只允许回车按键事件通过；
            .map((e:KeyboardEvent) => (e.target as HTMLInputElement).value) //获取当前输入区的值，映射为新的事件发射；
            .filter(v => v.length > 0)  //过滤只允许输入长度>0零的值通过；
            .map<TodoAction>(
            v => {
                return {
                    type: ACTION_CREATE_TODO,
                    todo: { id: Date.now(), title: v, completed: false }
                }
            });  //根据输入值生成一个新的todo对象，映射为新的事件发射；

        //当新建todo有发生时通知store更新
        newTodo.subscribe(this.props.store.subject)

        //每当收到创建新条目的action时清空输入区（待实现异步保存成功后再清空输入区）
        this.props.store.subject
            .filter((a) => a.type === ACTION_CREATE_TODO)
            .forEach((todos) => {
                input.value = ''
            })

        //每当todos的结果发生变化时保存到本地存储，并更新整个App的状态        
        this.props.store.todosObservable
            .forEach((todos) => {
                saveToLocal(todos)
                this.setState({ data: todos })
            })
    }

    render() {
        return (
            <div>
                {/**标题文本 */}
                <h1>TODOS (rxjs) </h1>
                {/**标题输入区。指定一个ref名称，以便后面访问dom获取输入值 */}
                <input type="text" ref='titleInput' autoFocus onKeyUp={e => this.inputTitleKeyupEventSubject.handler(e) }/>
                {/**显示一个总数。通过访问状态对象的数据获得。 */}
                <h2>Count: {this.state.data.length}</h2>
                {/**嵌入一个todo列表组件，设置其属性为状态对象的数据 */}
                <TodoList data={this.state.data} store={this.props.store}/>
            </div>
        );
    }
}

//将App组件渲染到页面的content元素中
ReactDOM.render(<App store={new TodoStore() }/>, document.getElementById('content'))

