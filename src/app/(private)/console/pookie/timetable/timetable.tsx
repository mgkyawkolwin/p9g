'use client';

import { Loader } from "@/lib/components/web/react/uicustom/loader";
import React from "react";
import { ButtonCustom } from "@/lib/components/web/react/uicustom/buttoncustom";
import { InputCustom } from "@/lib/components/web/react/uicustom/inputcustom";
import { Group, GroupContent, GroupTitle } from "@/lib/components/web/react/uicustom/group";
import DatePicker from "react-datepicker";
import { CheckboxCustom } from "@/lib/components/web/react/uicustom/CheckboxCustom";

export default function TimeTable() {

    const [generateDate, setGenerateDate] = React.useState(new Date());
    const [generateStartTime, setGenerateStartTime] = React.useState(null);
    const [generateEndTime, setGenerateEndTime] = React.useState(null);
    const [filterDate, setFilterDate] = React.useState(new Date());
    const [onlyShowFree, setOnlyShowFree] = React.useState(false);
    const [isPending, setIsPending] = React.useState(false);


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
                                    selected={generateDate ? generateDate.getUTCDateTimeAsLocalDateTime() : null}
                                    onChange={(date: Date | null) => {
                                        setGenerateDate(date ? date.getLocalDateTimeAsUTCDateTime() : null);
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
                                    selected={generateStartTime ? generateStartTime.getUTCDateTimeAsLocalDateTime() : null}
                                    onChange={(date: Date | null) => {
                                        setGenerateStartTime(date ? date.getLocalDateTimeAsUTCDateTime() : null);
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
                                    selected={generateEndTime ? generateEndTime.getUTCDateTimeAsLocalDateTime() : null}
                                    onChange={(date: Date | null) => {
                                        setGenerateEndTime(date ? date.getLocalDateTimeAsUTCDateTime() : null);
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
                                <ButtonCustom>Generate</ButtonCustom>
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
                                    selected={filterDate ? filterDate.getUTCDateTimeAsLocalDateTime() : null}
                                    onChange={(date: Date | null) => {
                                        setFilterDate(date ? date.getLocalDateTimeAsUTCDateTime() : null);
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
            <section aria-label="Guest List" className="flex w-full h-fit items-center gap-x-4">
                <div className="flex">
                    <Group className="flex w-full">
                        <GroupTitle>
                            
                        </GroupTitle>
                        <GroupContent>
                            <div className="flex flex-col">
                                <div className="flex">
                                    <div>
                                        1 부T OFF<br/>(2050-10-02)<br/>Hole 1
                                    </div>
                                    <ButtonCustom>Print</ButtonCustom>
                                </div>
                                <div className="flex">
                                    <div>Table</div>
                                </div>
                                <div className="flex">
                                    <div> </div>
                                    <ButtonCustom>Toggle Busy</ButtonCustom>
                                    <ButtonCustom>[ ]</ButtonCustom>
                                </div>
                            </div>
                        </GroupContent>
                    </Group>
                </div>
            </section>
            {/* <section className="flex">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTitle></DialogTitle>
                    <DialogContent className="flex min-w-[90vw] p-8">
                        <CustomerChooseTable data={customerList} selectedCustomers={selectedCustomerList} setSelectedCustomers={setSelectedCustomerList} setOpen={setIsDialogOpen} />
                    </DialogContent>
                </Dialog>
            </section> */}
        </div>


    );
}