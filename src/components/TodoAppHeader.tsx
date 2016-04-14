import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as Rx from 'rxjs'

import {TodoStore} from '../ts/TodoStore.ts'
import {ActionCreate} from '../ts/actions/ActionCreate.ts'

class TodoAppHeader extends React.Component<{ store: TodoStore }, { title: string }> {
    private inputTitleKeyupEventSubject: Rx.Subject<any>;

    constructor() {
        super()
        this.inputTitleKeyupEventSubject = new Rx.Subject<any>()
        this.state = { title: '' }
    }

    handleTitleChange(e) {
        this.setState({ title: e.target.value })
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
            .map(t => {
                return new ActionCreate({ id: Date.now(), title: t, completed: false })
            })
            .subscribe(this.props.store.$dispatch)

        //清空输入区(待增加保存中这个状态的处理)
        this.setState({ title: '' })
    }

    render() {
        return (
            <div>
                {/**标题输入区。指定一个ref名称，以便后面访问dom获取输入值 */}
                <input type="text" ref='titleInput' autoFocus value={this.state.title}
                    onChange={e => this.handleTitleChange(e) }
                    onKeyUp={e => this.inputTitleKeyupEventSubject.next(e) }/>
            </div>
        );
    }
}

export {TodoAppHeader}
