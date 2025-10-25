// components/Testimonials.js
import React from "react";

const testimonials = [
  {
    name: "John Doe",
    feedback:
      "This form builder is amazing! It has streamlined our workflow and made form creation a breeze.",
    image: "/john-doe.jpg",
    position: "Product Manager at XYZ",
  },
  {
    name: "Jane Smith",
    feedback:
      "I love the integrations and the analytics. It helps me keep track of all the form responses easily.",
    image: "/jane-smith.jpg",
    position: "Marketing Head at ABC",
  },
  {
    name: "Robert Brown",
    feedback:
      "The customer support is fantastic. They helped me set up everything quickly.",
    image: "/robert-brown.jpg",
    position: "CTO at DEF",
  },
];

const TestimonialsSection = () => {
  return (
    <div className="w-full  py-16 px-4 md:px-32">
      <p className="text-center text-3xl md:text-5xl font-bold mb-10 bg-gradient-to-b from-black to-black/50 text-transparent bg-clip-text">
        Testimonials
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="bg-white border rounded-lg shadow-lg p-8 transition-transform transform hover:scale-105"
          >
            <div className="w-16 h-16 rounded-full bg-teal-500 mb-4 mx-auto flex items-center justify-center text-white text-2xl font-bold">
              {testimonial.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <p className="text-center text-gray-600 italic mb-4">
              "{testimonial.feedback}"
            </p>
            <h3 className="text-center text-lg font-semibold">
              {testimonial.name}
            </h3>
            <p className="text-center text-sm text-gray-500">
              {testimonial.position}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialsSection;
