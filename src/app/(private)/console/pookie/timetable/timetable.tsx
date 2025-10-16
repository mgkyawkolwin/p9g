'use client';

import { Loader } from "@/lib/components/web/react/uicustom/loader";
import React from "react";
import { ButtonCustom } from "@/lib/components/web/react/uicustom/buttoncustom";
import { InputCustom } from "@/lib/components/web/react/uicustom/inputcustom";
import { Group, GroupContent, GroupTitle } from "@/lib/components/web/react/uicustom/group";
import DatePicker from "react-datepicker";
import { CheckboxCustom } from "@/lib/components/web/react/uicustom/CheckboxCustom";
import PookieTimeTable from "@/core/models/domain/PookieTimeTable";
import { generateTimeTable, getTimeTable, updateTimeTable } from "./actions";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import SimpleDataTable from "@/lib/components/web/react/uicustom/simpledatatable";
import { Dialog, DialogContent, DialogTitle } from "@/lib/components/web/react/ui/dialog";



export default function TimeTable() {


    const columns: ColumnDef<PookieTimeTable>[] = [
        {
            accessorKey: "time",
            header: "Time",
            accessorFn: (row, index) => {
                return new Date(row.time).toUTCShortTimeString();
            },
            cell: row => <div onClick={() => {
                const item = timeTable.find(tt => tt.id === row.row.original.id);
                setSelectedItem(item);
                setIsDialogOpen(true);
            }}>{String(row.getValue())}</div>
        },
        {
            accessorKey: "isBusy",
            header: "Busy?",
            cell: row => (<CheckboxCustom checked={Boolean(row.getValue())} onCheckedChange={checked => {
                const changedItem = timeTable.find(tt => tt.id === row.row.original.id);
                changedItem.isBusy = Boolean(checked);
                const therest = timeTable.filter(tt => tt.id !== row.row.original.id);
                setTimeTable([...therest, changedItem]);
                updateTimeTable(changedItem).then(response => {
                    if (response.message) {
                        toast(response.message);
                    }
                });
            }} />)
        },
        {
            accessorKey: "xxx",
            header: 'Rooms',
            accessorFn: (row, index) => {
                return row.rooms;
            }
        }
    ];

    const [drawDate, setDrawDate] = React.useState<Date>(null);
    const [startDate, setStartDate] = React.useState<Date>(null);
    const [endDate, setEndDate] = React.useState<Date>(null);
    const [filterDate, setFilterDate] = React.useState(new Date());
    const [onlyShowFree, setOnlyShowFree] = React.useState(false);
    const [isPending, setIsPending] = React.useState(false);
    const [timeTable, setTimeTable] = React.useState<PookieTimeTable[]>([]);
    const [hole1, setHole1] = React.useState<PookieTimeTable[]>([]);
    const [hole5, setHole5] = React.useState<PookieTimeTable[]>([]);
    const [hole10, setHole10] = React.useState<PookieTimeTable[]>([]);
    const [hole15, setHole15] = React.useState<PookieTimeTable[]>([]);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [selectedItem, setSelectedItem] = React.useState<PookieTimeTable>(null);

    React.useEffect(() => {
        const hole1 = (timeTable || []).filter(tt => (tt.hole === 'Hole 1')).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
        setHole1(
            hole1
        );
        setHole5(
            (timeTable || []).filter(tt => (tt.hole === 'Hole 5')).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
        );
        setHole10(
            (timeTable || []).filter(tt => (tt.hole === 'Hole 10')).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
        );
        setHole15(
            (timeTable || []).filter(tt => (tt.hole === 'Hole 15')).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
        );
    },[timeTable]);

    return (

        <div className="flex flex-1 flex-col gap-y-4">
            <Loader isLoading={isPending} />
            <section aria-label="Generate Time Table" className="flex w-full h-fit items-center gap-x-4">
                <Group className="flex w-full">
                    <GroupTitle>
                        Generate Time Table
                    </GroupTitle>
                    <GroupContent>
                        <div className="flex flex-col gap-y-2">
                            <div className="flex place-content-between">
                                <div>Date</div>
                                <div>
                                    <DatePicker
                                        selected={drawDate ? drawDate.getUTCDateTimeAsLocalDateTime() : null}
                                        onChange={(date: Date | null) => {
                                            setDrawDate(date ? date.getLocalDateTimeAsUTCDateTime() : null);
                                        }}
                                        dateFormat="yyyy-MM-dd"
                                        customInput={<InputCustom size="md" />}
                                        placeholderText="yyyy-mm-dd"
                                        isClearable={true}
                                        showIcon
                                    />
                                </div>
                            </div>
                            <div className="flex place-content-between">
                                <div>Start Time</div>
                                <div>
                                    <DatePicker
                                        selected={startDate ? startDate.getUTCDateTimeAsLocalDateTime() : null}
                                        onChange={(date: Date | null) => {
                                            setStartDate(date ? date.getLocalDateTimeAsUTCDateTime() : null);
                                        }}
                                        customInput={<InputCustom size="md" />}
                                        placeholderText="--:-- --"
                                        showTimeSelect
                                        showTimeSelectOnly
                                        timeIntervals={5}
                                        timeCaption="Time"
                                        dateFormat="hh:mm aa"
                                        isClearable={true}
                                        showIcon
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <div>End Time</div>
                                <div>
                                    <DatePicker
                                        selected={endDate ? endDate.getUTCDateTimeAsLocalDateTime() : null}
                                        onChange={(date: Date | null) => {
                                            setEndDate(date ? date.getLocalDateTimeAsUTCDateTime() : null);
                                        }}
                                        customInput={<InputCustom size="md" />}
                                        placeholderText="--:-- --"
                                        showTimeSelect
                                        showTimeSelectOnly
                                        timeIntervals={5}
                                        timeCaption="Time"
                                        dateFormat="hh:mm aa"
                                        isClearable={true}
                                        showIcon
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <div> </div>
                                <ButtonCustom onClick={() => {
                                    generateTimeTable(drawDate, startDate, endDate).then((res) => {
                                        if (res.message) {
                                            toast(res.message);
                                        }
                                        if (!res.error && res.data) {
                                            setTimeTable(res.data.timeTable ? res.data.timeTable : []);
                                        }
                                    });
                                }}>Generate</ButtonCustom>
                            </div>
                        </div>
                    </GroupContent>
                </Group>
            </section>
            <section aria-label="Guest List" className="flex w-full h-fit items-center gap-x-4">
                <Group className="flex w-full">
                    <GroupTitle>
                        Filter
                    </GroupTitle>
                    <GroupContent>
                        <div className="flex flex-col gap-y-2">
                            <div className="flex justify-between">
                                <div>Date</div>
                                <div>
                                    <DatePicker
                                        selected={drawDate ? drawDate.getUTCDateTimeAsLocalDateTime() : null}
                                        onChange={(date: Date | null) => {
                                            setDrawDate(date ? date.getLocalDateTimeAsUTCDateTime() : null);
                                            if (date) {
                                                getTimeTable(date.getLocalDateTimeAsUTCDateTime()).then((res) => {
                                                    if (res.message) {
                                                        toast(res.message);
                                                    }
                                                    if (!res.error && res.data) {
                                                        setTimeTable(res.data.timeTable ? res.data.timeTable : []);
                                                    }
                                                });
                                            }

                                        }}
                                        dateFormat="yyyy-MM-dd"
                                        customInput={<InputCustom size="md" />} // Uses shadcn/ui Input
                                        placeholderText="yyyy-mm-dd"
                                        isClearable={true}
                                        showIcon
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <CheckboxCustom>Only Show Free</CheckboxCustom>
                                <div></div>
                            </div>
                            <div className="flex justify-between">
                                <div> </div>
                                <ButtonCustom>Reset</ButtonCustom>
                            </div>
                        </div>
                    </GroupContent>
                </Group>
            </section>
            <div className="flex gap-x-2">
                <ButtonCustom>Print All</ButtonCustom>
                <ButtonCustom>Delete Selection</ButtonCustom>
            </div>
            <section aria-label="Guest List" className="flex w-full h-fit place-content-between">
                <div className="flex">
                    <Group className="flex w-full">
                        <GroupTitle>

                        </GroupTitle>
                        <GroupContent>
                            <div className="flex flex-col gap-2">
                                <div className="flex w-full place-content-between">
                                    <div>
                                        1 부T OFF<br />({drawDate?.toISOFormatDateString()})<br />Hole 1
                                    </div>
                                    <div>
                                        <ButtonCustom>Print</ButtonCustom>
                                    </div>
                                </div>
                                <div className="flex max-h-[500px] min-w-[20vw] max-w-[20vw] overflow-auto">
                                    <SimpleDataTable columns={columns} data={hole1} />
                                </div>
                                <div className="flex gap-x-2">
                                    <ButtonCustom>Toggle Busy</ButtonCustom>
                                    <ButtonCustom>[ ]</ButtonCustom>
                                </div>
                            </div>
                        </GroupContent>
                    </Group>
                </div>
                <div className="flex">
                    <Group className="flex w-full">
                        <GroupTitle>

                        </GroupTitle>
                        <GroupContent>
                            <div className="flex flex-col gap-2">
                                <div className="flex place-content-between">
                                    <div>
                                        1 부T OFF<br />({drawDate?.toISOFormatDateString()})<br />Hole 5
                                    </div>
                                    <div>
                                        <ButtonCustom>Print</ButtonCustom>
                                    </div>
                                </div>
                                <div className="flex max-h-[500px] min-w-[20vw] max-w-[20vw] overflow-auto">
                                    <SimpleDataTable columns={columns} data={hole5} />
                                </div>
                                <div className="flex gap-x-2">
                                    <ButtonCustom>Toggle Busy</ButtonCustom>
                                    <ButtonCustom>[ ]</ButtonCustom>
                                </div>
                            </div>
                        </GroupContent>
                    </Group>
                </div>
                <div className="flex">
                    <Group className="flex w-full">
                        <GroupTitle>

                        </GroupTitle>
                        <GroupContent>
                            <div className="flex flex-col gap-2">
                                <div className="flex place-content-between">
                                    <div>
                                        1 부T OFF<br />({drawDate?.toISOFormatDateString()})<br />Hole 10
                                    </div>
                                    <div>
                                        <ButtonCustom>Print</ButtonCustom>
                                    </div>
                                </div>
                                <div className="flex max-h-[500px] min-w-[20vw] max-w-[20vw] overflow-auto">
                                    <SimpleDataTable columns={columns} data={hole10} />
                                </div>
                                <div className="flex gap-x-2">
                                    <ButtonCustom>Toggle Busy</ButtonCustom>
                                    <ButtonCustom>[ ]</ButtonCustom>
                                </div>
                            </div>
                        </GroupContent>
                    </Group>
                </div>
                <div className="flex">
                    <Group className="flex w-full">
                        <GroupTitle>

                        </GroupTitle>
                        <GroupContent>
                            <div className="flex flex-col gap-2">
                                <div className="flex place-content-between">
                                    <div>
                                        1 부T OFF<br />({drawDate?.toISOFormatDateString()})<br />Hole 15
                                    </div>
                                    <div>
                                        <ButtonCustom>Print</ButtonCustom>
                                    </div>
                                </div>
                                <div className="flex max-h-[500px] min-w-[20vw] max-w-[20vw] overflow-auto">
                                    <SimpleDataTable columns={columns} data={hole15} />
                                </div>
                                <div className="flex gap-x-2">
                                    <ButtonCustom>Toggle Busy</ButtonCustom>
                                    <ButtonCustom>[ ]</ButtonCustom>
                                </div>
                            </div>
                        </GroupContent>
                    </Group>
                </div>
            </section>
            <section className="flex">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTitle>
                        
                    </DialogTitle>
                    <DialogContent className="flex p-8">
                        <div className="flex flex-col gap-4">
                            <div>
                                <div>Hole</div>
                                <div>{selectedItem ? selectedItem.hole : ""}</div>
                            </div>
                            <div>
                                <div>Date: </div>
                                <div>{selectedItem ? new Date(selectedItem.time).toISOString() : ""}</div>
                            </div>
                            <div>
                                <div>Time: </div>
                                <div>{selectedItem ? new Date(selectedItem.time).toUTCShortTimeString() : ""}</div>
                            </div>
                            <div>
                                <div>Is Busy</div>
                                <div><CheckboxCustom /></div>
                            </div>
                            <div>
                                <div>Rooms</div>
                                <div><InputCustom /></div>
                            </div>
                            <div>
                                <div className="flex gap-4">
                                    <ButtonCustom >Save</ButtonCustom>
                                    <ButtonCustom >Print</ButtonCustom>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </section>
        </div>


    );
}