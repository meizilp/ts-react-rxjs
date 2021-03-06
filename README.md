# 将TypeScript、React、Rxjs结合在一起的学习记录

使用TypeScript语言，采用webpack打包工具，使用Visual Code作为IDE，结合React、Rxjs逐步实现TodoMVC的功能。   
[项目主页：https://github.com/meizilp/ts-react-rxjs](https://github.com/meizilp/ts-react-rxjs) 

## 使用说明

代码经历了很多阶段，每个阶段都有tags，可以根据需要commit。  

1. 安装依赖的包、头文件  
```npm install```  
```tsd install```  
2. 编译项目  
```webpack --clean```
3. 运行本地server   
``` ./server.bat ```
4. 在浏览器访问  
``` http://localhost:3000/build/ ```


## 1. 第一阶段（实现插入todo，并显示列表 commit：f8781c7）
1. **src/views/index.html**  
在body中增加 ```<div id='content'></div>``` 作为提交提交内容的元素。  
> React中不建议直接将document.body作为目标元素。
2. **src/index.tsx** todo相关组件   
主界面文件(也是```webpack.config.js```中配置的入口文件)，当前所有的代码都在此文件，未做拆分。    
  - 使用接口定义Todo的数据模型  
  ```js
  //Todo数据模型
  interface TodoItemModel {
      id: number,
      title: string,
      completed: boolean
  }
  ```
  - 显示一条todo的组件  
  ```js
  //用来显示一条todo的组件。拥有一个data属性，可以指定要显示的todo对象。
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
  ```
  - 显示所有todo的列表组件
  ```js
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
  ```
3. **src/index.tsx** App组件  
  - App组件  
  ```js
        //APP组件，页面的入口组件。要求一个包含data字段的状态对象，data字段的数据类型是todo对象数组。
        class App extends React.Component<{}, { data: TodoItemModel[] }> {
            ...
        }
  ```
  - App组件的构造函数    
  ```js
        /*
        *构造函数。给状态对象一个初始值。state的值必须是一个对象，不能是number之类。   
        *如果类定义原型那儿约定data是个number，这儿赋一个number上去，编译没问题，但运行时就会报错。    
        */
        constructor() {
            super()
            this.state = { data: [] };
        }
  ```  
  - App组件的Render函数（决定了渲染到页面上内容）
  ```js
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
  ```  
  - App组件的componentDidMount函数，组件加载后建立业务逻辑  
  ```js  
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
  ```
4. **src/index.tsx** 在页面渲染App组件    
  ```js
    //将App组件渲染到页面的content元素中
    ReactDOM.render(<App />, document.getElementById('content')) 
  ```  
5. 第一阶段遇到过的问题  
  - Promise等类型VsCode默认的lib.d.ts不支持，所以要修改tsconfig.json，指明采用lib.es6.d.ts。  
  - React组件的refs要通过key值访问才好避免vscode的错误提示。（虽然不影响最终使用）
  - TypeScript采用 <类型>变量 这种写法进行强制类型转换，但tsx中<被占用，所以采用as操作符。
  - 函数式编程要求不能修改旧的对象，每次都是返回新对象，保证输入相同，输出相同。 
  - 使用=>来解决this的问题 
  - **React的state和props**  
      1) React组件的state值必须是一个对象。  
      2) state所设置的对象值发生改变时，组件并不会自动改变(没有双向绑定)，必须通过this.setState函数来改变状态。  
      3) 子组件的属性值如果是从父组件state对象获取的，父组件state改变时，子组件也会得到更新。
  - **Rx中的scan操作符**  
      1) scan操作符会回调函数，这个函数要有两个参数值。
      2) 这两个参数值一个是上次调用时的值，一个是这次的值。
      3) 常见例子往往是把这次的值和上次调用的值累加起来，很容易误会scan就是累加。
      4) 值可以是函数，也就是新值或者上次的值都可以是映射后的函数，这样方便针对同一个observable，进行不同的操作。  
                      
