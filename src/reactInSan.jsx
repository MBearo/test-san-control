import React from 'react'
import ReactDOM from 'react-dom/client'
import san from 'san'
import { omit } from 'lodash'

let id = 0

const makeReactContainer = Component => {
  return class ReactInVue extends React.Component {
    // 为啥是 displayName，好像抛 error 的时候可以显示
    static displayName = `ReactInSan${Component.displayName || Component.name || "Component"}`;
    constructor(props) {
      super(props);
      this.state = { ...props };
    }
    render() {
      const { ...rest } = this.state;
      return <Component {...rest}></Component>;
    }
  };
};

class ReactApp2 extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    console.log('ReactApp2', this)
    return <div onClick={this.props.onClick}>react child:{this.props.count}</div>
  }
}
class ReactWrap extends san.Component {
  static template = `<div class="wrap-{{id}}"></div>`

  initData() {
    return {
      id: ++id
    }
  }
  updated() {
    this.reactComponentRef.setState(omit(this.data.get(), ['react', 'id']));
  }
  attached() {
    // console.log('this', this)
    // console.log('this2', this.listeners)
    // console.log('event', this.listeners.click[0])
    const react = this.data.get('react')
    const Component = makeReactContainer(react);
    // console.log('react', react)
    const eventObj = {}
    for (const key in this.listeners) {
      eventObj[`on${key.replace(/^\S/, s => s.toUpperCase())}`] = (e) => this.listeners[key].forEach(({ fn }) => fn(e))
    }
    console.log(eventObj)
    this.reactRoot = ReactDOM.createRoot(document.querySelector(`.wrap-${this.data.get('id')}`))
    this.reactRoot.render(<Component ref={ref => (this.reactComponentRef = ref)} {...omit(this.data.get(), ['react', 'id'])} {...eventObj} />)
  }
  disposed() {
    this.reactRoot.unmount()
  }
}


const sanApp = san.defineComponent({
  template: /*html*/`
  <div class="app">
    <button on-click="increment">+1:{{count}}</button>
    <react-wrap react="{{react}}" count="{{count}}" on-click="fff"></react-wrap>
  </div>
  `,
  components: {
    'react-wrap': ReactWrap
  },
  initData() {
    return {
      count: 1,
      react: ReactApp2
    }
  },
  increment() {
    this.data.set('count', this.data.get('count') + 1)
  },
  fff(e) {
    console.log(1, e)
    console.log(this.data.get('count'))
  }
})
  ; (new sanApp()).attach(document.getElementById('root'))
