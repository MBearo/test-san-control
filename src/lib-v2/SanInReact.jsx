import React from 'react'
import { getId, firstLetterDowncase } from '../util'
import { omit, merge, forOwn } from 'lodash'
import { ReactInSan } from './ReactInSan'
/**
 * props
 * event
 * 双向绑定
 */

function Container (SanComponent) {
  return class Container extends React.Component {
    constructor () {
      super()
      this.id = getId()
    }

    componentDidMount () {
      this.sanApp = new SanComponent()
      console.log('this.sanApp', this.sanApp)
      console.log('props', this.props)
      // TODO -> attach-el 这一层dom可以去掉，不过可能有隐患
      const node = document.querySelector(`.wrap-${this.id}`)
      // const parentNode = node.parentNode
      this.sanApp.data.assign(getData(this))

      const eventObj = getEvent(this)
      Object.keys(eventObj).forEach(key => {
        this.sanApp.on(key, eventObj[key])
      })
      if (this.props.sModels) {
        forOwn(this.props.sModels, (value, key) => {
          this.sanApp.watch(key, value[1])
        })
      }
      // ? 开发测试用
      // if (React.isValidElement(this.props.children)) {
      //   const SanChild = ReactInSan(this.props.children)
      //   const sanChild = new SanChild()
      //   console.log('sanChild', sanChild)
      // }
      // console.log('empty', JSON.stringify(this.sanApp.aNode))
      this.sanApp.attach(node)
      this.sanApp.children[1].aNode.children.push({
        children: [{
          textExpr: {
            type: 1,
            value: 'llll'
          }
        }],
        directives: {},
        events: [],
        props: [{
          expr: {
            type: 1,
            value: 'name234'
          },
          name: 'slot'
        }],
        tagName: 'a'
      })
      this.sanApp._initSourceSlots()
      // ? <- attach-el
      // parentNode.replaceChild(parentNode.children[1].children[0], parentNode.children[1])
    }

    componentDidUpdate () {
      this.sanApp.data.assign(getData(this))
    }

    render () {
      if (SanComponent) {
        return (
          <div className={`wrap-${this.id}`}></div>
        )
      } else {
        return null
      }
    }
  }
}

export function SanInReact (SanComponent) {
  if (!SanComponent) {
    console.warn('Component must be passed in SanInReact!')
    return
  }
  return Container(SanComponent)
}
// 事件也一起传进来，不过滤
function getData (self) {
  const obj = {}
  if (self.props.sModels) {
    forOwn(self.props.sModels, (value, key) => {
      obj[key] = value[0]
    })
  }
  return { ...omit(self.props, ['sModels', 'children']), ...obj }
}
function getEvent (self) {
  const eventObj = {}
  Object.keys(self.props).forEach(key => {
    if (key.startsWith('on')) {
      eventObj[firstLetterDowncase(key.slice(2))] = self.props[key]
    }
  })
  return eventObj
}
function setEvent (self, sanApp) {
  const eventObj = getEvent(self)
  Object.keys(eventObj).forEach(key => {
    sanApp.on(key, eventObj[key])
  })
}
