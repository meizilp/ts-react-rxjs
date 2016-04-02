/// <reference path="../typings/tsd.d.ts" />

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as Rx from 'rxjs'

interface TodoItemModel {
    id: number,
    title: string,
    completed: boolean
}

class TodoItem extends React.Component<{ data: TodoItemModel }, {}> {
    render() {
        return (
            <div>
                <input type='checkbox' checked={this.props.data.completed} />
                <label>{this.props.data.title}</label>
                <button>Delete</button>
            </div>
        );
    }
}

class TodoList extends React.Component<{ data: TodoItemModel[] }, {}> {
    render() {
        let list = this.props.data.map(x => { return <TodoItem data={x} /> })
        return (
            <div>
                {list}
            </div>
        );
    }
}

class App extends React.Component<{}, { data: TodoItemModel[] }> {
    constructor() {
        super()
        this.state = { data: [] };
    }

    componentDidMount() {
        //输入框
        let input: HTMLInputElement = this.refs['titleInput'] as HTMLInputElement;
        //从event生成的observable
        let enterEvent = Rx.Observable.fromEvent(input, 'keypress')
        //匿名observable。当有输入时；输入为enter时；获取当前输入值；当输入值长度>0时；转为一个todo对象；和前面的todo对象放到一个数组中返回。
        let newTodo = enterEvent
            .filter((e: KeyboardEvent) => e.keyCode === 13)
            .map(() => { return input.value; })
            .filter(v => v.length > 0)
            .map(v => { return { title: v } })
            .scan((todos, todo) => {
                if (todos) {
                    return [...todos, todo]
                } else {
                    todos = [todo]
                }
                return todos;
            }, [])
            .subscribe((c) => { this.setState({ data: c }); input.value = '' })
        input.focus()
    }

    render() {
        return (
            <div>
                <h1>TODOS (rxjs) </h1>
                <input type="text" ref='titleInput'/>
                <h2>Count: {this.state.data.length}</h2>
                <TodoList data={this.state.data} />
            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('content'))

