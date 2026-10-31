'use client';

import React from "react";
import { useReactToPrint } from "react-to-print";
import { Printer } from "lucide-react";
import Customer from "@/core/models/domain/Customer";
import { ButtonCustom } from "../../../lib/components/web/react/uicustom/buttoncustom";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../../../lib/components/web/react/ui/dialog";

interface CustomerViewDialogProps {
    customer: Customer | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    location: string;
}

const displayValue = (value: string | null | undefined) => value?.trim() || "—";

export default function CustomerViewDialog({ customer, open, onOpenChange, location }: CustomerViewDialogProps) {
    const printRef = React.useRef<HTMLDivElement>(null);
    const [displayCustomer, setDisplayCustomer] = React.useState<Customer | null>(customer);
    const [isLoading, setIsLoading] = React.useState(false);
    const [loadError, setLoadError] = React.useState<string | null>(null);
    const title = displayCustomer?.name?.trim() || displayCustomer?.englishName?.trim() || "Customer";
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Customer Profile - ${title}`,
        pageStyle: `
            @page { size: auto; margin: 14mm; }
            .customer-profile-sheet { color: #17212f !important; background: #ffffff !important; font-family: Arial, Helvetica, sans-serif !important; }
            .customer-profile-sheet h1, .customer-profile-sheet h2, .customer-profile-sheet dd { color: #17212f !important; }
            .customer-profile-sheet dt, .customer-profile-sheet .profile-meta { color: #536273 !important; }
        `,
    });

    React.useEffect(() => {
        setDisplayCustomer(customer);
        setLoadError(null);

        if (!open || !customer?.id) {
            setIsLoading(false);
            return;
        }

        let cancelled = false;
        setIsLoading(true);

        fetch(`/api/customers/${encodeURIComponent(customer.id)}`, {
            headers: { "X-Resort-Location": location },
        })
            .then(async response => {
                const result = await response.json();
                if (!response.ok || !result.data)
                    throw new Error(result.message || "Unable to load customer details.");
                if (!cancelled)
                    setDisplayCustomer(result.data as Customer);
            })
            .catch(error => {
                if (!cancelled)
                    setLoadError(error instanceof Error ? error.message : "Unable to load customer details.");
            })
            .finally(() => {
                if (!cancelled)
                    setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [customer, location, open]);

    const sections = displayCustomer ? [
        {
            title: "Personal Information",
            fields: [
                ["Name", displayCustomer.name],
                ["English Name", displayCustomer.englishName],
                ["DOB", displayCustomer.dob],
                ["Gender", displayCustomer.gender],
                ["National ID", displayCustomer.nationalId],
                ["Passport", displayCustomer.passport],
                ["Phone", displayCustomer.phone],
                ["Email", displayCustomer.email],
                ["Country", displayCustomer.country],
                ["Address", displayCustomer.address],
                ["Remarks", displayCustomer.remarks],
                ["Black List", displayCustomer.isBlackListed ? "Yes" : "No"],
            ],
        },
        {
            title: "Employment Information",
            fields: [
                ["Company Name", displayCustomer.companyName],
                ["Position", displayCustomer.position],
            ],
        },
        {
            title: "Golf Profile",
            fields: [
                ["Handicap", displayCustomer.handicap],
                ["Home Club", displayCustomer.homeClub || "No"],
                ["Years Playing", displayCustomer.yearsPlaying],
                ["Playing Hand", displayCustomer.playingHand],
                ["Caddie Preference", displayCustomer.caddiePreference ? "Yes" : "No"],
                ["Caddie Number", displayCustomer.caddiePreference],
            ],
        },
        {
            title: "Membership",
            fields: [
                ["Status", displayCustomer.membershipStatus],
                ["Membership No", displayCustomer.membershipNo],
                ["Introduced By", displayCustomer.introducedBy],
                ["Interested in Membership", displayCustomer.interestedInMembership],
            ],
        },
        {
            title: "Preferences",
            fields: [
                ["Food Allergy", displayCustomer.foodAllergy],
                ["Drink", displayCustomer.drink],
                ["Preferred Tee Time", displayCustomer.preferredTeeTime],
                ["Language", displayCustomer.language],
                ["Special Note", displayCustomer.specialNote],
            ],
        },
        {
            title: "Visit Detail",
            fields: [
                ["Number of Players", displayCustomer.numberOfPlayers],
                ["Booking Channel", displayCustomer.bookingChannel],
                ["Visit Purpose", displayCustomer.visitPurpose],
            ],
        },
        {
            title: "Emergency Contact",
            fields: [
                ["Name", displayCustomer.emergencyContactName],
                ["Phone", displayCustomer.emergencyContactPhone],
                ["Relation", displayCustomer.emergencyContactRelation],
            ],
        },
        {
            title: "Health Information",
            fields: [
                ["Medical Conditions", displayCustomer.medicalConditions],
                ["Pacemaker/Stent", displayCustomer.pacemakerStent],
                ["Regular Medication", displayCustomer.regularMedication],
                ["Drug Allergy", displayCustomer.drugAllergy],
                ["Walking the Course", displayCustomer.walkingTheCourse],
                ["Dizzy/Short of Breath When Walking", displayCustomer.dizzyShortOfBreathWhenWalking],
                ["Doctor Name / Phone", displayCustomer.doctorNamePhone],
            ],
        },
    ] : [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {customer && (
                <DialogContent style={{minWidth: '70vw', minHeight: '90vh'}} className="max-h-[90vh] min-w-[75vw] max-w-[90vw] overflow-y-auto print:max-h-none print:min-w-0 print:max-w-none print:overflow-visible print:border-0 print:p-0 print:shadow-none">
                    <DialogHeader className="flex-row items-start justify-between gap-4 print:hidden">
                        <div style={{ color: "#17212f" }}>
                            <DialogTitle style={{ color: "#17212f", fontSize: "20px" }}>Customer Details</DialogTitle>
                            <DialogDescription style={{ color: "#536273" }}>{title}</DialogDescription>
                        </div>
                        <ButtonCustom type="button" variant="black" disabled={isLoading} onClick={handlePrint}>
                            <Printer aria-hidden="true" className="mr-2 size-4" />
                            Print
                        </ButtonCustom>
                    </DialogHeader>
                    {isLoading && <p className="py-8 text-center text-sm text-gray-500">Loading customer details...</p>}
                    {loadError && <p role="alert" className="text-sm text-red-600">{loadError} Showing available list data.</p>}
                    <article
                        ref={printRef}
                        className={`customer-profile-sheet bg-white p-2 sm:p-6 print:p-0 ${isLoading ? "hidden" : ""}`}
                        style={{
                            backgroundColor: "#ffffff",
                            color: "#17212f",
                            fontFamily: "Arial, Helvetica, sans-serif",
                            border: "1px solid #d9e1e8",
                            borderRadius: "12px",
                            boxShadow: "0 12px 32px rgba(15, 23, 42, 0.08)",
                        }}
                    >
                        <header style={{ borderBottom: "3px solid #0f766e", marginBottom: "24px", paddingBottom: "18px" }}>
                            <p style={{ color: "#0f766e", fontSize: "11px", fontWeight: 700, margin: "0 0 6px", textTransform: "uppercase" }}>
                                Customer Record
                            </p>
                            <h1 style={{ color: "#17212f", fontSize: "30px", fontWeight: 700, lineHeight: 1.15, margin: 0 }}>
                                {title}
                            </h1>
                            <p className="profile-meta" style={{ color: "#536273", fontSize: "13px", margin: "8px 0 0" }}>
                                Customer ID: {displayValue(displayCustomer?.id)}
                            </p>
                        </header>
                        <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2 print:grid-cols-2">
                            {sections.map(section => (
                                <section key={section.title} className="break-inside-avoid" style={{ breakInside: "avoid", minWidth: 0 }}>
                                    <h2 style={{
                                        backgroundColor: "#eef5f4",
                                        borderLeft: "4px solid #0f766e",
                                        color: "#17212f",
                                        fontSize: "13px",
                                        fontWeight: 700,
                                        letterSpacing: "0.04em",
                                        margin: "0 0 8px",
                                        padding: "8px 10px",
                                        textTransform: "uppercase",
                                    }}>
                                        {section.title}
                                    </h2>
                                    <dl style={{ margin: 0 }}>
                                        {section.fields.map(([label, value], index) => (
                                            <div key={label} style={{
                                                backgroundColor: index % 2 === 0 ? "#ffffff" : "#f7f9fb",
                                                borderBottom: "1px solid #e4e9ee",
                                                display: "grid",
                                                gap: "12px",
                                                gridTemplateColumns: "minmax(0, 0.8fr) minmax(0, 1.2fr)",
                                                padding: "9px 10px",
                                            }}>
                                                <dt style={{ color: "#536273", fontSize: "12px", fontWeight: 600 }}>{label}</dt>
                                                <dd style={{ color: "#17212f", fontSize: "14px", fontWeight: 500, margin: 0, overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>
                                                    {displayValue(value)}
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>
                                </section>
                            ))}
                        </div>
                    </article>
                </DialogContent>
            )}
        </Dialog>
    );
}
