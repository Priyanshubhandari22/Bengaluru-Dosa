import { queryOptions } from "@tanstack/react-query";
import { getMenu } from "./menu.functions";

export const menuQuery = queryOptions({
  queryKey: ["menu"],
  queryFn: () => getMenu(),
  staleTime: 5 * 60_000,
});
