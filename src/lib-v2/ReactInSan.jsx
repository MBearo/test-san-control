import san from 'san'
import React from 'react'
import ReactDOM from 'react-dom/client'
import _ from 'lodash'
import { kebabCaseToCamelCase, kebabCaseToPascalCase } from '../util'

/**
 * props
 * event
 * 双向绑定
 */

function Container (ReactComponent) {
  return class Container extends san.Component {
    static template = '' // 不声明template会报错
    created () {
    }

    attached () {
      console.log('container', this)
      console.log('getBind', getBind(this))
      this.ReactDOMRoot = ReactDOM.createRoot(this.el)
      this.render()
    }

    updated () {
      this.render()
    }

    disposed () {
      this.ReactDOMRoot.unmount()
    }

    render () {
      const porps = getAllProps(this)
      this.ReactDOMRoot.render(<ReactComponent {...porps} />)
    }
  }
}

export const ReactInSan = (ReactComponent) => {
  if (!ReactComponent) {
    console.warn('Component must be passed in ReactInSan!')
    return
  }
  return Container(ReactComponent)
}
function getBind (self) {
  const bindObj = {}
  for (const item of self.binds) {
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
