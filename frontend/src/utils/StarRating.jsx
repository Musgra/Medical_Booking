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
            className={`${
              index <= (hover || rating) ? "text-[#0067FF]" : "text-gray-300"
            }`}
            onClick={() => setRating(index)}
            onMouseEnter={() => setHover(index)}
            onMouseLeave={() => setHover(rating)}
            onDoubleClick={() => {
              setHover(0);
              setRating(0);
            }}
          >
            <span>
              <AiFillStar
                color={index <= (hover || rating) ? "#0067FF" : "gray"}
              />
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
