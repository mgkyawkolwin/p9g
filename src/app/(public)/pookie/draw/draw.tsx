'use client';

import { Loader } from "@/lib/components/web/react/uicustom/loader";
import React from "react";
import { ButtonCustom } from "@/lib/components/web/react/uicustom/buttoncustom";
import { InputCustom } from "@/lib/components/web/react/uicustom/inputcustom";
import { Group, GroupContent, GroupTitle } from "@/lib/components/web/react/uicustom/group";
import DatePicker from "react-datepicker";
import PookieTimeTable from "@/core/models/domain/PookieTimeTable";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/lib/components/web/react/ui/dialog";
import MultiBadgeSelect from "@/lib/components/web/react/uicustom/multibadgeselect";
import { draw } from "./actions";
import "@/lib/extensions/dateextensions";
import "react-datepicker/dist/react-datepicker.css";
import { getRoomNames } from "@/app/(private)/console/pookie/timetable/actions";
import { SelectCustom } from "@/lib/components/web/react/uicustom/selectcustom";
import { SelectListForm } from "@/core/constants";



export default function Draw() {

    const [drawDate, setDrawDate] = React.useState<Date>(new Date().getUTCDateAsLocalDate());
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [isPending, setIsPending] = React.useState(false);
    const [noOfPeople, setNoOfPeople] = React.useState(0);
    const [roomNames, setRoomNames] = React.useState<string[]>([]);
    const [rooms, setRooms] = React.useState<string>("");
    const [selectedItem, setSelectedItem] = React.useState<PookieTimeTable>(null);
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

    function playConfetti() {
        if (typeof document === "undefined") return; // SSR guard

        const container = document.createElement("div");
        Object.assign(container.style, {
            position: "fixed",
            left: "0",
            top: "0",
            width: "100vw",
            height: "100vh",
            pointerEvents: "none",
            overflow: "hidden",
            zIndex: "9999",
        });
        document.body.appendChild(container);

        const shapes = ["circle", "rect", "triangle"];
        const colors = ["#FF5E5B", "#FFD700", "#4BC0C8", "#3DDC84", "#FF7A00", "#9B5DE5"];
        const pieceCount = 500;
        const duration = 5000; // 2 seconds (fast boom)

        for (let i = 0; i < pieceCount; i++) {
            const piece = document.createElement("div");
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = 5 + Math.random() * 10;

            Object.assign(piece.style, {
                position: "absolute",
                left: "50%",
                top: "50%",
                width: `${size}px`,
                height: `${size}px`,
                background: color,
                borderRadius: shape === "circle" ? "50%" : "0",
                clipPath:
                    shape === "triangle"
                        ? "polygon(50% 0%, 0% 100%, 100% 100%)"
                        : "none",
                opacity: "1",
                transform: `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`,
            });

            container.appendChild(piece);

            // Random direction and distance
            const angle = Math.random() * 2 * Math.PI;
            const distance = 300 + Math.random() * 250; // outward spread distance
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            const rotation = 180 + Math.random() * 540;

            piece.animate(
                [
                    {
                        transform: `translate(-50%, -50%) translate(0, 0) rotate(0deg) scale(1)`,
                        opacity: 1,
                    },
                    {
                        transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${rotation}deg) scale(0.8)`,
                        opacity: 0,
                    },
                ],
                {
                    duration,
                    easing: "cubic-bezier(0.2, 0.8, 0.4, 1)",
                    fill: "forwards",
                }
            );
        }

        // Clean up after animation
        setTimeout(() => container.remove(), duration + 200);
    }

    function fetchRoomNames() {
        let date = new Date();
        date.setDate(date.getDate() + 1 );
        date = date.getUTCDateAsLocalDate();
        setDrawDate(date);

        getRoomNames(date).then(response => {
            if(response.message){
                toast(response.message);
            }
            if(!response.error && response.data){
                setRoomNames(response.data.roomNames);
            }
        });
    }

    React.useEffect(() => {
            fetchRoomNames();
        },[]);


    return (
        <div className="flex flex-1 w-full items-center content-center p-8 bg-[#ffdd88]">

            <div aria-label="Generate Time Table" className="flex flex-1 w-full h-fit place-content-between gap-x-4">
                <div aria-label="Image" className="">
                    <img src={"/golf.gif"} style={{ width: "400px" }} />
                </div>
                <div className="flex flex-col gap-y-8 p-8 bg-[#dd5500] rounded-lg">
                    <div className="flex flex-col gap-y-4">
                        <div className="font-bold">Date</div>
                        <div>
                            <DatePicker
                                selected={drawDate ? drawDate.getUTCDateAsLocalDate() : null}
                                onChange={(date: Date | null) => {
                                    setDrawDate(date ? date.getLocalDateAsUTCDate() : null);
                                }}
                                dateFormat="yyyy-MM-dd"
                                customInput={<InputCustom size="full" />}
                                placeholderText="yyyy-mm-dd"
                                isClearable={true}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-y-4">
                        <div className="font-bold">Rooms</div>
                        <div>
                            <MultiBadgeSelect items={roomNames}
                                value={rooms}
                                onChange={value => setRooms(value)}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-y-4">
                        <div className="font-bold">Number of People</div>
                        <div>
                            <SelectCustom items={SelectListForm.NO_OF_PLAYER} 
                            value={String(noOfPeople)}
                            onValueChange={value => setNoOfPeople(Number(value))}></SelectCustom>
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <div></div>
                        <div>
                            <ButtonCustom variant="red" onClick={async () => {
                                setRooms("");
                                setNoOfPeople(0);

                            }}>RESET</ButtonCustom>&nbsp;&nbsp;
                            <ButtonCustom variant="green" onClick={async () => {
                                if (!drawDate) {
                                    toast('Invalid date. Please choose draw date.');
                                    return;
                                }
                                if (!rooms || rooms.length <= 0) {
                                    toast('Invalid rooms. Please choose room(s).');
                                    return;
                                }
                                if (!noOfPeople || noOfPeople <= 0) {
                                    toast('Invalid people. Please choose number of people.');
                                    return;
                                }
                                
                                const response = await draw(drawDate, rooms, noOfPeople);
                                if (response.message)
                                    toast(response.message);
                                if (!response.error) {
                                    setIsDialogOpen(true);
                                    playConfetti();
                                    setSelectedItem(response.data.timeTable);
                                    setRooms("");
                                    setNoOfPeople(0);
                                    fetchRoomNames();
                                }

                            }}>DRAW</ButtonCustom>
                        </div>
                    </div>
                </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTitle>

                </DialogTitle>
                <DialogContent className="flex p-8">
                    <div className="flex flex-col gap-4">
                        <div className="font-bold">
                            티업표 배정되었습니다!
                        </div>
                        <div>
                            홀 {selectedItem?.hole ?? ""}
                        </div>
                        <div>
                            티업 타임 {selectedItem ? new Date(selectedItem.date).toISOString().substring(0, 10) : ""} {selectedItem ? new Date(selectedItem.time).toISOString().substring(11, 16) : ""}
                        </div>
                        <div>
                            내일 오전 티업하실때 티업표를 스탓터 직원한테 주시고 티업 시작하시면 됩니다. 즐거운 라운딩 되시길 바랍니다. 감사합니다.
                        </div>
                        <div>
                            <div className="flex gap-4">
                                <ButtonCustom onClick={() => {
                                    setIsDialogOpen(false);
                                }}>Close</ButtonCustom>
                                <ButtonCustom variant="green" onClick={handlePrint} >Print</ButtonCustom>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

        </div>


    );
}