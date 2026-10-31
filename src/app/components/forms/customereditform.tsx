'use client';

import React from "react";
import { ButtonCustom } from "../../../lib/components/web/react/uicustom/buttoncustom";
import { toast } from "sonner";
import Customer from "@/core/models/domain/Customer";
import CustomerDetailForm from "../basicforms/customerdetailform";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../lib/components/web/react/ui/dialog";
import { customerUpdate } from "@/app/(private)/[location]/console/customers/[id]/edit/actions";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../../../lib/components/web/react/ui/card";
import { InputWithLabel } from "../../../lib/components/web/react/uicustom/inputwithlabel";
import { InputCustom } from "../../../lib/components/web/react/uicustom/inputcustom";
import { Label } from "../../../lib/components/web/react/ui/label";

interface CustomerEditFormProps {
    onSaved?: (customer: Customer) => void;
    openCallback?: (func: {
        openDialog: (open: boolean) => void;
        setEditCustomer: (customer:Customer) => void;
    }) => void;
}

const bookingChannelOptions = ["Phone", "Agent", "Walk-in", "Corporate"] as const;
const visitPurposeOptions = ["Leisure", "Business", "Tournament", "Birthday/Event"] as const;
const membershipStatusOptions = ["Non-Member", "Guest", "Member", "VIP", "Corporate"] as const;
const membershipInterestOptions = ["Yes", "No", "May Be"] as const;
const drinkOptions = ["Tea", "Coffee", "Beer"] as const;
const preferredTeeTimeOptions = ["Morning", "Afternoon", "Twilight"] as const;
const languageOptions = ["Korean", "English", "Myanmar"] as const;
const medicalConditionOptions = [
    "None",
    "Heart Diseases",
    "High Blood Pressure",
    "Diabetes",
    "High Cholesterol",
    "Stroke",
    "Asthma/Lung",
    "Joint/Back",
    "Kidney",
    "Liver",
    "Other",
    "Prefer Not to Say"
] as const;
type MedicalConditionOption = typeof medicalConditionOptions[number];

const parseMedicalConditions = (value: string) => {
    const entries = value.split(";").map(entry => entry.trim()).filter(Boolean);
    const selected = entries.filter((entry): entry is MedicalConditionOption =>
        medicalConditionOptions.includes(entry as MedicalConditionOption)
    );
    const otherDetails = entries
        .filter(entry => entry.startsWith("Other:"))
        .map(entry => entry.slice("Other:".length).trim());
    const unrecognizedEntries = entries.filter(entry =>
        !medicalConditionOptions.includes(entry as MedicalConditionOption) && !entry.startsWith("Other:")
    );

    if ((otherDetails.length || unrecognizedEntries.length) && !selected.includes("Other"))
        selected.push("Other");

    return {
        selected: Array.from(new Set(selected)),
        otherDetails: [...otherDetails, ...unrecognizedEntries].filter(Boolean).join("; ")
    };
};

const serializeMedicalConditions = (selected: MedicalConditionOption[], otherDetails: string) => {
    const entries: string[] = selected.filter(option => option !== "Other");
    if (selected.includes("Other"))
        entries.push(otherDetails.trim() ? `Other: ${otherDetails.trim()}` : "Other");
    return entries.join("; ");
};

