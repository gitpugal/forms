"use client";
import { useEffect, useState } from "react";

const Circle = ({ className }: { className: string }) => {
  return (
    <div className={` w-96 h-96 ${className} rounded-full absolute`}></div>
  );
};


const CircleBg = () => {
  const [direction, setDirection] = useState(-1);
  useEffect(() => {
    const interval = setInterval(() => {
      const circles = document.querySelectorAll(".circle");
      circles.forEach((circle: any) => {
        const randomTranslateX = Math.random() * 200 -   250;
        const randomTranslateY = Math.random() * 200 -   200;
        const randomScale = Math.random() * 2.5;
        const randomRotate = Math.random() * 360;

        circle.style.transform = `translate3d(${randomTranslateX}px, ${randomTranslateY}px, 0) scale(${randomScale}) rotate(${randomRotate}deg) `;
      });
      setDirection((prev) => prev * -1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  return (
    <div className="absolute top-0 left-0 w-full h-full gradient-bg">
      <div className="relative w-full h-full overflow-hidden ">
        <Circle className="circle  top-0 left-0 bg-blue-500" />
        <Circle className="circle  top-0 right-0 bg-teal-400" />
        <Circle className="circle  bg-orange-500" />
        <Circle className="circle  top-1/2 left-1/2 bg-violet-700" />
        <Circle className="circle  bottom-0 right-0 bg-teal-600" />
        <Circle className="circle  bottom-0 left-0 bg-teal-400" />
      </div>
    </div>
  );
};

export default CircleBg;
