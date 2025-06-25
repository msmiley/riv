import type { Route } from "./+types/row";

// describe the route
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Row" },
    { name: "description", content: "Row Demo" },
  ];
}

export default function Row({
  loaderData,
  actionData,
  params,
  matches,
}) {
  return (
    <div>
      row
    </div>
  );
}
