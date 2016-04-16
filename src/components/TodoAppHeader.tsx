import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as Rx from 'rxjs'

import {TodoAppState, Todo} from '../index.tsx'
import {Store} from '../ts/Store.ts'
import {ActionCreate} from '../ts/actions/ActionCreate.ts'

class TodoAppHeader extends React.Component<{ store: Store<TodoAppState> }, { title: string }> {
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
        //按键事件触发后的系列处理
        this.inputTitleKeyupEventSubject
            .filter((e: KeyboardEvent) => {
                return e.keyCode === 13
            }) //过滤只允许回车按键事件通过；
            .map((e: KeyboardEvent) => (e.target as HTMLInputElement).value) //获取当前输入区的值，映射为新的事件发射；
            .filter(v => v.length > 0)  //过滤只允许输入长度>0零的值通过；
            .map(t => {
                this.setState({ title: '' })
                return new ActionCreate({ id: Date.now(), title: t, completed: false })
            })
            .subscribe(this.props.store.$dispatch)
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
