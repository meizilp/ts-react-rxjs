import * as React from 'react'

import {Store} from '../ts/Store.ts'
import {TodoAppState, Todo} from '../index.tsx'
import {TodoItemComponent} from './TodoItemComponent.tsx'

//显示todo列表的组件。拥有一个data属性，数据是要显示的所有todo对象数组，拥有一个store对象，是要为了传递给显示item的组件
class TodoListComponent extends React.Component<{ store: Store<TodoAppState>, data: Todo[] }, {}> {
    render() {
        //把todo对象数组映射为todo显示组件数组;store传递给item
        let list = this.props.data.map(x => <TodoItemComponent data={x} store={this.props.store}/>)
        //返回组件形成的列表
        return (
            <div>
                {list}
            </div>
        );
    }
}

export {TodoListComponent}