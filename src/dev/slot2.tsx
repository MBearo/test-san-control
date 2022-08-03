import san from 'san'
import ReactDOM from 'react-dom/client'

function GenerateComponent() {
    return san.defineComponent({
        name: 'child',
        template: '<template><slot/></template>',
        attached() {
            console.log(this)
            const self = this
            const InputC = san.defineComponent({
                name: 'input',
                aNode: self.children[0].children[1].aNode
                // template: '<template><slot/></template>',
                // template: '<input value="{=value=}"/>'
            })
            console.log(' self.children[0].children[1].scope', self.children[0].children[1].scope)
            const inputC = new InputC({
                owner: this.parentComponent,
                source: '<x-app value="{=value=}"></x-app>'
                // data: self.children[0].children[1].scope
            })

            // const self = this
            // console.log('this', this)
            // console.log(this.children[0].children[0])
            // const inputANode = this.children[0].children[0].aNode
            // const InputC = san.defineComponent({
            //     name: 'input',
            //     aNode: inputANode,
            //     updated() {
            //         console.log('input updated')
            //     },
            //     initData() {
            //         return self.children[0].children[0].scope.get()
            //     },
            // })
            // const inputC = new InputC({
            //     // owner: self.parentComponent
            //     // data: this.children[0].children[0].scope.get()
            // })
            // console.log('inputC', inputC)

            // this.children[0].children.push(inputC)
            inputC.attach(this.el)

            // 监听父组件的更新
            // const originFn = this.parentComponent.updated || function () { }
            // this.parentComponent.updated = (...args) => {
            //     console.log('update from children')
            //     originFn.call(this.parentComponent, ...args)
            //     inputC.data.assign(self.children[0].children[0].scope.get())
            // }
        },
        updated() {
            console.log('updated')
        }
    })
}
const SanApp2 = san.defineComponent({
    template: '<div>222:<slot/></div>',
})
const SanAppNew = GenerateComponent()
const SanApp = san.defineComponent({
    name: 'parent',
    template: /*html*/`
        <div>
            san:
            <div>------</div>
            <san-app-new>
                <div>
                    <input value="{=value=}"/>
                </div>
            </san-app-new>
            <button on-click="add">+1</button>
        </div>
    `,
    components: {
        'san-app-new': SanAppNew
    },
    initData() {
        return {
            value: 1
        }
    },
    add() {
        this.data.set('value', this.data.get('value') + 1)
    }
})
const sanApp = new SanApp()
sanApp.attach(document.querySelector('#root'))

// const R1 = ({ value, onChange }) => {
//     return (
//         <input value={value} onChange={onChange}></input>
//     )
// }
// const R2 = ({ children }) => {
//     return (
//         <div>
//             {children}
//         </div>
//     )
// }
// const R3 = () => {
//     return (
//         <R2>
//             <R1></R1>
//         </R2>
//     )
// }
// ReactDOM.createRoot(document.querySelector('#main')).render(<R3/>)