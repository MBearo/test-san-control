import React, { useState, useEffect, useRef, Component, forwardRef, createRef } from 'react'
import { defineComponent } from 'san'
import { omit } from 'lodash'
import * as ReactDOMServer from 'react-dom/server';

let id = 0
const getProps = (props) => omit(props, ['san', 'children'])

const SanEmptyCompant = defineComponent({
  template: '<slot/>'
})

export class SanContainer extends Component {
  constructor() {
    super()
    this.id = ++id
    // this.sanAppChildrens = []
  }
  componentDidMount() {
    if (this.props.san) {
      console.log('this.props', this.props)

      const sanProps = Object.keys(getProps(this.props)).reduce((acc, cur) => {
        return acc + ` ${cur}="{{${cur}}}"`
      }, '')
      let sanChildren = ''
      if (this.props.children) {
        const childrens = Array.isArray(this.props.children) ? this.props.children : [this.props.children]
        sanChildren = generateChildren(childrens)
        console.log('sanChildren', sanChildren)
      }
      const template = `<san-app${sanProps}>${sanChildren}</san-app>`
      console.log('template', template)
      const SanApp = new defineComponent({
        template,
        components: {
          'san-app': this.props.san
        }
      })
      this.sanApp = new SanApp()
      this.sanApp.data.assign(getProps(this.props))
      // this.sanApp = new this.props.san()
      // this.sanApp.data.assign(omit(this.props, ['san', 'children']))
      // console.log('this.sanApp.aNode',this.sanApp.aNode)
      // // 构造一个子组件，并追加到父组件中
      // // TODO 支持 slot 组件

      // console.log('childrens', this.sanApp.children)
      // console.log('this.sanApp', this.sanApp)
      this.sanApp.attach(document.querySelector(`.wrap-${this.id}`))
      // console.log('el', this.sanApp.el)
      // // this.sanAppChildrens.forEach(child => {
      // //   child.attach(this.sanApp.el)
      // // })
    }
    console.log('children', this.props.children)
  }
  componentDidUpdate() {
    if (this.props.san) {
      this.sanApp.data.assign(getProps(this.props))
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

export function SanInReact(component) {
  if (!component) {
    console.warn('Component must be passed in SanInReact!')
  }

  if (component.__esModule && component.default) {
    component = component.default
  }
  // eslint-disable-next-line react/display-name
  return forwardRef((props, ref) => {
    return <SanContainer {...props} san={component} ref={ref} />
  })
}

function generateChildren(children) {
  const childrens = Array.isArray(children) ? children : [children]
  let string = ''
  for (const child of childrens) {
    if (typeof child === 'string' || typeof child === 'number') {
      string += child
    } else if (React.isValidElement(child)) {
      string += `<${child.type}>${generateChildren(child.props.children)}</${child.type}>`
    } else {
      Object.keys(child).forEach(key => {
        // if (key === 'default') {
        string += generateChildren(child[key].props.children)
        // }
      })
    }
  }

  return string
}