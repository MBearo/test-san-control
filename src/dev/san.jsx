import san, { defineComponent } from 'san'
import ReactDOM from 'react-dom/client'
import React, { useState } from 'react'
import { SanInReact } from '../lib-v2/SanInReact'

const SanApp3 = defineComponent({
  template: /* html */`
    <div slot="name1">
      <input value="{{value}}"/> san app 3
    </div>
  `
})
const SanApp2 = defineComponent({
  template: /* html */`
    <span>
      <slot name="name234"/>
      <div>san app 2</div>
    </span>
  `,
  beforeAttach () {
    console.log('name2342 aNode beforeAttach', this.aNode)
  },
  attached () {
    console.log('name2342 aNode attached', this.aNode)
  }
})

const SanApp = defineComponent({
  template: /* html */`
        <div>
            <child s-ref="child"><a slot="name234">llll</a></child>
            <button on-click="add">+1</button>
        </div>
    `,
  initData () {
    return {
      number: 234
    }
  },
  components: {
    child: SanApp2
  },
  add () {
    this.data.set('number', this.data.get('number') + 1)
  },
  beforeAttach () {
    // console.log('san app aNode', this.aNode)
  },
  attached () {
    // console.log('child ref', this.ref('child'))
  }
})

const React1 = ({ value }) => {
  return <div>1:{value}</div>
}
const SanInReactApp2 = SanInReact(SanApp2)
const React2 = () => {
  // const value = 3333
  const [value, setValue] = useState(333)
  return (
    <div>
      <div>react</div>
      <SanInReactApp2 >
        <a slot="name234">{{ value }}</a>
      </SanInReactApp2>
    </div>
  )
}
// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React2 />
// )
// console.log('React2', React2().props.children[1].type(React2().props.children[1].props))
const sanApp = new SanApp()
console.log('sanApp', sanApp)
window.app = sanApp
sanApp.attach(document.querySelector('#root'))

// const Table = san.defineComponent({
//   template: '' +
//       '<table>' +
//       '<thead><tr><th s-for="col in columns">{{col.label}}</th></tr></thead>' +
//       '<tbody>' +
//       '<tr s-for="row in datasource">' +
//       '<td s-for="col in columns">' +
//       '<slot name="col-{{col.name}}" var-row="row" var-col="col">{{row[col.name]}}</slot>' +
//       '</td>' +
//       '    </tr>' +
//       '</tbody>' +
//       '</table>'
// })

// const MyComponent = san.defineComponent({
//   components: {
//     'x-table': Table
//   },

//   template: '' +
//       '<div>' +
//       '<x-table columns="{{columns}}" datasource="{{list}}">' +
//       '<b slot="col-name">{{row.name}}</b>' +
//       '</x-table>' +
//       '</div>'

// })

// const myComponent = new MyComponent({
//   data: {
//     columns: [
//       { name: 'name', label: '名' },
//       { name: 'email', label: '邮' }
//     ],
//     list: [
//       { name: 'errorrik', email: 'errorrik@gmail.com' },
//       { name: 'leeight', email: 'leeight@gmail.com' }
//     ]
//   }
// })
// console.log('myComponent', myComponent)
// myComponent.attach(document.querySelector('#root'))
