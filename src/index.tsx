/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" /> 
/// <reference path="../typings/tsd.d.ts" />

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as Rx from 'rxjs'

import {TodoListComponent} from './components/TodoListComponent.tsx'
import {TodoAppHeader} from './components/TodoAppHeader.tsx'
import {TodoAppFooter} from './components/TodoAppFooter.tsx'
import {TodoStore} from './ts/TodoStore.ts'
import {Todo} from './ts/Todo.ts'

//APP组件，页面的入口组件。要求一个包含data字段的状态对象，data字段的数据类型是todo对象数组。
class App extends React.Component<{ store: TodoStore }, { data: Todo[] }> {
    /*
    *构造函数。给状态对象一个初始值。  
    */
    constructor() {
        super()
        this.state = { data: [] };
    }

    componentDidMount() {
        //每当todos的结果发生变化时保存到本地存储，并更新整个App的状态        
        this.props.store.todosObservable
            .forEach((todos) => {
                TodoStore.saveToLocal(todos)
                this.setState({ data: todos })
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

//将App组件渲染到页面的content元素中
ReactDOM.render(<App store={new TodoStore() }/>, document.getElementById('content'))

