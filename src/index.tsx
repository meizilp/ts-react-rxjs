/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" /> 
/// <reference path="../typings/tsd.d.ts" />

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as Rx from 'rxjs'

import {TodoListComponent} from './components/TodoListComponent.tsx'
import {TodoAppHeader} from './components/TodoAppHeader.tsx'
import {TodoAppFooter} from './components/TodoAppFooter.tsx'
import {Store} from './ts/Store.ts'

interface Todo {
    id?: number,
    title?: string,
    completed?: boolean
}
export {Todo}

//状态对象。
interface TodoAppState {
    todos: Todo[]
}
export {TodoAppState}

const LOCAL_STORAGE_KEY = 'myTodo'
function loadStateFromLocalStorae(): TodoAppState {
    let localStore = localStorage.getItem(LOCAL_STORAGE_KEY);
    return { todos: (localStore && JSON.parse(localStore)) || [] }
}

function saveStateToLocalStorage(s: TodoAppState) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(s.todos))
}

//APP组件，页面的入口组件。要求一个包含data字段的状态对象，data字段的数据类型是todo对象数组。
class App extends React.Component<{ store: Store<TodoAppState> }, { data: Todo[] }> {
    /*
    *构造函数。给状态对象一个初始值。  
    */
    constructor() {
        super()
        this.state = { data: [] };
    }

    componentDidMount() {
        //每当todos的结果发生变化时保存到本地存储，并更新整个App的状态        
        this.props.store.state$
            .forEach((state) => {
                this.setState({ data: state.todos })
            })
    }

    render() {
        return (
            <div>
                {/**标题文本 */}
                <h1>TODOS</h1>
                <TodoAppHeader store={this.props.store}/>
                {/**嵌入一个todo列表组件，设置其属性为状态对象的数据 */}
                <TodoListComponent data={this.state.data} store={this.props.store}/>
                <TodoAppFooter count={this.state.data.length} store={this.props.store}/>
            </div>
        );
    }
}

var ts = new Store<TodoAppState>(loadStateFromLocalStorae())
ts.state$
    .skip(1)
    .forEach(state => {
        saveStateToLocalStorage(state)
    })

//将App组件渲染到页面的content元素中
ReactDOM.render(<App store={ts}/>, document.getElementById('content'))

