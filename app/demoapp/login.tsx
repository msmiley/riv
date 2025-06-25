import type { Route } from "./+types/login";

// describe the route
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login" },
    { name: "description", content: "Login to riv" },
  ];
}

export default function Login({
  loaderData,
  actionData,
  params,
  matches,
}) {
  return (
    <div>
      loginnnn
      <div>
        test
      </div>
    </div>
  );
}
