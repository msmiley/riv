import type { Route } from "./+types/inputsColor";
import Slot from '../components/slots/Slot';

// describe the route
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Inputs | Color" },
    { name: "description", content: "Demo of Color Inputs" },
  ];
}

export default function Component() {
  return (
    <div>inputs color</div>
  );
}
