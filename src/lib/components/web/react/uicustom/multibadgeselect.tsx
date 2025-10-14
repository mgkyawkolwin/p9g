// import { useSlotRecipe } from "@chakra-ui/react";
import { Select } from "chakra-react-select";

const MultiBadgeSelect = ({items}) => {
//   const tableStyles = useSlotRecipe({ key: "table" })({ size: "sm" });


  return (
    <Select
      isMulti
      name="countries"
      options={items}
      placeholder="Select some countries..."
      closeMenuOnSelect={false}
      focusRingColor={"blue"}
      chakraStyles={{
        control: (provided, state) => ({
          ...provided,
          borderBottomRadius: state.menuIsOpen ? "none" : "sm",
        }),
        groupHeading: (provided) => ({
          ...provided,
          fontSize: "12pt",//tableStyles.header.fontSize,
          color: "green",//tableStyles.header.color,
          fontWeight: "bold",//tableStyles.header.fontWeight,
          letterSpacing: "",//tableStyles.header.letterSpacing,
          px: "0.8rem",
        }),
        menu: (provided) => ({
          ...provided,
          my: 0,
          borderTopRadius: 0,
          borderBottomRadius: "md",
          borderWidth: "1px",
          borderColor: "red",
          shadow: `0 0 0 1px green}`,
        }),
        menuList: (provided) => ({
          ...provided,
          borderTopRadius: 0,
          borderWidth: 0,
        }),
      }}
    />
  );
};

export default MultiBadgeSelect;
