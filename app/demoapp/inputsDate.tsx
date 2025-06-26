import type { Route } from "./+types/inputsDate";
import Slot from '../components/slots/Slot';

// describe the route
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Inputs | Date" },
    { name: "description", content: "Demo of Date Inputs" },
  ];
}

export default function Component() {
  return (
    <div>inputs date</div>
  );
}
