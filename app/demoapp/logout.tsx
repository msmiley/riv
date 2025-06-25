import type { Route } from "./+types/logout";

// describe the route
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Logout" },
    { name: "description", content: "Logout from riv" },
  ];
}

export default function Logout({
  loaderData,
  actionData,
  params,
  matches,
}) {
  return (
    <div>
      logout
    </div>
  );
}
