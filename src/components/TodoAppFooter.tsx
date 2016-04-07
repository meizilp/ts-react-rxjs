import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as Rx from 'rxjs'

import {TodoStore} from '../ts/TodoStore.ts'

class TodoAppFooter extends React.Component<{ store: TodoStore, count: number }, {}> {
    render() {
        return (
            <div>
                <label>Count: {this.props.count}</label>
            </div>
        );
    }
}

export {TodoAppFooter}
