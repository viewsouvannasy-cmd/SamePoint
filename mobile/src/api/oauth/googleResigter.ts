import { useMutation } from "@tanstack/react-query";

import googleResigter from "./googleResigter-func";

const useGoogleResigter = () => {
  return useMutation({
    mutationFn: googleResigter,
  });
};

export default useGoogleResigter;
