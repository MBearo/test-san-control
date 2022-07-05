import React, { useState, useEffect, useRef, Component, forwardRef } from 'react'
import { defineComponent } from 'san'
import { omit } from 'lodash'
import * as ReactDOMServer from 'react-dom/server';
let id = 0
const getProps = (props) => omit(props, ['san', 'children'])

const SanEmptyCompant = defineComponent({
  template: '<slot/>'
})
class SanComponentLoader extends Component {
  
}
// eslint-disable-next-line react/display-name
const SanContainer = forwardRef((props, ref) => {
  if (props.component == null) return null
  console.log('ref', ref)
  return <SanComponentLoader {...props} ref={ref} />
})

export function SanInReact(component, options = {}) {
  if (!component) {
    console.warn('Component must be passed in applyVueInReact!')
  }

  if (component.__esModule && component.default) {
    component = component.default
  }

  // eslint-disable-next-line react/display-name
  return forwardRef((props, ref) => {
    return <SanContainer {...props} component={component} ref={ref} />
  })
}
// export class SanInReact extends Component {
//   constructor() {
//     super()
//     this.id = ++id
//     // this.sanAppChildrens = []
//   }
//   componentDidMount() {
//     if (this.props.san) {
//       console.log('this.props', this.props)

//       const sanProps = Object.keys(getProps(this.props)).reduce((acc, cur) => {
//         return acc + ` ${cur}="{{${cur}}}"`
//       }, '')
//       let sanChildren = ''
//       if (this.props.children) {
//         console.log('tttttt', generateChildren(this.props.children, getProps(this.props)))

//       }
//       const template = `<san-app${sanProps}>${sanChildren}</san-app>`
//       console.log('template', template)
//       const SanApp = new defineComponent({
//         template,
//         components: {
//           'san-app': this.props.san
//         }
//       })
//       this.sanApp = new SanApp()
//       this.sanApp.data.assign(getProps(this.props))
//       // this.sanApp = new this.props.san()
//       // this.sanApp.data.assign(omit(this.props, ['san', 'children']))
//       // console.log('this.sanApp.aNode',this.sanApp.aNode)
//       // // 构造一个子组件，并追加到父组件中
//       // // TODO 支持 slot 组件

//       // console.log('childrens', this.sanApp.children)
//       // console.log('this.sanApp', this.sanApp)
//       this.sanApp.attach(document.querySelector(`.wrap-${this.id}`))
//       // console.log('el', this.sanApp.el)
//       // // this.sanAppChildrens.forEach(child => {
//       // //   child.attach(this.sanApp.el)
//       // // })
//     }
//     console.log('children', this.props.children)
//   }
//   componentDidUpdate() {
//     if (this.props.san) {
//       this.sanApp.data.assign(getProps(this.props))
//     }
//   }
//   componentWillUnmount() {
//     if (this.props.san) {
//       this.sanApp.detach()
//     }
//   }
//   render() {
//     if (this.props.san) {
//       return (
//         <div className={`wrap-${this.id}`} {...omit(this.props, ['san', 'children'])}></div>
//       )
//     } else {
//       return null
//     }
//   }
// }

function generateChildren(children, data) {
  let string = ''
  const childrens = Array.isArray(children) ? children : [children]
  childrens.forEach(child => {
    // TODO 补全类型支持
    if (typeof child === 'string' || typeof child === 'number') {
      string += child
    } else if (typeof child === 'function') {
      const value = child(data)
      console.log('value', child, value, data)
      string += generateChildren(value)
    } else if (React.isValidElement(child)) {
      string += ReactDOMServer.renderToString(child)//generateChildren(child.props.children, data)
    } else {
      Object.keys(child).forEach(key => {
        // if (key === 'default') {
        string += generateChildren(child[key].props.children, data)
        // }
      })
      // string += generateChildren(child.props.children, data)
    }
  })
  return string
}