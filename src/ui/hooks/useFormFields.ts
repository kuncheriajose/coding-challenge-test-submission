import React, { useCallback, useRef } from "react";

export default function useFormFields<T extends Record<string, string>>(
  initialState: T
) {
  const [values, setValues] = React.useState<T>(initialState);
  const initialStateRef = useRef(initialState);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setValues((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const reset = useCallback(() => {
    setValues({ ...initialStateRef.current });
  }, []);

  return { values, onChange, setValues, reset };
}
