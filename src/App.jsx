import { useState, useEffect, useRef, Component } from 'react'
import { defineComponent } from 'san'
import { omit } from 'lodash'
let id = 0
const SanApp2 = defineComponent({
  template: /*html*/`
  <div>
    <div>san app 2</div>
    <div>
      <slot name="title"></slot>
      <slot></slot>
    </div>
  </div>
  `
})

const SanApp = defineComponent({
  template: /*html*/`
    <div>
      <div>props:{{a}}</div>
      <div>initData:{{b}}</div>
      <san-app2 s-ref="app2">
        from parent:{{c}}
        <div slot="title">from parent{{c}}</div>
      </san-app2>
    </div>
  `,
  initData() {
    return {
      b: 'b',
      c: 'c'
    }
  },
  components: {
    'san-app2': SanApp2
  },
  attached() {
    console.log('app2', this.ref('app2'))
  }
})



class SanWrap extends Component {
  constructor() {
    super()
    this.id = ++id
  }
  componentDidMount() {
    if (this.props.san) {
      this.sanApp = new this.props.san()
      this.sanApp.data.assign(omit(this.props, ['san', 'children']))
      console.log('this.sanApp', this.sanApp)
      this.sanApp.attach(document.querySelector(`.wrap-${this.id}`))
    }
    console.log('children', this.props.children)
  }
  componentDidUpdate() {
    if (this.props.san) {
      this.sanApp.data.assign(omit(this.props, ['san', 'children']))
    }
  }
  componentWillUnmount() {
    if (this.props.san) {
      this.sanApp.detach()
    }
  }
  render() {
    if (this.props.san) {
      return (
        <div className={`wrap-${this.id}`} {...omit(this.props, ['san', 'children'])}></div>
      )
    } else {
      return null
    }
  }
}


function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <button onClick={() => setCount(count + 1)}>+1:{count}</button>
      <SanWrap san={SanApp} a={count} >
        {/* <SanWrap san={<button>from react</button>} /> */}
      </SanWrap>
      {/* {count < 2 && <SanWrap san={SanApp} a={count} />} */}
    </div>
  )
}

export default App
