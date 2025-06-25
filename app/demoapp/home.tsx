import type { Route } from "./+types/home";
import RivApp from "../components/RivApp";
import Slot from '../components/slots/Slot';

import Button from '../components/buttons/Button';



// describe the route
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Home" },
    { name: "description", content: "Welcome to Riv!" },
  ];
}

export default function Home() {

  return (
    <div>home</div>
  );
}