export default function CustomerEditForm({ onSaved, openCallback }: CustomerEditFormProps) {
    const params = useParams();
    const location = params.location as string;
    
    const [resetDataToggle, setResetDataToggle] = React.useState(false);
    const [customer, setCustomer] = React.useState(new Customer());
    const [hasHomeClub, setHasHomeClub] = React.useState(false);
    const [hasCaddiePreference, setHasCaddiePreference] = React.useState(false);
    const [isOtherBookingChannel, setIsOtherBookingChannel] = React.useState(false);
    const [isOtherVisitPurpose, setIsOtherVisitPurpose] = React.useState(false);
    const [isOtherDrink, setIsOtherDrink] = React.useState(false);
    const [isOtherLanguage, setIsOtherLanguage] = React.useState(false);
    const [selectedMedicalConditions, setSelectedMedicalConditions] = React.useState<MedicalConditionOption[]>([]);
    const [otherMedicalCondition, setOtherMedicalCondition] = React.useState("");
    const [open, setOpen] = React.useState(false);


    const handleDataChanged = (customer: Customer) => {
        setCustomer(customer);
    };

    const updateMedicalCondition = (option: MedicalConditionOption, checked: boolean) => {
        let nextSelected: MedicalConditionOption[];
        let nextOtherMedicalCondition = otherMedicalCondition;

        if (checked && (option === "None" || option === "Prefer Not to Say")) {
            nextSelected = [option];
            nextOtherMedicalCondition = "";
        } else if (checked) {
            nextSelected = [...selectedMedicalConditions.filter(value => value !== "None" && value !== "Prefer Not to Say"), option];
        } else {
            nextSelected = selectedMedicalConditions.filter(value => value !== option);
            if (option === "Other")
                nextOtherMedicalCondition = "";
        }

        setSelectedMedicalConditions(nextSelected);
        setOtherMedicalCondition(nextOtherMedicalCondition);
        setCustomer(prev => ({
            ...prev,
            medicalConditions: serializeMedicalConditions(nextSelected, nextOtherMedicalCondition)
        }));
    };

    const updateOtherMedicalCondition = (value: string) => {
        const nextSelected = value.trim()
            ? [...selectedMedicalConditions.filter(option => option !== "None" && option !== "Prefer Not to Say"), "Other" as MedicalConditionOption]
            : selectedMedicalConditions;
        setSelectedMedicalConditions(Array.from(new Set(nextSelected)));
        setOtherMedicalCondition(value);
        setCustomer(prev => ({
            ...prev,
            medicalConditions: serializeMedicalConditions(nextSelected, value)
        }));
    };

    const openDialog = (open: boolean) => {
        setOpen(open);
    };

    const setEditCustomer = (customer: Customer) => {
        setCustomer(customer);
        setHasHomeClub(Boolean(customer.homeClub?.trim()));
        setHasCaddiePreference(Boolean(customer.caddiePreference?.trim()));
        setIsOtherBookingChannel(!bookingChannelOptions.includes(customer.bookingChannel as typeof bookingChannelOptions[number]));
        setIsOtherVisitPurpose(!visitPurposeOptions.includes(customer.visitPurpose as typeof visitPurposeOptions[number]));
        setIsOtherDrink(!drinkOptions.includes(customer.drink as typeof drinkOptions[number]));
        setIsOtherLanguage(!languageOptions.includes(customer.language as typeof languageOptions[number]));
        const medicalConditions = parseMedicalConditions(customer.medicalConditions ?? "");
        setSelectedMedicalConditions(medicalConditions.selected);
        setOtherMedicalCondition(medicalConditions.otherDetails);
    };

    React.useEffect(() => {
        if (openCallback) {
            openCallback({ openDialog, setEditCustomer });
        }
    }, [openCallback]);


    return (
        <Dialog open={open} onOpenChange={setOpen} >
            <DialogContent style={{ minHeight: '80vh', minWidth: '80vw', maxHeight: '80vh', maxWidth: '80vw' }} className="min-h-[80vh] max-h-[80vh] min-w-[80vw] max-w-[80vw] overflow-scroll">
                <DialogHeader>
                    <DialogTitle>Edit Customer</DialogTitle>
                    <DialogDescription>
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-4">
                        <div className="flex min-w-0 flex-1 flex-col gap-4">
                        <Card className="flex">
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CustomerDetailForm onDataChanged={handleDataChanged} resetDataToggle={resetDataToggle} customer={customer} />
                            </CardContent>
                        </Card>
                        <Card className="flex">
                            <CardHeader>
                                <CardTitle>Employment Information</CardTitle>
                            </CardHeader>
                            <CardContent className="flex w-full flex-col gap-3">
                                <InputWithLabel name="companyName" label="Company Name" variant="default" size="full" labelPosition="top"
                                    value={customer.companyName ?? ''}
                                    onChange={(e) => setCustomer(prev => ({ ...prev, companyName: e.target.value }))} />
                                <InputWithLabel name="position" label="Position" variant="default" size="full" labelPosition="top"
                                    value={customer.position ?? ''}
                                    onChange={(e) => setCustomer(prev => ({ ...prev, position: e.target.value }))} />
                            </CardContent>
                        </Card>
                        <Card className="flex">
                            <CardHeader>
                                <CardTitle>Golf Profile</CardTitle>
                            </CardHeader>
                            <CardContent className="flex w-full flex-col gap-3">
                                <InputWithLabel name="handicap" label="Handicap" variant="default" size="full" labelPosition="top"
                                    value={customer.handicap ?? ''}
                                    onChange={(e) => setCustomer(prev => ({ ...prev, handicap: e.target.value }))} />
                                <div className="flex items-end gap-4">
                                    <div className="flex flex-col gap-2">
                                        <Label className="text-[10pt]">Home Club</Label>
                                        <div className="flex h-8 items-center gap-3">
                                            <div className="flex items-center gap-1">
                                                <input id="homeClubNo" name="homeClub" type="radio" value="No" checked={!hasHomeClub}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setHasHomeClub(false);
                                                            setCustomer(prev => ({ ...prev, homeClub: '' }));
                                                        }
                                                    }} />
                                                <Label htmlFor="homeClubNo">No</Label>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <input id="homeClubYes" name="homeClub" type="radio" value="Yes" checked={hasHomeClub}
                                                    onChange={() => setHasHomeClub(true)} />
                                                <Label htmlFor="homeClubYes">Yes</Label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <InputWithLabel name="homeClubName" label="Club Name" variant="default" size="full" labelPosition="left"
                                            value={customer.homeClub ?? ''}
                                            onChange={(e) => {
                                                const homeClub = e.target.value;
                                                setCustomer(prev => ({ ...prev, homeClub }));
                                                setHasHomeClub(Boolean(homeClub.trim()));
                                            }} />
                                    </div>
                                </div>
                                <InputWithLabel name="yearsPlaying" label="Years Playing" variant="default" size="full" labelPosition="top"
                                    value={customer.yearsPlaying ?? ''}
                                    onChange={(e) => setCustomer(prev => ({ ...prev, yearsPlaying: e.target.value }))} />
                                <div className="flex flex-col gap-2">
                                    <Label className="text-[10pt]">Playing Hand</Label>
                                    <div className="flex h-8 items-center gap-3">
                                        <div className="flex items-center gap-1">
                                            <input id="playingHandLeft" name="playingHand" type="radio" value="Left" checked={customer.playingHand === 'Left'}
                                                onChange={() => setCustomer(prev => ({ ...prev, playingHand: 'Left' }))} />
                                            <Label htmlFor="playingHandLeft">Left</Label>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <input id="playingHandRight" name="playingHand" type="radio" value="Right" checked={customer.playingHand === 'Right'}
                                                onChange={() => setCustomer(prev => ({ ...prev, playingHand: 'Right' }))} />
                                            <Label htmlFor="playingHandRight">Right</Label>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-end gap-4">
                                    <div className="flex flex-col gap-2">
                                        <Label className="text-[10pt]">Caddie Preference</Label>
                                        <div className="flex h-8 items-center gap-3">
                                            <div className="flex items-center gap-1">
                                                <input id="caddiePreferenceNo" name="caddiePreference" type="radio" value="No" checked={!hasCaddiePreference}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setHasCaddiePreference(false);
                                                            setCustomer(prev => ({ ...prev, caddiePreference: '' }));
                                                        }
                                                    }} />
                                                <Label htmlFor="caddiePreferenceNo">No</Label>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <input id="caddiePreferenceYes" name="caddiePreference" type="radio" value="Yes" checked={hasCaddiePreference}
                                                    onChange={() => setHasCaddiePreference(true)} />
                                                <Label htmlFor="caddiePreferenceYes">Yes</Label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <InputWithLabel name="caddiePreference" label="Caddie Number" variant="default" size="full" labelPosition="left"
                                            value={customer.caddiePreference ?? ''}
                                            onChange={(e) => {
                                                const caddiePreference = e.target.value;
                                                setCustomer(prev => ({ ...prev, caddiePreference }));
                                                setHasCaddiePreference(Boolean(caddiePreference.trim()));
                                            }} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-4">
                        <Card className="flex">
                            <CardHeader>
                                <CardTitle>Membership</CardTitle>
                            </CardHeader>
                            <CardContent className="flex w-full flex-col gap-3">
                                <div className="flex flex-col gap-2">
                                    <Label className="text-[10pt]">Status</Label>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                        {membershipStatusOptions.map((option) => (
                                            <div key={option} className="flex items-center gap-1">
                                                <input id={`membershipStatus-${option}`} name="membershipStatus" type="radio" value={option}
                                                    checked={customer.membershipStatus === option}
                                                    onChange={() => setCustomer(prev => ({ ...prev, membershipStatus: option }))} />
                                                <Label htmlFor={`membershipStatus-${option}`}>{option}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <InputWithLabel name="membershipNo" label="Membership No" variant="default" size="full" labelPosition="top"
                                    value={customer.membershipNo ?? ''}
                                    onChange={(e) => setCustomer(prev => ({ ...prev, membershipNo: e.target.value }))} />
                                <InputWithLabel name="introducedBy" label="Introduced By" variant="default" size="full" labelPosition="top"
                                    value={customer.introducedBy ?? ''}
                                    onChange={(e) => setCustomer(prev => ({ ...prev, introducedBy: e.target.value }))} />
                                <div className="flex flex-col gap-2">
                                    <Label className="text-[10pt]">Interested in Membership</Label>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                        {membershipInterestOptions.map((option) => (
                                            <div key={option} className="flex items-center gap-1">
                                                <input id={`interestedInMembership-${option}`} name="interestedInMembership" type="radio" value={option}
                                                    checked={customer.interestedInMembership === option}
                                                    onChange={() => setCustomer(prev => ({ ...prev, interestedInMembership: option }))} />
                                                <Label htmlFor={`interestedInMembership-${option}`}>{option}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="flex">
                            <CardHeader>
                                <CardTitle>Preferences</CardTitle>
                            </CardHeader>
                            <CardContent className="flex w-full flex-col gap-3">
                                <InputWithLabel name="foodAllergy" label="Food Allergy" variant="default" size="full" labelPosition="top"
                                    value={customer.foodAllergy ?? ''}
                                    onChange={(e) => setCustomer(prev => ({ ...prev, foodAllergy: e.target.value }))} />
                                <div className="flex flex-col gap-2">
                                    <Label className="text-[10pt]">Drink</Label>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                        {drinkOptions.map((option) => (
                                            <div key={option} className="flex items-center gap-1">
                                                <input id={`drink-${option}`} name="drinkChoice" type="radio" value={option}
                                                    checked={!isOtherDrink && customer.drink === option}
                                                    onChange={() => {
                                                        setIsOtherDrink(false);
                                                        setCustomer(prev => ({ ...prev, drink: option }));
                                                    }} />
                                                <Label htmlFor={`drink-${option}`}>{option}</Label>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex w-full min-w-0 items-center gap-2">
                                        <div className="flex shrink-0 items-center gap-1">
                                            <input id="drinkOther" name="drinkChoice" type="radio" value="Other"
                                                checked={isOtherDrink}
                                                onChange={() => {
                                                    setIsOtherDrink(true);
                                                    setCustomer(prev => ({ ...prev, drink: '' }));
                                                }} />
                                            <Label htmlFor="drinkOther">Other</Label>
                                        </div>
                                        <InputCustom size="full" className="min-w-0 flex-1" aria-label="Other drink" placeholder="Specify drink"
                                            value={isOtherDrink ? customer.drink ?? '' : ''}
                                            onChange={(e) => {
                                                setIsOtherDrink(true);
                                                setCustomer(prev => ({ ...prev, drink: e.target.value }));
                                            }} />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label className="text-[10pt]">Preferred Tee Time</Label>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                        {preferredTeeTimeOptions.map((option) => (
                                            <div key={option} className="flex items-center gap-1">
                                                <input id={`preferredTeeTime-${option}`} name="preferredTeeTime" type="radio" value={option}
                                                    checked={customer.preferredTeeTime === option}
                                                    onChange={() => setCustomer(prev => ({ ...prev, preferredTeeTime: option }))} />
                                                <Label htmlFor={`preferredTeeTime-${option}`}>{option}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label className="text-[10pt]">Language</Label>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                        {languageOptions.map((option) => (
                                            <div key={option} className="flex items-center gap-1">
                                                <input id={`language-${option}`} name="languageChoice" type="radio" value={option}
                                                    checked={!isOtherLanguage && customer.language === option}
                                                    onChange={() => {
                                                        setIsOtherLanguage(false);
                                                        setCustomer(prev => ({ ...prev, language: option }));
                                                    }} />
                                                <Label htmlFor={`language-${option}`}>{option}</Label>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex w-full min-w-0 items-center gap-2">
                                        <div className="flex shrink-0 items-center gap-1">
                                            <input id="languageOther" name="languageChoice" type="radio" value="Other"
                                                checked={isOtherLanguage}
                                                onChange={() => {
                                                    setIsOtherLanguage(true);
                                                    setCustomer(prev => ({ ...prev, language: '' }));
                                                }} />
                                            <Label htmlFor="languageOther">Other</Label>
                                        </div>
                                        <InputCustom size="full" className="min-w-0 flex-1" aria-label="Other language" placeholder="Specify language"
                                            value={isOtherLanguage ? customer.language ?? '' : ''}
                                            onChange={(e) => {
                                                setIsOtherLanguage(true);
                                                setCustomer(prev => ({ ...prev, language: e.target.value }));
                                            }} />
                                    </div>
                                </div>
                                <InputWithLabel name="specialNote" label="Special Note" variant="default" size="full" labelPosition="top"
                                    value={customer.specialNote ?? ''}
                                    onChange={(e) => setCustomer(prev => ({ ...prev, specialNote: e.target.value }))} />
                            </CardContent>
                        </Card>
                        <Card className="flex">
                            <CardHeader>
                                <CardTitle>Visit Detail</CardTitle>
                            </CardHeader>
                            <CardContent className="flex w-full flex-col gap-3">
                                <InputWithLabel name="numberOfPlayers" label="Number of Players" variant="default" size="full" labelPosition="top"
                                    value={customer.numberOfPlayers ?? ''}
                                    onChange={(e) => setCustomer(prev => ({ ...prev, numberOfPlayers: e.target.value }))} />
                                <div className="flex flex-col gap-2">
                                    <Label className="text-[10pt]">Booking Channel</Label>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                        {bookingChannelOptions.map((option) => (
                                            <div key={option} className="flex items-center gap-1">
                                                <input id={`bookingChannel-${option}`} name="bookingChannelChoice" type="radio" value={option}
                                                    checked={!isOtherBookingChannel && customer.bookingChannel === option}
                                                    onChange={() => {
                                                        setIsOtherBookingChannel(false);
                                                        setCustomer(prev => ({ ...prev, bookingChannel: option }));
                                                    }} />
                                                <Label htmlFor={`bookingChannel-${option}`}>{option}</Label>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex w-full min-w-0 items-center gap-2">
                                        <div className="flex shrink-0 items-center gap-1">
                                            <input id="bookingChannelOther" name="bookingChannelChoice" type="radio" value="Other"
                                                checked={isOtherBookingChannel}
                                                onChange={() => {
                                                    setIsOtherBookingChannel(true);
                                                    setCustomer(prev => ({ ...prev, bookingChannel: '' }));
                                                }} />
                                            <Label htmlFor="bookingChannelOther">Other</Label>
                                        </div>
                                        <InputCustom size="full" className="min-w-0 flex-1" aria-label="Other booking channel" placeholder="Specify channel"
                                            value={isOtherBookingChannel ? customer.bookingChannel ?? '' : ''}
                                            onChange={(e) => {
                                                setIsOtherBookingChannel(true);
                                                setCustomer(prev => ({ ...prev, bookingChannel: e.target.value }));
                                            }} />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label className="text-[10pt]">Visit Purpose</Label>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                        {visitPurposeOptions.map((option) => (
                                            <div key={option} className="flex items-center gap-1">
                                                <input id={`visitPurpose-${option}`} name="visitPurposeChoice" type="radio" value={option}
                                                    checked={!isOtherVisitPurpose && customer.visitPurpose === option}
                                                    onChange={() => {
                                                        setIsOtherVisitPurpose(false);
                                                        setCustomer(prev => ({ ...prev, visitPurpose: option }));
                                                    }} />
                                                <Label htmlFor={`visitPurpose-${option}`}>{option}</Label>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex w-full min-w-0 items-center gap-2">
                                        <div className="flex shrink-0 items-center gap-1">
                                            <input id="visitPurposeOther" name="visitPurposeChoice" type="radio" value="Other"
                                                checked={isOtherVisitPurpose}
                                                onChange={() => {
                                                    setIsOtherVisitPurpose(true);
                                                    setCustomer(prev => ({ ...prev, visitPurpose: '' }));
                                                }} />
                                            <Label htmlFor="visitPurposeOther">Other</Label>
                                        </div>
                                        <InputCustom size="full" className="min-w-0 flex-1" aria-label="Other visit purpose" placeholder="Specify purpose"
                                            value={isOtherVisitPurpose ? customer.visitPurpose ?? '' : ''}
                                            onChange={(e) => {
                                                setIsOtherVisitPurpose(true);
                                                setCustomer(prev => ({ ...prev, visitPurpose: e.target.value }));
                                            }} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-4">
                        <Card className="flex">
                            <CardHeader>
                                <CardTitle>Emergency Contact</CardTitle>
                            </CardHeader>
                            <CardContent className="flex w-full flex-col gap-3">
                                <InputWithLabel name="emergencyContactName" label="Name" variant="default" size="full" labelPosition="top"
                                    value={customer.emergencyContactName ?? ''}
                                    onChange={(e) => setCustomer(prev => ({ ...prev, emergencyContactName: e.target.value }))} />
                                <InputWithLabel name="emergencyContactPhone" label="Phone" variant="default" size="full" labelPosition="top"
                                    value={customer.emergencyContactPhone ?? ''}
                                    onChange={(e) => setCustomer(prev => ({ ...prev, emergencyContactPhone: e.target.value }))} />
                                <InputWithLabel name="emergencyContactRelation" label="Relation" variant="default" size="full" labelPosition="top"
                                    value={customer.emergencyContactRelation ?? ''}
                                    onChange={(e) => setCustomer(prev => ({ ...prev, emergencyContactRelation: e.target.value }))} />
                            </CardContent>
                        </Card>
                        <Card className="flex">
                            <CardHeader>
                                <CardTitle>Health Information</CardTitle>
                            </CardHeader>
                            <CardContent className="flex w-full flex-col gap-3">
                                <div className="flex flex-col gap-2">
                                    <Label className="text-[10pt]">Medical Conditions</Label>
                                    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                                        {medicalConditionOptions.filter(option => option !== "Other").map((option) => (
                                            <div key={option} className="flex items-center gap-1">
                                                <input id={`medicalCondition-${option}`} name="medicalConditions" type="checkbox"
                                                    checked={selectedMedicalConditions.includes(option)}
                                                    onChange={(e) => updateMedicalCondition(option, e.target.checked)} />
                                                <Label htmlFor={`medicalCondition-${option}`}>{option}</Label>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex w-full min-w-0 items-center gap-2">
                                        <div className="flex shrink-0 items-center gap-1">
                                            <input id="medicalCondition-Other" name="medicalConditions" type="checkbox"
                                                checked={selectedMedicalConditions.includes("Other")}
                                                onChange={(e) => updateMedicalCondition("Other", e.target.checked)} />
                                            <Label htmlFor="medicalCondition-Other">Other</Label>
                                        </div>
                                        <InputCustom size="full" className="min-w-0 flex-1" aria-label="Other medical condition" placeholder="Specify other condition"
                                            value={otherMedicalCondition}
                                            onChange={(e) => updateOtherMedicalCondition(e.target.value)} />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label className="text-[10pt]">Pacemaker/Stent</Label>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1">
                                            <input id="pacemakerStentNo" name="pacemakerStent" type="radio" value="No"
                                                checked={!customer.pacemakerStent || customer.pacemakerStent === "No"}
                                                onChange={() => setCustomer(prev => ({ ...prev, pacemakerStent: "No" }))} />
                                            <Label htmlFor="pacemakerStentNo">No</Label>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <input id="pacemakerStentYes" name="pacemakerStent" type="radio" value="Yes"
                                                checked={customer.pacemakerStent === "Yes"}
                                                onChange={() => setCustomer(prev => ({ ...prev, pacemakerStent: "Yes" }))} />
                                            <Label htmlFor="pacemakerStentYes">Yes</Label>
                                        </div>
                                    </div>
                                </div>
                                <InputWithLabel name="regularMedication" label="Regular Medication" variant="default" size="full" labelPosition="top"
                                    value={customer.regularMedication ?? ''}
                                    onChange={(e) => setCustomer(prev => ({ ...prev, regularMedication: e.target.value }))} />
                                <InputWithLabel name="drugAllergy" label="Drug Allergy" variant="default" size="full" labelPosition="top"
                                    value={customer.drugAllergy ?? ''}
                                    onChange={(e) => setCustomer(prev => ({ ...prev, drugAllergy: e.target.value }))} />
                                <div className="flex flex-col gap-2">
                                    <Label className="text-[10pt]">Walking the Course</Label>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                        <div className="flex items-center gap-1">
                                            <input id="walkingTheCourseCanWalk" name="walkingTheCourse" type="radio" value="Can Walk"
                                                checked={customer.walkingTheCourse === "Can Walk"}
                                                onChange={() => setCustomer(prev => ({ ...prev, walkingTheCourse: "Can Walk" }))} />
                                            <Label htmlFor="walkingTheCourseCanWalk">Can Walk</Label>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <input id="walkingTheCourseBuggyNeeded" name="walkingTheCourse" type="radio" value="Buggy Needed"
                                                checked={customer.walkingTheCourse === "Buggy Needed"}
                                                onChange={() => setCustomer(prev => ({ ...prev, walkingTheCourse: "Buggy Needed" }))} />
                                            <Label htmlFor="walkingTheCourseBuggyNeeded">Buggy Needed</Label>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label className="text-[10pt]">Dizzy/Short of Breath When Walking</Label>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                        {["No", "Yes", "Sometimes"].map((option) => (
                                            <div key={option} className="flex items-center gap-1">
                                                <input id={`dizzyShortOfBreath-${option}`} name="dizzyShortOfBreathWhenWalking" type="radio" value={option}
                                                    checked={customer.dizzyShortOfBreathWhenWalking === option}
                                                    onChange={() => setCustomer(prev => ({ ...prev, dizzyShortOfBreathWhenWalking: option }))} />
                                                <Label htmlFor={`dizzyShortOfBreath-${option}`}>{option}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <InputWithLabel name="doctorNamePhone" label="Doctor Name / Phone" variant="default" size="full" labelPosition="top"
                                    value={customer.doctorNamePhone ?? ''}
                                    onChange={(e) => setCustomer(prev => ({ ...prev, doctorNamePhone: e.target.value }))} />
                            </CardContent>
                        </Card>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <ButtonCustom type="button" variant={"green"} onClick={async () => {
                            const result = await customerUpdate(customer, location);
                            if(result.error){
                                toast(result.message);
                            }else{
                                if(onSaved)
                                    onSaved(customer);
                                setOpen(false);
                            }
                        }} >Update Customer</ButtonCustom>
                        <ButtonCustom type="button" variant={"black"} onClick={() => setOpen(false)}>Close</ButtonCustom>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};