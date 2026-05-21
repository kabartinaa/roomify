import { Navbar } from "../../components/Navbar";
import type { Route } from "./+types/home";
//import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  // tailwind set up 
  return (
    <div>
      <Navbar />
      {/* <h1 className="text-3xl text-indigo-700 font-extrabold">Home</h1> */}
    </div>
  
  )
}
