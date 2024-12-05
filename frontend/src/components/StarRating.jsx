import React, { useState } from "react";
import { AiFillStar } from "react-icons/ai";

const StarRating = ({ rating, setRating }) => {
  const [hover, setHover] = useState(0);

  return (
    <div>
      {[...Array(5).keys()].map((_, index) => {
        index += 1;
        return (
          <button
            key={index}
            type="button"
            className="star-button"
            onClick={() => setRating(index)}
            onMouseEnter={() => setHover(index)}
            onMouseLeave={() => setHover(rating)}
            onDoubleClick={() => {
              setHover(0);
              setRating(0);
            }}
          >
            <AiFillStar
              color={index <= (hover || rating) ? "#0067FF" : "#ccc"}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating; 