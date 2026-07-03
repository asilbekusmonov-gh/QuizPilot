"use client";
import { useState, useEffect } from "react";
export default function TestPage() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    console.log("Effect running");
    setTimeout(() => {
      setLoading(false);
      console.log("Loading set to false");
    }, 1000);
  }, []);
  return loading ? <div>Loading...</div> : <div>Done!</div>;
}
