// "use client";
// import React, { useEffect, useState } from "react";
// import Navbar from "./components/Navbar";

// const page = () => {
//   const [DarkMode, setDarkMode] = useState(false);
//   return (
//     <div
//       className={`w-full relative h-screen z-50 ${
//         DarkMode && "dark"
//       } bg-[#111]`}
//     >
//       <Navbar />
//       <button
//         onClick={() => setDarkMode((prev) => !prev)}
//         className="dark:bg-white dark:text-black bg-black text-white  rounded-full h-20 w-20  shadow-2xl font-semibold cursor-pointer absolute right-5 bottom-5"
//       >
//         {DarkMode ? "DRK" : "LHT"}
//       </button>
//       <div className="z-50 dark:text-white/50 text-black  w-full h-full flex flex-col items-center justify-center">
//         <p className="font-thin dark:text-white/50 text-black text-6xl ">
//           Form{" "}
//           <span className="font-serif font-semibold italic bg-gradient-to-tr from-blue-500 to-teal-500 bg-clip-text text-transparent relative right-2 text-7xl">
//             flow
//           </span>
//         </p>
//         <p className="mt-4 dark:text-white/50 text-black/70  font-normal text-lg">
//           Revolutionize Your Form-Building Experience and Redefine Web
//           Interaction
//         </p>
//         <button
//           onClick={() => alert("hi")}
//           className="bg-blue-600  px-5 py-2 rounded-md cursor-pointer text-white mt-5"
//         >
//           Get Started
//         </button>
//       </div>
//     </div>
//   );
// };

// export default page;
