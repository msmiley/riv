import type { Route } from "./+types/column";

// describe the route
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Column" },
    { name: "description", content: "Row Demo" },
  ];
}

export default function Component() {
  return (
    <div>
      column
    </div>
  );
}
