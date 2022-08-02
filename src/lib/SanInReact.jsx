import React, { useState, useEffect, useRef, Component, forwardRef, createRef } from 'react'
import { defineComponent } from 'san'
import { omit } from 'lodash'
import * as ReactDOMServer from 'react-dom/server'
import { getId } from '../util'

const getProps = (propss) => {
  console.log('props', propss)
  const props = { ...propss }
  if (props.sModels) {
    for (const key in props.sModels) {
      if (Object.hasOwnProperty.call(props.sModels, key)) {
        props[key] = props.sModels[key][0]
      }
    }
  }
  return omit(props, ['san', 'children', 'sModels'])
}

const SanEmptyCompant = defineComponent({
  template: '<slot/>'
})

export class SanContainer extends Component {
  constructor () {
    super()
    this.id = getId()
    // this.sanAppChildrens = []
  }

  componentDidMount () {
    if (this.props.san) {
      console.log('this.props', this.props)

      // const sanProps = Object.keys(getProps(this.props)).reduce((acc, cur) => {
      //   return acc + ` ${cur}="{{${cur}}}"`
      // }, '')
      // let sanChildren = ''
      // TODO 没用了，需要基于aNode做
      // if (this.props.children) {
      //   const childrens = Array.isArray(this.props.children) ? this.props.children : [this.props.children]
      //   sanChildren = generateChildren(childrens)
      //   console.log('sanChildren', sanChildren)
      // }
      // const template = `<san-app${sanProps}>${sanChildren}</san-app>`
      // console.log('template', template)
      console.log('owner', this.owner)
      // this.props.san.prototype.template="<template><radio/></template>"
      console.log('template', this.props.san.prototype.template)
      // TODO 再包一层，把 san 实例当做子组件
      // 属性要透传，子组件的双向绑定可以watch，然后向上react调onchange
      this.sanApp = new this.props.san({
        owner: this.owner || undefined,
        source: this.source || undefined
      })
      // 牛逼，感觉有新思路了
      // san 的实例有不少可用的
      if (this.props.sModels) {
        for (const key in this.props.sModels) {
          if (Object.hasOwnProperty.call(this.props.sModels, key)) {
            this.sanApp.watch(key, this.props.sModels[key][1])
          }
        }
      }
      const SanApp = new (defineComponent({
        template: '<san-app/>',
        components: {
          'san-app': this.props.san
        }
      }))()
      console.log('SanApp', SanApp)
      // this.sanApp = new SanApp()
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

  componentDidUpdate () {
    console.log('san update data', getProps(this.props))
    if (this.props.san) {
      this.sanApp.data.assign(getProps(this.props))
    }
  }

  componentWillUnmount () {
    if (this.props.san) {
      this.sanApp.detach()
    }
  }

  render () {
    if (this.props.san) {
      return (
        <div className={`wrap-${this.id}`} {...getProps(this.props)}></div>
      )
    } else {
      return null
    }
  }
}

export function SanInReact (component, { owner, source } = {}) {
  if (!component) {
    console.warn('Component must be passed in SanInReact!')
  }

  if (component.__esModule && component.default) {
    component = component.default
  }
  // eslint-disable-next-line react/display-name
  return forwardRef((props, ref) => {
    SanContainer.prototype.owner = owner
    SanContainer.prototype.source = source
    return <SanContainer {...props} san={component} ref={ref} />
  })
}

function generateChildren (children) {
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
