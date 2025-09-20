import Customer from "@/core/models/domain/Customer";
import CustomerInformationTable from "../tables/customerinformationtable";
import { Group, GroupContent, GroupTitle } from "../../../lib/components/web/react/uicustom/group";


interface GuestInformationFormProps {
    data: Customer[];
    setData: React.Dispatch<React.SetStateAction<Customer[]>>;
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