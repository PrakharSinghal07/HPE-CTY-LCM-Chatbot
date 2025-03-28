import React, { useContext } from 'react'
import { Context } from '../../Context/Context';


const Card = ({cardText, cardImage}) => {
  const { setInput } =
    useContext(Context);
  return (
    <div className="card" onClick={() => {
      setInput(cardText)
    }}>
            <p>{cardText}</p>
            <img src={cardImage} alt="" />
          </div>
  )
}

export default Card