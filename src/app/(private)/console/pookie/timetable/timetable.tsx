'use client';

import { Loader } from "@/lib/components/web/react/uicustom/loader";
import React from "react";
import { ButtonCustom } from "@/lib/components/web/react/uicustom/buttoncustom";
import { InputCustom } from "@/lib/components/web/react/uicustom/inputcustom";
import { Group, GroupContent, GroupTitle } from "@/lib/components/web/react/uicustom/group";
import DatePicker from "react-datepicker";
import { CheckboxCustom } from "@/lib/components/web/react/uicustom/CheckboxCustom";
import PookieTimeTable from "@/core/models/domain/PookieTimeTable";
import { generateTimeTable, getRoomNames, getTimeTable, updateTimeTable } from "./actions";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import SimpleDataTable from "@/lib/components/web/react/uicustom/simpledatatable";
import { Dialog, DialogContent, DialogTitle } from "@/lib/components/web/react/ui/dialog";
import MultiBadgeSelect from "@/lib/components/web/react/uicustom/multibadgeselect";
import "react-datepicker/dist/react-datepicker.css";
import * as XSLX from "xlsx";
import { SelectCustom } from "@/lib/components/web/react/uicustom/selectcustom";
import { SelectListForm } from "@/core/constants";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useGlobalContext } from "@/app/contexts/globalcontext";


