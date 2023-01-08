import { ContextData } from '../contextApi/ContextApi'
import React, { useContext } from 'react'

export default function index() {

  const data = useContext(ContextData)

  return (
    <div>index</div>
  )
}