## 2. 第二阶段（实现插入、删除todo commit：7789651）
在第一阶段中所有的todos实际上是保存在基于input的回车创建的observable的scan操作符返回的observable中（好拗口）。  
当要删除一个todo时，别的组件来操作这个组件的内部数据这是不好的，所以创建一个全局的Observer，其中用变量保存了当前的所有todos，
所有的事件都通知这个Observer，这个Observer再根据通知类型类决定对于保存的数据集进行如何操作，并且更新组件的状态，进而更新页面内容。  
1. TodoAction,操作todo的请求结构
```js
//新增Todo的Action名称
const ACTION_CREATE_TODO = 'create'
//删除Todo的Action名称
const ACTION_DELETE_TODO = 'delete'
//操作Todo的Action模型
interface TodoAction {
    type: string,
    todo?: TodoItemModel
}
```
2. TodoStore，保存了所有Todos的Observer
```js
//存储所有Todo的Store
class TodoStore implements Rx.Observer<TodoAction> {
    public todos: TodoItemModel[]    //所有todos
    public component: React.Component<any, any>   //要更新状态的组件
    constructor() {
        this.todos = []
    }
    //有事件通知时的回调函数
    next(value: TodoAction) {
        switch (value.type) {
            case ACTION_CREATE_TODO:
                //新建todo，加入数组，更新App组件。
                this.todos.push(value.todo)
                this.component.setState({ data: this.todos })
                break;
            case ACTION_DELETE_TODO:
                //把要删除的todo过滤掉，剩下的作为结果，更新App组件。
                this.todos = this.todos.filter((todo) => todo !== value.todo )
                this.component.setState({ data: this.todos })
                break;
        }
    }
    error(e) {

    }
    complete() {

    }
}
```
3. 显示一条todo的组件，增加了delete的处理。
```js
//用来显示一条todo的组件。拥有一个data属性，数据是要显示的todo对象，拥有一个store属性，用来通知store响应动作
class TodoItem extends React.Component<{ store: TodoStore, data: TodoItemModel }, {}> {
    componentDidMount() {
        let btn_delete: HTMLButtonElement = this.refs['btn_delete'] as HTMLButtonElement;
        //从event生成的observable，每次点击按钮都会触发。
        let clickEvent = Rx.Observable.fromEvent(btn_delete, 'click')
        //click事件触发后转换为删除请求
        let deleteTodo = clickEvent
            .map<TodoAction>(
            () => {
                return {
                    type: ACTION_DELETE_TODO,
                    todo: this.props.data
                }
            }); 

        //当删除todo有发生时通知store更新
        deleteTodo.subscribe(this.props.store)
    }

    render() {
        return (
            <div>
                {/*复选框控件。显示及修改当前todo的完成状态*/}
                <input type='checkbox' checked={this.props.data.completed} />
                {/*显示标题。*/}
                <label>{this.props.data.title}</label>
                {/*删除按钮*/}
                <button ref='btn_delete'>Delete</button>
            </div>
        );
    }
}
```
4. 显示Todo列表的组件，增加了一个store属性，以传递给item显示组件使用。没有采用无状态组件的写法，因为那样写利用不上类型声明，还不如这个清晰。
5. App组件，调整输入框回车事件转换为一个新增Action。  
```js
componentDidMount() {
    //输入框。
    let input: HTMLInputElement = this.refs['titleInput'] as HTMLInputElement;
    //从event生成的observable，每次按键都会触发。
    let enterEvent = Rx.Observable.fromEvent(input, 'keypress')
    //按键事件触发后的系列处理
    let newTodo = enterEvent
        .filter((e: KeyboardEvent) => {
            return e.keyCode === 13
        }) //过滤只允许回车按键事件通过；
        .map(() => input.value) //获取当前输入区的值，映射为新的事件发射；
        .filter(v => v.length > 0)  //过滤只允许输入长度>0零的值通过；
        .map<TodoAction>(
        v => {
            return {
                type: ACTION_CREATE_TODO,
                todo: { id: Date.now(), title: v }
            }
        });  //根据输入值生成一个新的todo对象，映射为新的事件发射；

    //当新建todo有发生时通知store更新
    newTodo.subscribe(this.props.store)
    //当新建todo有发生时清空输入区。必须在store的订阅之后。否则input.value修改会触发事件。        
    newTodo.forEach((c) => {
        input.value = ''    //清空输入区内容，等待新的输入
    })

    //组件加载后设置输入焦点到输入区
    input.focus()
}
```
6. 渲染App组件，并把App组件设置为store的属性。
```js
//将App组件渲染到页面的content元素中
let store = new TodoStore()
store.component = ReactDOM.render(<App store={store}/>, document.getElementById('content')) as React.Component<any, any>
```
7. 第二阶段遇到的问题：
  - 输入框赋值也会触发事件，所以如果订阅事件中设置input.value，那么其他的订阅会受到影响，导致工作不正常。这导致对于订阅顺序有了约束，这是不恰当的。    
  - 输入框不管新增是否成功都会清空，这也是不恰当的。  
  - 在Render <App>组件时，本来计划store创建时把this传递进去作为component的句柄，实际上这个时候this并不是App组件，App组件此时还没创建呢。
  - React无状态组件：不能有声明周期函数；通过参数解构传递数据不能指定数据类型；不能通过this.props访问参数，因为参数就不是属性的一部分。
  
