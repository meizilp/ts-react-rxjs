import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as Rx from 'rxjs'

import {TodoStore} from '../ts/TodoStore.ts'
import {TodoAction, ACTION_CREATE_TODO} from '../ts/TodoAction.ts'

class TodoAppHeader extends React.Component<{store:TodoStore}, {}> {
    private inputTitleKeyupEventSubject: Rx.Subject<any>;

    constructor() {
        super()
        this.inputTitleKeyupEventSubject = new Rx.Subject<any>()
    }

    componentDidMount() {
        //输入框。
        let input: HTMLInputElement = this.refs['titleInput'] as HTMLInputElement;
        //按键事件触发后的系列处理
        let newTodo = this.inputTitleKeyupEventSubject
            .filter((e: KeyboardEvent) => {
                return e.keyCode === 13
            }) //过滤只允许回车按键事件通过；
            .map((e: KeyboardEvent) => (e.target as HTMLInputElement).value) //获取当前输入区的值，映射为新的事件发射；
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
    }

    render() {
        return (
            <div>
                {/**标题输入区。指定一个ref名称，以便后面访问dom获取输入值 */}
                <input type="text" ref='titleInput' autoFocus onKeyUp={e => this.inputTitleKeyupEventSubject.next(e) }/>
            </div>
        );
    }
}

export {TodoAppHeader}
