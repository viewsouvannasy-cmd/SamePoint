import { useMutation } from "@tanstack/react-query";

import { logOut } from "./auth-func";

const useLogOut = () => {
  return useMutation({
    mutationFn: logOut,
  });
};

export { useLogOut };
