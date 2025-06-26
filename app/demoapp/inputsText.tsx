import type { Route } from "./+types/inputsText";
import Slot from '../components/slots/Slot';

// describe the route
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Inputs | Text" },
    { name: "description", content: "Demo of Text Inputs" },
  ];
}

export default function Component() {
  return (
    <div>inputs text</div>
  );
}