export default function TimeTable() {


    const columns: ColumnDef<PookieTimeTable>[] = [
        {
            accessorKey: "isBusy",
            header: "Busy",
            maxSize: 30,
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
            accessorKey: "time",
            header: "Time",
            maxSize: 70,
            accessorFn: (row, index) => {
                return new Date(row.time).toISOShortTimeAMPMString();
            },
            cell: row => <div onClick={() => {
                const item = timeTable.find(tt => tt.id === row.row.original.id);
                setSelectedItem(item);
                setIsDialogOpen(true);
            }}>{String(row.getValue())}</div>
        },
        {
            accessorKey: "noOfPeople",
            header: "Pax"
        },
        {
            accessorKey: "rooms",
            header: 'Rooms',
            cell: row => <div onClick={() => {
                const item = timeTable.find(tt => tt.id === row.row.original.id);
                setSelectedItem(item);
                setIsDialogOpen(true);
            }}>{String(row.getValue())}&nbsp;</div>
        }
    ];

    const { location } = useGlobalContext();

    const [drawDate, setDrawDate] = React.useState<Date>(null);
    const [endDate, setEndDate] = React.useState<Date>(null);
    const [hole1, setHole1] = React.useState<PookieTimeTable[]>([]);
    const [hole5, setHole5] = React.useState<PookieTimeTable[]>([]);
    const [hole10, setHole10] = React.useState<PookieTimeTable[]>([]);
    const [hole15, setHole15] = React.useState<PookieTimeTable[]>([]);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [isPending, setIsPending] = React.useState(false);
    const [onlyShowFree, setOnlyShowFree] = React.useState(false);
    const [roomNames, setRoomNames] = React.useState<string[]>([]);
    const [selectedItem, setSelectedItem] = React.useState<PookieTimeTable>(null);
    const [startDate, setStartDate] = React.useState<Date>(null);
    const [timeTable, setTimeTable] = React.useState<PookieTimeTable[]>([]);


    const handlePrint = () => {

        const win = window.open('', 'Print', `width=${screen.availWidth},height=${screen.availHeight},left=0,top=0`);
        if (win) {
            win.document.open();
            win.document.writeln(
                `<html><style>@media print{ @page {margin:0;}}</style>` +
                `<body style="padding:0.5in;font-size:10pt;">` +
                `<div style="display:block;width:100%;text-align:center;font-size:12pt;text-weight:bold;">티업표 배정되었습니다!</div><br/><br/>` +
                `<div style="display:flex;width:100%;align-items:center;justify-content:center;"><div style="font-size:12pt;">Date: ${new Date(selectedItem.date).toISOFormatDateString()}<br/>Time: ${new Date(selectedItem.time).toISOShortTimeAMPMString()}<br/> Hole: ${selectedItem.hole}<br/>Rooms:${selectedItem.rooms}</div></div><br/><br/>` +
                `<div style="display:block;width:100%;text-align:center;font-size:12pt;text-weight:bold;">내일 오전 티업하실때 티업표를 스탓터 직원한테 주시고 티업 시작하시면 됩니다. 즐거운 라운딩 되시길 바랍니다. 감사합니다. </div><br/><br/>` +
                `</body></html>`
            );
            win.document.close();
            win.focus();
            win.onload = function () {
                win.print();
                win.close();
            }
        }
    };

    const handleDownloadExcel = async (data: PookieTimeTable[]) => {
        // Filter and sort data as before
        const hole1 = data.filter(tt => tt.hole === '1').sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
        const hole5 = data.filter(tt => (tt.hole === '5' || tt.hole === '6')).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
        const hole10 = data.filter(tt => tt.hole === '10').sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
        const hole15 = data.filter(tt => tt.hole === '15').sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Timetable');

        // Set column widths
        worksheet.columns = [
            { key: 'col1', width: 10 },  // width in “characters” (not exactly “wch” but similar)
            { key: 'col2', width: 30 },
            { key: 'col3', width: 10 },
            { key: 'col4', width: 30 },
        ];

        // Row 1: merge cells A1‐B1, C1‐D1
        worksheet.mergeCells('A1:B1');
        worksheet.mergeCells('C1:D1');
        const row1 = worksheet.getRow(1);
        row1.getCell(1).value = `T-OFF TIMETABLE (${new Date(hole1[0].date).toISOString().substring(0, 10)})`;
        row1.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF88AAFF' } };
        row1.getCell(1).alignment = {horizontal: "center"};
        row1.getCell(3).value = `T-OFF TIMETABLE (${new Date(hole1[0].date).toISOString().substring(0, 10)})`;
        row1.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF88AAFF' } };
        row1.getCell(3).alignment = {horizontal: "center"};

        // Row 2: merge A2‐B2 and C2‐D2
        // worksheet.mergeCells('A2:B2');
        // worksheet.mergeCells('C2:D2');
        const row2 = worksheet.getRow(2);
        row2.getCell(2).value = 'HOLE-1';
        row2.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF99BBFF' } };
        row2.getCell(2).alignment = {horizontal: "center"};
        row2.getCell(4).value = location === 'MIDA' ? 'HOLE-5' : 'HOLE-6';
        row2.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF99BBFF' } };
        row2.getCell(4).alignment = {horizontal: "center"};

        // Then the data rows for holes 1 & 5
        let currentRowNumber = 3;
        for (let i = 0; i < hole1.length; i++) {
            const row = worksheet.getRow(currentRowNumber);
            const cellA = row.getCell(1);
            const cellB = row.getCell(2);
            const cellC = row.getCell(3);
            const cellD = row.getCell(4);

            cellA.value = new Date(hole1[i].time).toISOShortTimeAMPMString();
            cellB.value = hole1[i].rooms;
            cellC.value = new Date(hole5[i].time).toISOShortTimeAMPMString();
            cellD.value = hole5[i].rooms;

            // Apply red fill if rooms is empty (assuming empty string or null/undefined)
            if (!hole1[i].rooms) {
                cellA.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                cellB.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
            }
            if (!hole5[i].rooms) {
                cellC.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                cellD.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
            }

            currentRowNumber++;
        }

        // Blank row then holes 10 & 15
        currentRowNumber++;
        worksheet.mergeCells(`A${currentRowNumber}:B${currentRowNumber}`);
        worksheet.mergeCells(`C${currentRowNumber}:D${currentRowNumber}`);
        const header = worksheet.getRow(currentRowNumber);
        header.getCell(1).value = `T-OFF TIMETABLE (${new Date(hole1[0].date).toISOString().substring(0, 10)})`;
        header.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF88AAFF' } };
        header.getCell(1).alignment = {horizontal: "center"};
        header.getCell(3).value = `T-OFF TIMETABLE (${new Date(hole1[0].date).toISOString().substring(0, 10)})`;
        header.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF88AAFF' } };
        header.getCell(3).alignment = {horizontal: "center"};
        currentRowNumber++;
        // header row for hole10 & 15
        const headerRow2 = worksheet.getRow(currentRowNumber);
        headerRow2.getCell(2).value = 'HOLE-10';
        headerRow2.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF99BBFF' } };
        headerRow2.getCell(2).alignment = {horizontal: "center"};
        headerRow2.getCell(4).value = 'HOLE-15';
        headerRow2.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF99BBFF' } };
        headerRow2.getCell(4).alignment = {horizontal: "center"};
        currentRowNumber++;

        for (let i = 0; i < hole10.length; i++) {
            const row = worksheet.getRow(currentRowNumber);
            const cellA = row.getCell(1);
            const cellB = row.getCell(2);
            const cellC = row.getCell(3);
            const cellD = row.getCell(4);

            cellA.value = new Date(hole10[i].time).toISOShortTimeAMPMString();
            cellB.value = hole10[i].rooms;
            cellC.value = new Date(hole15[i].time).toISOShortTimeAMPMString();
            cellD.value = hole15[i].rooms;

            if (!hole10[i].rooms) {
                cellA.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                cellB.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
            }
            if (!hole15[i].rooms) {
                cellC.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                cellD.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
            }

            currentRowNumber++;
        }

        for (let i = 0; i < currentRowNumber; i++) {
            const row = worksheet.getRow(i);
            const cellA = row.getCell(1);
            cellA.border = {
                top:    { style: "thin" , color: { argb: "FF000000" } },
                left:   { style: "thin" , color: { argb: "FF000000" } },
                bottom: { style: "thin" , color: { argb: "FF000000" } },
                right:  { style: "thin" , color: { argb: "FF000000" } }
            };
            const cellB = row.getCell(2);
            cellB.border = {
                top:    { style: "thin" , color: { argb: "FF000000" } },
                left:   { style: "thin" , color: { argb: "FF000000" } },
                bottom: { style: "thin" , color: { argb: "FF000000" } },
                right:  { style: "thin" , color: { argb: "FF000000" } }
            };
            const cellC = row.getCell(3);
            cellC.border = {
                top:    { style: "thin" , color: { argb: "FF000000" } },
                left:   { style: "thin" , color: { argb: "FF000000" } },
                bottom: { style: "thin" , color: { argb: "FF000000" } },
                right:  { style: "thin" , color: { argb: "FF000000" } }
            };
            const cellD = row.getCell(4);
            cellD.border = {
                top:    { style: "thin" , color: { argb: "FF000000" } },
                left:   { style: "thin" , color: { argb: "FF000000" } },
                bottom: { style: "thin" , color: { argb: "FF000000" } },
                right:  { style: "thin" , color: { argb: "FF000000" } }
            };
        }


        // Finally, trigger download / write file. For browser + React you’ll often use workbook.xlsx.writeBuffer() then save via FileSaver.
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `Timetable_${new Date().toISOString().substring(0, 10)}.xlsx`);
        // const filename = `Timetable_${new Date().toISOString().substring(0, 10)}.xlsx`;
        // await workbook.xlsx.writeFile(filename);
    };

    // const handleDownloadExcel = (data: PookieTimeTable[]) => {
    //     const hole1 = data.filter(tt => (tt.hole === '1')).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    //     const hole5 = data.filter(tt => (tt.hole === '5')).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    //     const hole10 = data.filter(tt => (tt.hole === '10')).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    //     const hole15 = data.filter(tt => (tt.hole === '15')).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    //     const aoa = [];
    //     aoa.push([`T-OFF TIMETABLE (${new Date(hole1[0].date).toISODateString()})`, ``, `T-OFF TIMETABLE (${new Date(hole1[0].date).toISODateString()})`, ``]);
    //     aoa.push([``, `HOLE-1`, ``, `HOLE-5`]);

    //     hole1.forEach((h1, index) => {
    //         aoa.push([new Date(hole1[index].date).toISOShortTimeAMPMString(), hole1[index].rooms, new Date(hole5[index].date).toISOShortTimeAMPMString(), hole5[index].rooms]);
    //     });
    //     aoa.push([``,``,``,``]);
    //     aoa.push([``, `HOLE-10`, ``, `HOLE-15`]);
    //     hole1.forEach((h1, index) => {
    //         aoa.push([new Date(hole10[index].date).toISOShortTimeAMPMString(), hole10[index].rooms, new Date(hole15[index].date).toISOShortTimeAMPMString(), hole15[index].rooms]);
    //     });
    //     const ws = XSLX.utils.aoa_to_sheet(aoa);
    //     const wb = XSLX.utils.book_new();
    //     XSLX.utils.book_append_sheet(wb, ws, "Timetable");
    //     XSLX.writeFile(wb, `Timetable${new Date().toISOString().substring(0,10)}.xlsx`);
    // };


    const fetchData = () => {

        if (drawDate) {
            getTimeTable(drawDate.getLocalDateAsUTCDate()).then((res) => {
                if (res.message) {
                    toast(res.message);
                }
                if (!res.error && res.data) {
                    setTimeTable(res.data.timeTable ? res.data.timeTable : []);
                }
            }).catch(reason => {
                setTimeTable([]);
            });
        } else {
            setTimeTable([]);
        }
    };

    React.useEffect(() => {
        setHole1(
            (timeTable || []).filter(tt => (tt.hole === '1' && (!onlyShowFree || (onlyShowFree && !tt.isBusy)))).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
        );
        setHole5(
            (timeTable || []).filter(tt => ((tt.hole === '5' || tt.hole === '6') && (!onlyShowFree || (onlyShowFree && !tt.isBusy)))).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
        );
        setHole10(
            (timeTable || []).filter(tt => (tt.hole === '10' && (!onlyShowFree || (onlyShowFree && !tt.isBusy)))).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
        );
        setHole15(
            (timeTable || []).filter(tt => (tt.hole === '15' && (!onlyShowFree || (onlyShowFree && !tt.isBusy)))).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
        );
    }, [timeTable, onlyShowFree]);


    React.useEffect(() => {
        fetchData();
    }, [drawDate]);


    React.useEffect(() => {
        let date = new Date();
        date.setDate(date.getDate() + 1);
        date = date.getUTCDateAsLocalDate();
        setDrawDate(date);

        getRoomNames(date).then(response => {
            if (response.message) {
                toast(response.message);
            }
            if (!response.error && response.data) {
                setRoomNames(response.data.roomNames);
            }
        })
    }, []);


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
                                            setDrawDate(date ? date.getLocalDateAsUTCDate() : null);
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
                                    if (!drawDate) {
                                        toast("Please choose draw date");
                                        return;
                                    }
                                    if (!startDate) {
                                        toast("Please choose start time");
                                        return;
                                    }
                                    if (!endDate) {
                                        toast("Please choose end time");
                                        return;
                                    }
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
                                            setDrawDate(date ? date.getLocalDateAsUTCDate() : null);
                                        }}
                                        dateFormat="yyyy-MM-dd"
                                        customInput={<InputCustom size="md" />} // Uses shadcn/ui Input
                                        placeholderText="yyyy-mm-dd"
                                        isClearable={true}
                                        showIcon
                                    />
                                </div>
                            </div>
                            <div className="flex gap-x-2">
                                <CheckboxCustom onCheckedChange={checked => setOnlyShowFree(Boolean(checked))} />
                                <div>Only Show Free</div>
                            </div>
                            <div className="flex gap-x-2 place-content-end">
                                <ButtonCustom onClick={fetchData}>Refresh</ButtonCustom>
                                <ButtonCustom onClick={() => setDrawDate(new Date().getUTCDateAsLocalDate())}>Reset</ButtonCustom>
                            </div>
                        </div>
                    </GroupContent>
                </Group>
            </section>
            <div className="flex gap-x-2">
                <ButtonCustom>Print All</ButtonCustom>
                <ButtonCustom>Delete Selection</ButtonCustom>
                <ButtonCustom variant="green" onClick={e => handleDownloadExcel(timeTable)} >Download Excel</ButtonCustom>
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
                                        1 부T OFF<br />({drawDate?.toISOFormatDateString()})<br />{location === 'MIDA' ?  'Hole 5' : 'Hole 6'}
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
                                <div>Date </div>
                                <div>{selectedItem ? new Date(selectedItem.date).toISOFormatDateString() : ""}</div>
                            </div>
                            <div>
                                <div>Time </div>
                                <div>{selectedItem ? new Date(selectedItem.time).toISOShortTimeAMPMString() : ""}</div>
                            </div>
                            <div>
                                <div>Is Busy</div>
                                <div><CheckboxCustom checked={Boolean(selectedItem?.isBusy)}
                                    onCheckedChange={checked => setSelectedItem(prev => ({ ...prev, isBusy: Boolean(checked) }))}
                                /></div>
                            </div>
                            <div>
                                <div>Rooms</div>
                                <div>
                                    <MultiBadgeSelect items={roomNames}
                                        value={selectedItem ? selectedItem.rooms : ""}
                                        onChange={value => setSelectedItem(prev => ({ ...prev, rooms: value }))}
                                    />
                                </div>
                            </div>
                            <div>
                                <div>No of Player</div>
                                <div>
                                    <SelectCustom items={SelectListForm.NO_OF_PLAYER}
                                        value={String(selectedItem ? String(selectedItem.noOfPeople) : "0")}
                                        onValueChange={value => setSelectedItem(prev => ({ ...prev, noOfPeople: Number(value) }))} />
                                </div>
                            </div>
                            <div>
                                <div className="flex gap-4">
                                    <ButtonCustom variant="green" onClick={() => {
                                        updateTimeTable(selectedItem).then(response => {
                                            if (response.message) {
                                                toast(response.message);
                                            }
                                            if (!response.error) {
                                                const therest = timeTable.filter(tt => tt.id !== selectedItem.id);
                                                setTimeTable([...therest, selectedItem]);
                                                setIsDialogOpen(false);
                                            }
                                        });
                                    }}>Save</ButtonCustom>
                                    <ButtonCustom onClick={handlePrint} >Print</ButtonCustom>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </section>
        </div>


    );
}