## 3.第三阶段（自定义Store，不再作为Observer，其包含有一个subject来作为Observer Commit:1acfa94）
1. 调整采用subject的原因是：  
  - 解决input.value=''必须在其他订阅执行后的限制。    
  - 解决事件传递到自定义Observer就终止，无法继续链式处理的问题。    
  - subject有多种类型，behavior支持一个初始值，这儿使用最合适。具体差异见[Rx subject文档](https://mcxiaoke.gitbooks.io/rxdocs/content/Subject.html)

2. 思路：    
  1)所有的操作都被映射为一个Action发送给Store的subject；  
  2)subject的scan操作符处理每一个Action并返回一个Observable；    
  3)第2步返回的Observable在App组件中通过foreach操作符处理，每次都更新App组件的状态，进而使页面刷新。  

3. 第三阶段遇到的问题：  
  1)App组件加载时会Render两次。这是正常的，第一次是使用的默认state进行render，然后当数据初始化完成后，收到action，更新了当前结果，又刷新了状态，所以会再刷新一次。  
  2)reduce操作符和scan操作符最大的区别在于reduce要等所有事件发送完毕才触发。  
  3)React的组件构造时this.props还不可用。  
  4)清空input应该在保存成功后再清空（还未实现）（或者异步保存会自动重试，未保存的会一直尝试）    
  5)scan操作符使用的两个参数其类型不一定是一样的，甚至是函数都可以。  
  6)scan操作符如果保存的累加值和新值类型不一样，那么要给一个和累加值类型一样的初始值。比如这儿累加值是一个数组，而新值是个action，如果不给初始值，那么第一个值会是action对象，而不是数组，导致列表组件收到通知render时找不到map函数。  
  7)scan操作符不给初始值时，第一次不会调用所定义的合并函数，而是直接传递第一个值出去。（可以参看scan的代码，里面进行了判断，针对当前是否有值做了不同处理）。所以没有初始值时在scan操作符内的函数加断点发现第一次不会中断，但其实scan函数确实是有执行的。  
  8)在这个App中，不能通过skip(1)来回避scan操作符传递过来的第一个元素，因为这个元素带有初始化数据，是有用的。  
    
## 4.第四阶段（增加本地存储 Commit:9d3482a)
思路：当store的subject初始化时，从本地存储读取数据；当结果集合发生变化时保存到本地再更新组件状态。  
```js
const LOCAL_STORAGE_KEY = 'myTodo'
function saveToLocal(todos: TodoItemModel[]) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
}
function loadFromLocal(): TodoItemModel[] {
    let localStore = localStorage.getItem(LOCAL_STORAGE_KEY);
    return (localStore && JSON.parse(localStore)) || [];
}
```  

## 5.第五阶段（支持修改todo的完成状态）
思路：当check被点击时，发送修改状态的请求，收到请求后原数组map为一个新数组，新数组中要修改的todo用一个新对象复制原对象替代。  
```js 
case ACTION_TOGGLE_TODO:
    //如果不是要修改的对象原样返回，如果是那么新建一个对象复制原对象，并修改完成状态，最终所有对象组成一个新的数组返回
    return todos.map((t) => {
        return t !== action.todo ? t : Object.assign({}, t, { completed: !t.completed })    
    })
```

