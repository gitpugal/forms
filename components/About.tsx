import React from "react";

const AboutSection = () => {
  return (
    <div className="px-4 md:px-32 h-fit z-50 w-full overflow-x-hidden ">
      <div className="w-full h-screen overflow-x-hidden pb-10 flex flex-col  md:flex-row items-center justify-center md:justify-between">
        <h2 className="font-extrabold text-left text-3xl md:text-8xl">
          About{" "}
          <span className="underline decoration-teal-400 underline-offset-8">
            Us
          </span>
          .
        </h2>
        <div className="hidden md:block absolute left-[55%] top-1/2 -translate-y-1/2 pt-16">
          <div className="relative overflow-hidden shadow-about shadow-teal-100 border-[18px] border-teal-100 my-10 rounded-[50px] w-full md:w-[70vw]">
            <div className="w-full border-[12px] border-teal-200 rounded-[28px] ">
              <img
                src="/formeditor.png"
                alt="form editor image"
                className="pt-7 p-5 border-[6px] border-teal-400 relative rounded-2xl bg-white mx-auto w-full"
              />
            </div>
            <div className="w-fit flex flex-row items-center justify-between gap-1 bg-transparent h-5 absolute top-7 left-12">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
          </div>
        </div>
        <img
          src="/formeditor.png"
          alt="form editor image"
          className="p-3 border-2 border-teal-400 relative rounded-2xl bg-white mx-auto mt-20 w-full md:hidden block"
        />
      </div>
      <div className="w-full my-20 flex  underline-offset-4 flex-col items-center justify-start">
        <p className="md:mt-4  w-full md:w-2/3 text-center dark:text-white/80 font-semibold italic text-teal-400/80 text-sm md:text-2xl md:leading-10">
          " Whether you are a small business or a large enterprise, our tool is
          designed to help you streamline your form creation process, integrate
          seamlessly with your favorite tools, and gain valuable insights
          through comprehensive analytics. "
        </p>
      </div>
    </div>
  );
};

export default AboutSection;
