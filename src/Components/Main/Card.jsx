import React, { useContext } from 'react'
import { Context } from '../../Context/Context';


const Card = ({cardText, index}) => {
  const { setInput } =
    useContext(Context);
  return (
    <div className={`card card${index}`} onClick={() => {
      setInput(cardText)
    }}>
            <p>{cardText}</p>
          </div>
  )
}

export default Card