import React from 'react'
import ReactDOM from 'react-dom/client'
import san, { defineComponent } from 'san'
import { omit } from 'lodash'
import { getId } from '../util';
import { SanInReact } from './SanInReact';
const ExprType = {
  STRING: 1,
  NUMBER: 2,
  BOOL: 3,
  ACCESSOR: 4,
  INTERP: 5,
  CALL: 6,
  TEXT: 7,
  BINARY: 8,
  UNARY: 9,
  TERTIARY: 10,
  ARRAY: 11,
  OBJECT: 12
};
const getProps = (data) => omit(data, ['react', 'id'])

const makeReactContainer = Component => {
  return class ReactInSan extends React.Component {
    // 为啥是 displayName，好像抛 error 的时候可以显示
    static displayName = `ReactInSan${Component.displayName || Component.name || "Component"}`;
    render() {
      return <Component {...this.props} />;
    }
  };
};

export const ReactContainer = (react) => {
  class ReactInSan extends san.Component {
    static template = `<div class="wrap-{{id}}"></div>`;
    initData() {
      return {
        id: getId()
      }
    }
    beforeCompile() {
      // console.log(this)
      // this.prototype.template = `<div class="wrap-{{id}}"><slot/></div>`;
      // console.log('template', this.template)
    }
    updated() {
      console.log('san update')
      this.render()
    }
    attached() {
      this.Component = makeReactContainer(react);
      this.render(true)
    }
    disposed() {
      console.log('disposed?')
      this.reactRoot.unmount()
    }
    render(isAttach) {
      const Component = this.Component
      const eventObj = {}
      for (const key in this.listeners) {
        eventObj[`on${key.replace(/^\S/, s => s.toUpperCase())}`] = (e) => this.listeners[key].forEach(({ fn }) => fn(e))
      }
      const myANodeInParentComponent = this.parentComponent.aNode.children[this.parentComponent.children.findIndex(v => v === this)]
      console.log('this', this)
      console.log('myANodeInParentComponent.children', myANodeInParentComponent.children)

      const allEvents = getAllEvents(myANodeInParentComponent.children)
      console.log('slotallEvents', allEvents)
      const slotEventObject = allEvents.reduce((acc, cur) => {
        acc[cur.expr.name.paths[0].value] = function (...args) {
          this.fire(cur.expr.name.paths[0].value, args) // fire 只能一个，所以多个参数只能用数组
        }
        return acc
      }, {})
      console.log('slotEventObject', slotEventObject)
      const slotComponent = san.defineComponent({
        template: `<template></template>`,
        aNode: {
          directives: {},
          props: [],
          events: [],
          children: myANodeInParentComponent.children,
        },
        components: this.parentComponent.components,
        // TODO 临时
        ...slotEventObject
      })
      const allProps = getAllProps(myANodeInParentComponent.children)
      const allExprKeys = getAllTextExprFirstKey(myANodeInParentComponent.children)
      console.log('allProps', allProps)
      console.log('allExprKeys', allExprKeys)
      const slotNodeProps = allProps
        .concat(allExprKeys.map(v => ({
          name: v,
          expr: {
            type: 4,
            paths: [{ type: 1, value: v }]
          }
        })))
        .map(v => ({
          ...v,
          expr: {
            ...v.expr,
            x: 1 // 全部双向绑定
          }
        }))
      const slotEvent=allEvents.map(v => ({
        ...v,
        name: v.expr.name.paths[0].value
      }))
      const slotANode = {
        directives: {},
        props: slotNodeProps,
        events: slotEvent,
        tagName: 'san-app',
        children: []
      }
      console.log('slotANode', slotANode)
      if (!this.SlotComponent) {
        this.SlotComponent = SanInReact(
          slotComponent,
          {
            owner: this.parentComponent,
            source: slotANode // TODO 临时
          }
        )
      }

      if (isAttach) {
        this.reactRoot = ReactDOM.createRoot(document.querySelector(`.wrap-${this.data.get('id')}`))
      }
      this.reactRoot.render(
        <Component
          {...getProps(this.data.get())}
          {...eventObj}
        >
          <this.SlotComponent />
        </Component>
      )
    }
  }
  return ReactInSan;
}

export function ReactInSan(react) {
  return ReactContainer(react)
}
function getAllEvents(childrens) {
  const events = []
  childrens.forEach(v => {
    if (v.events) {
      events.push(...v.events)
    }
    if (v.children) {
      events.push(...getAllEvents(v.children))
    }
  })
  return events
}
function getAllProps(childrens) {
  const props = []
  childrens.forEach(v => {
    if (v.props) {
      props.push(...v.props)
    }
    if (v.children) {
      props.push(...getAllProps(v.children))
    }
  })
  return props
}
function getAllTextExprFirstKey(childrens) {
  const textExpr = []
  childrens.forEach(v => {
    if (v.textExpr && v.textExpr.type === 7) {
      v.textExpr.segs.filter(v => v.type === 5).forEach(v => textExpr.push(v.expr.paths[0].value))
    }
    if (v.children) {
      textExpr.push(...getAllTextExprFirstKey(v.children))
    }
  })
  return textExpr
}