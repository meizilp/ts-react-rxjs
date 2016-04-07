import * as React from 'react'
import * as Rx from 'rxjs'

import {TodoStore} from '../ts/TodoStore.ts'
import {Todo} from '../ts/Todo.ts'
import {UpdateTodoInfo} from '../ts/actions/ActionUpdate.ts'

//用来显示一条todo的组件。拥有一个data属性，数据是要显示的todo对象，拥有一个store属性，用来通知store响应动作
class TodoItemComponent extends React.Component<{ store: TodoStore, data: Todo }, { isEditing: boolean }> {
    private lblDbClickEventSubject: Rx.Subject<any>;
    private inputKeyUpEventSubject: Rx.Subject<any>;
    private btnDeleteClickEventSubject: Rx.Subject<any>;
    private cbChangeEventSubject: Rx.Subject<any>;
    constructor() {
        super()
        this.state = { isEditing: false }
        this.lblDbClickEventSubject = new Rx.Subject<any>()
        this.inputKeyUpEventSubject = new Rx.Subject<any>()
        this.btnDeleteClickEventSubject = new Rx.Subject<any>()
        this.cbChangeEventSubject = new Rx.Subject<any>()
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
            .map<Todo>(() => {
                return this.props.data
            }).subscribe(this.props.store.actions.delete)

        this.cbChangeEventSubject
            .map<Todo>(() => {
                return this.props.data
            }).subscribe(this.props.store.actions.toggle)

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
            .map<UpdateTodoInfo>(
            v => {
                this.setState({isEditing:false})
                return {
                    toUpdateTodo: this.props.data,
                    newValue: {title:v}
                }
            }).subscribe(this.props.store.actions.update)

        let cancelEditEvent = this.inputKeyUpEventSubject
            .filter((e: KeyboardEvent) => {
                return e.keyCode === 27   //过滤只允许ESC按键事件通过；
            }).subscribe(() => {
                    this.setState({ isEditing: false })
                }
            )
    }

    render() {
        //根据不同的状态进行不同呈现
        if (this.state.isEditing) {
            return (
                <div>
                    <input type="text" ref='title_input' onKeyUp={e => this.inputKeyUpEventSubject.next(e) }/>
                </div>
            )
        } else {
            return (
                <div>
                    {/*复选框控件。显示及修改当前todo的完成状态*/}
                    <input type='checkbox' checked={this.props.data.completed} onChange={e => this.cbChangeEventSubject.next(e) }/>
                    {/*显示标题。*/}
                    <label onDoubleClick={e => this.lblDbClickEventSubject.next(e) }>{this.props.data.title}</label>
                    {/*删除按钮*/}
                    <button onClick={e => this.btnDeleteClickEventSubject.next(e) }>Delete</button>
                </div>
            );
        }
    }
}

export {TodoItemComponent}