## 6.第六阶段（支持修改todo的标题）
1. 实现EventHandlerSubject类，从Subject集成，提供一个handle函数，可以作为组件的事件回调函数。
  - EventHandlerSubject  
  ```js  
    class EventHandlerSubject<T extends Event> extends Rx.Subject<T> {
        constructor(destination?: Rx.Observer<T>, source?: Rx.Observable<T>) {
            super(destination, source)
        }
        //提供给外部使用的事件函数句柄，当被调用时触发subject调用next
        public handler(e: T) {
            this.next(e)
        }
    }
  ```
  - 在组件的构造函数中初始化  
  ```this.btnDeleteClickEventSubject = new EventHandlerSubject<any>()```  
  - 绑定DOM元素的事件，一定要用=>函数保证this指向组件  
  ```<button onClick={e => this.btnDeleteClickEventSubject.handler(e) }>Delete</button>```  
  - 当DOM元素的事件触发时，会触发subject emit data，可以通过操作符进行处理  
  ```js
  this.btnDeleteClickEventSubject
            .map<TodoAction>(() => {
                return {
                    type: ACTION_DELETE_TODO,
                    todo: this.props.data
                }
            }).subscribe(this.props.store.subject)  
  ```
2. 增加更新TODO的ACTION，Action的数据结构也微调一下。
3. 处理UPDATE请求的思路：原数组映射一个新数组，不修改的对象原样覆盖过去，修改的对象新建一个对象放入新数组。
4. 组件的render函数根据不同状态，提供不同的DOM元素  
  ```js
    render() {
        //根据不同的状态进行不同呈现
        if (this.state.isEditing) {
            return (
                ...第一种布局
            )
        } else {
            return (
                ...第二种布局
            );
        }
    }    
  ```
5. componentDidUpdate中更新DOM元素，此时新状态创建的DOM已经生效。
6. 第六阶段遇到的问题：  
  - DOM的事件处理函数一定用=>再封装一层解决this不对的问题，这个第一阶段已经遇到过。  
  - props属性在组价构造函数中是访问不到的。这个第三阶段已经遇到过。  
  - input的value属性如果通过dom设置：value={this.props.data.title}，那么就会始终是title的值，除非title的值变化，会造成好像input变成readonly了，输入什么都不管用。
  - setState后，如果页面上dom发生变化，此时实际上通过refs还访问不到。要在componentDidUpdate中才能访问到。 
  - keypresss事件中keycode为0，要通过keyup或者keydown事件来处理  
  - Action的处理函数case分支在变多，不断膨胀有隐患
  - index.tsx代码越来越多，组件混在一起，有隐患

## 7.第七阶段（使用subject替代action string，代码拆分，更深入理解rx）
### 思路：  
  组件单独拆分到不同代码文件；  
  定义状态对象，不再直接使用数组作为状态对象；    
  保存数据从App组件中拿出来，在状态对象发生变化时就保存；    
  DOM事件触发后->触发Action Subject->触发Store的update->触发scan函数->使用传递过来的reduce函数对当前状态处理得到新状态->触发保存状态和App更新状态。    
### 第七阶段遇到的问题：  
  1)scan函数的两个参数是可以不同类型的，甚至可以是函数。  
  2)(state, reducer) => newState这种思路。  
  3)如果订阅一个Observable通过操作符变化后的Observable，当原始Observable发送事件时所有的操作符都会执行一遍，而且有多少个订阅就执行多少遍，不是会把上次的状态保存直接给后面的用。  
  4)想要实现操作符状态的保存给多个订阅者使用，那么创建一个代理Subject，订阅者都订阅这个代理，就不会出现计算多次，每个订阅者获得的对象都不一样的情况了。因为这个没理解，开始用了$update.scan().foreach()  ，多个foreach各自产生了一个状态对象，删除时直接比对对象根本在数组中找不到，看上去就是界面上删除了，但是重新load又出来了，调试了一整天。  
  5)React的思路就是单循环，View就是根据状态显示，如果想改变View的呈现，不要直接修改View，而是修改状态，设置状态（比如不要直接修改input的值）  
  
## 8.第八阶段（使用普通class来描述action）
### 思路：  
  动作作为一个单独的对象发给store，这样去掉了action通过subject再转换一次，思路上更容易理解。  
  以一个DOM事件触发后的流程为例：  
    DOM Event --> (Event Subject).next() -- ... map() --> Action Object --> store.dispatch  
    就是接收后映射然后发送到store。在store里面Action Object执行状态计算后通知状态改变。
### 第八阶段遇到的问题
  1)ts中interface里面声明一个匿名函数，然后加上其他属性，那么复制的时候就要用强制类型转换把一个函数赋值给对象，再给对象增加属性，感觉还不如直接用类。
            
  
   