import type { Route } from "./+types/profile";

// describe the route
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Profile" },
    { name: "description", content: "User Profile" },
  ];
}

export default function Component() {
  return (
    <div>
      profile
    </div>
  );
}
