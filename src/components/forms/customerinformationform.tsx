import { CustomerEntity } from "@/data/orm/drizzle/mysql/schema";
import CustomerInformationTable from "../tables/customerinformationtable";
import { Group, GroupContent, GroupTitle } from "../uicustom/group";


interface GuestInformationFormProps {
    data: CustomerEntity[];
    setData: React.Dispatch<React.SetStateAction<CustomerEntity[]>>;
}

export default function CustomerInformationForm({
    data,
    setData
} : GuestInformationFormProps){
    return (
        <Group className="flex w-full">
            <GroupTitle>
            Guest Information
            </GroupTitle>
            <GroupContent>
                <CustomerInformationTable data={data} setData={setData} />
            </GroupContent>
        </Group>
    );
}