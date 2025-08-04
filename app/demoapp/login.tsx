import type { Route } from "./+types/login";
import CenteredColumn from "~/components/layouts/CenteredColumn";
import Column from "~/components/containers/Column";

// describe the route
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login" },
    { name: "description", content: "Login to riv" },
  ];
}

export default function Component() {
  return (
    <Column>
      <CenteredColumn>
        Login
      </CenteredColumn>
    </Column>
  );
}
