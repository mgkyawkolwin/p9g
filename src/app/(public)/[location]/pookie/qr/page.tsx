"use client";

import React from "react";
import { getQRURL } from "./actions";
import { toast } from "sonner";

export default function QRPage() {
    const [qrLoaded, setQrLoaded] = React.useState(false);
    const [qrURL, setQRURL] = React.useState("");

    React.useEffect(() => {
        getQRURL().then(response => {
            setQRURL(response.data.qr);
            setQrLoaded(true);
        }).catch(reason => {
            if(reason?.message)
                toast(reason.message);
            else
                toast("Unknown error occured when generating QR image.");
        });
    }, []);

    if(!qrLoaded) return <>Loading QR Image...</>;

    return (
        <div style={{ flex: "1", width: "100vw", height: "100vh", justifyContent: "center", justifyItems: "center" }}>
            <img src={qrURL} style={{ width: "300px", height: "300px" }} />
        </div>
    );
}