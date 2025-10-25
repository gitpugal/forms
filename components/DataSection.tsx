"use client";
import React, { useEffect, useState } from "react";
import { setdata } from "../app/services/FirebaseServices";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebaseconfig";

const Datasection: React.FC<any> = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const headerRef = ref(database, "form");

    const unsubscribe = onValue(headerRef, (snapshot) => {
      const data = snapshot.val();
      setData(data);
    });

    return () => unsubscribe();
  }, []);

  const saveToFireBase = () => {
    // setdata("" + Math.round(Math.random() * 100));
  };
  return (
    <div>
      <p>{JSON.stringify(data) || "Loading..."}</p>
      <button onClick={saveToFireBase}>save data</button>
    </div>
  );
};

export default Datasection;
