import { Input } from "@/lib/components/web/react/ui/input";
import InputMask from "react-input-mask";

export function DateInput() {
  return (
    <InputMask
      mask="99/99/9999" // dd/mm/yyyy format
      placeholder="dd/mm/yyyy"
      maskChar={null} // Prevents placeholder underscores
    >
      {(inputProps: any) => <Input {...inputProps} />}
    </InputMask>
  );
}