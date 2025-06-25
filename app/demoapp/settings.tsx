import type { Route } from "./+types/settings";

// describe the route
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Settings" },
    { name: "description", content: "Modify your settings" },
  ];
}

export default function Settings({
  loaderData,
  actionData,
  params,
  matches,
}) {
  return (
    <div>
      settings
    </div>
  );
}
