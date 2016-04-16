import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as Rx from 'rxjs'

import {Store} from '../ts/Store.ts'
import {TodoAppState, Todo} from '../index.tsx'

class TodoAppFooter extends React.Component<{ store: Store<TodoAppState>, count: number }, {}> {
    render() {
        return (
            <div>
                <label>Count: {this.props.count}</label>
            </div>
        );
    }
}

export {TodoAppFooter}
