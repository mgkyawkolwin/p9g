"use client";
import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Group, GroupContent, GroupTitle } from '@/lib/components/web/react/uicustom/group';
import { InputCustom } from '@/lib/components/web/react/uicustom/inputcustom';
import { ButtonCustom } from '@/lib/components/web/react/uicustom/buttoncustom';
import { getPickupDropoffReportNew } from './actions';
import { Loader } from '@/lib/components/web/react/uicustom/loader';
import PickupDropoffReportNew from '@/app/components/reports/pickupdropoffreportnew';
import { useParams } from 'next/navigation';

export default function PickupDropoffReportNewPage() {
  const params = useParams();
  const location = params.location as string;
  const [isLoading, setIsLoading] = React.useState(false);
  const [reportData, setReportData] = React.useState<any>(null);
  const now = new Date();
  const defaultStart = new Date(now);
  defaultStart.setHours(0, 0, 0, 0);
  const defaultEnd = new Date(now);
  defaultEnd.setHours(23, 59, 59, 999);
  const [arrivalStartDateTime, setArrivalStartDateTime] = React.useState<Date>(defaultStart);
  const [arrivalEndDateTime, setArrivalEndDateTime] = React.useState<Date>(defaultEnd);
  const [departureStartDateTime, setDepartureStartDateTime] = React.useState<Date>(defaultStart);
  const [departureEndDateTime, setDepartureEndDateTime] = React.useState<Date>(defaultEnd);

  return (
    <div className="flex flex-1 w-auto">
      <Loader isLoading={isLoading} />
      <Group className="flex w-full">
        <GroupTitle>Pickup/Dropoff Report (NEW)</GroupTitle>
        <GroupContent>
          <div className="flex flex-col gap-4">
            <section aria-label="reportsearch">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <div className="text-[10pt] font-semibold">Arrival Start DateTime</div>
                  <DatePicker
                    selected={arrivalStartDateTime}
                    onChange={(date: Date | null) => date && setArrivalStartDateTime(date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="yyyy-MM-dd HH:mm"
                    customInput={<InputCustom variant="form" size="md" />}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="text-[10pt] font-semibold">Arrival End DateTime</div>
                  <DatePicker
                    selected={arrivalEndDateTime}
                    onChange={(date: Date | null) => date && setArrivalEndDateTime(date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="yyyy-MM-dd HH:mm"
                    customInput={<InputCustom variant="form" size="md" />}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="text-[10pt] font-semibold">Departure Start DateTime</div>
                  <DatePicker
                    selected={departureStartDateTime}
                    onChange={(date: Date | null) => date && setDepartureStartDateTime(date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="yyyy-MM-dd HH:mm"
                    customInput={<InputCustom variant="form" size="md" />}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="text-[10pt] font-semibold">Departure End DateTime</div>
                  <DatePicker
                    selected={departureEndDateTime}
                    onChange={(date: Date | null) => date && setDepartureEndDateTime(date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="yyyy-MM-dd HH:mm"
                    customInput={<InputCustom variant="form" size="md" />}
                  />
                </div>
              </div>
              <div className="mt-4">
                <ButtonCustom
                  onClick={async () => {
                    setIsLoading(true);
                    const arrivalStart = arrivalStartDateTime.toISOString();
                    const arrivalEnd = arrivalEndDateTime.toISOString();
                    const departureStart = departureStartDateTime.toISOString();
                    const departureEnd = departureEndDateTime.toISOString();
                    const res = await getPickupDropoffReportNew(arrivalStart, arrivalEnd, departureStart, departureEnd, location);
                    setIsLoading(false);
                    if (!res.error) setReportData(res.data);
                  }}
                >
                  View Report
                </ButtonCustom>
              </div>
            </section>
            {reportData && <PickupDropoffReportNew report={reportData} />}
          </div>
        </GroupContent>
      </Group>
    </div>
  );
}
