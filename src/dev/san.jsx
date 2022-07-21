import { defineComponent } from 'san'
const SanApp2 = defineComponent({
    template: '<span><slot/></span>',
})
const SanApp = defineComponent({
    template: /*html*/`
        <div>
            <child><a>{{number}}</a></child>
            <button on-click="add">+1</button>
        </div>
    `,
    initData() {
        return {
            number: 234
        }
    },
    components: {
        child: SanApp2
    },
    add() {
        this.data.set('number', this.data.get('number') + 1)
    }
})

const React1 = ({ value }) => {
    return <div>1:{value}</div>
}
const React2 = () => {
    const value = 3333
    return <div>2<React1 value={value} /></div>
}
console.log('React2', React2().props.children[1].type(React2().props.children[1].props))
const sanApp = new SanApp()
console.log('sanApp', sanApp)
window.app = sanApp
sanApp.attach(document.querySelector('#root'))