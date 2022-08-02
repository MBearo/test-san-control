import ReactDOM from 'react-dom/client'
import React, { useState } from 'react'
import san from 'san'
import { ReactInSan } from '../lib-v2/ReactInSan'

const ReactApp = ({ children }) => {
    return (
        <div>children:{children}</div>
    )
}
const ReactAppInSan= ReactInSan(ReactApp)
const SanApp = san.defineComponent({
    template:/*html*/`
        <div>
            <react-app-in-san>
                <input value="{{value}}"/>
                <input value="{{value}}"/>
            </react-app-in-san>
            <div>{{value}}</div>
            <button on-click="count">+1</button>
        </div>
    `,
    initData() {
        return {
            value: 'defaultValue'
        }
    },
    // updated(){
    //     console.log('update')
    // },
    components:{
        'react-app-in-san': ReactAppInSan
    },
    count(){
        this.data.set('value', this.data.get('value') + 1)
    }
})
const sanApp=new SanApp()
sanApp.attach(document.querySelector('#root'))
const ReactApp2=({children})=>{
    return(
        <ReactApp>children</ReactApp>
    )
}