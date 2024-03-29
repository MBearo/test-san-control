import san from 'san'
import React from 'react'
import ReactDOM from 'react-dom/client'
import _ from 'lodash'
import { kebabCaseToCamelCase, kebabCaseToPascalCase, REACT_ELEMENT } from '../util'
import { SanInReact } from './SanInReact'
/**
 * props
 * event
 * 双向绑定
 */

function Container (ReactComponent) {
  return class Container extends san.Component {
    static template = '<template><slot/></template>' // 不声明template会报错
    created () {
    }

    attached () {
      console.log('container', this)
      console.log('getBind', getBind(this))
      console.log('parent', this.parentComponent)
      console.log('this.data.get()', this.children[0].childScope.get())
      console.log('scope', this.scope === this.parentComponent.scope)
      // ? 下面这个思路有点乱，需要一点一点去绑定和父组件的关系
      // const SanContainer = san.defineComponent({
      //   aNode: this.children[0].aNode
      // })
      // console.log('SanContainer', typeof SanContainer)
      // const sanApp = new SanContainer({
      //   data: this.children[0].childScope.get()
      // })
      // console.log('sanApp', sanApp)
      // const Res = SanInReact(sanApp)

      // const SanContainer = san.defineComponent({
      //   aNode: this.aNode
      // })
      // const sanApp = new SanContainer({
      //   source: this.aNode,
      //   parent: this.parentComponent,
      //   owner: this.parentComponent,
      //   scope: this.parentComponent.data
      // })
      // this.parentComponent.children.push(sanApp)
      // console.log('sanApp', sanApp)
      // // sanApp._contentReady = undefined
      // const Res = SanInReact(sanApp)

      this.reactDOMRoot = ReactDOM.createRoot(this.el)
      // this.children[0].childScope.listeners.forEach(v => {
      //   const originFn = v
      //   const fn = () => {
      //     notify()
      //     originFn()
      //   }
      //   v = originFn
      // })

      // 监听父组件的更新
      const originFn = this.parentComponent.updated || function () { }
      this.parentComponent.updated = (...args) => {
        console.log('update from children')
        originFn.call(this.parentComponent, ...args)
        console.log('?????', this.children[0])
      }
      this.render(Res)
    }

    updated () {
      this.render()
    }

    disposed () {
      this.reactDOMRoot.unmount()
    }

    render (Res) {
      // ? 会不会有直接使用 react element 的需求，而不是现在的传一个 react component
      const porps = getAllProps(this)
      if (typeof ReactComponent === 'function') {
        this.reactDOMRoot.render(
          // <ReactComponent {...porps} >
          //   <Res/>
          // </ReactComponent>
          <Res />
        )
      } else if (this.data.get(REACT_ELEMENT)) {
        console.log('this.data.get(REACT_ELEMENT)', this.data.get(REACT_ELEMENT))
        this.reactDOMRoot.render(this.data.get(REACT_ELEMENT))
      }
    }
  }
}

export const ReactInSan = (ReactComponent) => {
  // 不用判断是否传了值
  return Container(ReactComponent)
}
function getBind (self) {
  const bindObj = {}
  // TODO 属性为slot的时候，parent.data是空的，不知道是为啥
  for (const item of self.binds.filter(v => v.name !== 'slot')) {
    bindObj[item.name] = self.parent.data.get(item.expr)
    // react 调用 {变量名}Change 的函数修改变量
    // TODO react 事件转为原始事件
    bindObj[`${item.name}Change`] = (...porps) => {
      self.parent.data.set(item.expr, ...porps)
    }
  }
  return bindObj
}
function getEvent (self) {
  const eventObj = {}
  for (const key in self.listeners) {
    // TODO 不确定 this 指向对不对
    // TODO 回调的是 react 事件，不是原始事件
    eventObj[`on${kebabCaseToPascalCase(key)}`] = (...porps) => self.listeners[key].forEach(({ fn }) => fn.call(self.parent, ...porps))
  }
  return eventObj
}
function getProps (self) {
  const propsOjb = {}
  Object.entries(self.data.get()).forEach(([key, value]) => {
    propsOjb[kebabCaseToCamelCase(key)] = value
  })
  return propsOjb
}
function getAllProps (self) {
  return { ...getProps(self), ...getEvent(self), ...getBind(self) }
}
