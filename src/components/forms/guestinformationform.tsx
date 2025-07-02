import { Customer } from "@/data/orm/drizzle/mysql/schema";
import GuestInformationTable from "../tables/guestinformationtable";
import { Group, GroupContent, GroupTitle } from "../uicustom/group";


interface GuestInformationFormProps {
    data: Customer[];
    setData: React.Dispatch<React.SetStateAction<Customer[]>>;
}

export default function GuestInformationForm({
    data,
    setData
} : GuestInformationFormProps){
    return (
        <Group className="flex w-full">
            <GroupTitle>
            Guest Information
            </GroupTitle>
            <GroupContent>
                <GuestInformationTable data={data} setData={setData} />
            </GroupContent>
        </Group>
    );
}