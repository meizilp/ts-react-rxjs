/// <reference path="../typings/tsd.d.ts" />

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as Rx from 'rxjs'

//Todo数据模型
interface TodoItemModel {
    id: number,
    title: string,
    completed: boolean
}

//用来显示一条todo的组件。拥有一个data属性，数据是要显示的todo对象。
class TodoItem extends React.Component<{ data: TodoItemModel }, {}> {
    render() {
        return (
            <div>
                {/*复选框控件。显示及修改当前todo的完成状态*/}
                <input type='checkbox' checked={this.props.data.completed} />
                {/*显示标题。*/}
                <label>{this.props.data.title}</label>
                {/*删除按钮*/}
                <button>Delete</button>
            </div>
        );
    }
}

//显示todo列表的组件。拥有一个data属性，数据是要显示的所有todo对象数组。
class TodoList extends React.Component<{ data: TodoItemModel[] }, {}> {
    render() {
        //把todo对象数组映射为todo显示组件数组
        let list = this.props.data.map(x => <TodoItem data={x} />)
        //返回组件形成的列表
        return (
            <div>
                {list}
            </div>
        );
    }
}

//APP组件，页面的入口组件。要求一个包含data字段的状态对象，data字段的数据类型是todo对象数组。
class App extends React.Component<{}, { data: TodoItemModel[] }> {
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
        enterEvent
            .filter((e: KeyboardEvent) => e.keyCode === 13) //过滤只允许回车按键事件通过；
            .map(() => input.value) //获取当前输入区的值，映射为新的事件发射；
            .filter(v => v.length > 0)  //过滤只允许输入长度>0零的值通过；
            .map(v => { return { title: v } })  //根据输入值生成一个新的todo对象，映射为新的事件发射；
            .scan((todos, todo) => {
                if (todos) {
                    return [...todos, todo]
                } else {
                    todos = [todo]
                }
                return todos;
            }, []) //todos是上一次scan调用产生的结果，todo是这次调用的新值，将二者合并到一个新的数组对象。
            .subscribe((c) => {
                this.setState({ data: c }); //更新App组件的state值
                input.value = ''    //清空输入区内容，等待新的输入
            })//todos作为值传入订阅函数（只有一个函数时这个是onNext）。
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
                <TodoList data={this.state.data} />
            </div>
        );
    }
}

//将App组件渲染到页面的content元素中
ReactDOM.render(<App />, document.getElementById('content'))

