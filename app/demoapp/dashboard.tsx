import type { Route } from "./+types/dashboard";
import Slot from '../components/slots/Slot';

// describe the route
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard" },
    { name: "description", content: "Welcome to Riv!" },
  ];
}

export default function Component() {
  return (
    <div>dashboard</div>
  );
}
