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


## 1. 第一阶段（实现插入todo，并显示列表 commit：48a66ed6c56e8b93573a59879bdf00b51a9bea7e）
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
----------

