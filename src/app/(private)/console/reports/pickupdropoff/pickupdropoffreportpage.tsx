"use client";
import React, { useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Group, GroupContent, GroupTitle } from '@/lib/components/web/react/uicustom/group';
import { InputCustom } from '@/lib/components/web/react/uicustom/inputcustom';
import { ButtonCustom } from '@/lib/components/web/react/uicustom/buttoncustom';
import { getPickupDropoffReport } from './actions';
import { Loader } from '@/lib/components/web/react/uicustom/loader';
import { getISODateTimeString } from '@/lib/utils';
import PickupDropoffReport from '@/app/components/reports/pickupdropoffreport';

export default function PickupDropoffReportPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [reportData, setReportData] = React.useState<any>(null);
  const [arrivalDepartureDate, setArrivalDepartureDate] = React.useState<Date>(null);

  return (
    <div className="flex flex-1 w-auto">
      <Loader isLoading={isLoading} />
      <Group className="flex w-full">
        <GroupTitle>Report</GroupTitle>
        <GroupContent>
          <div className="flex flex-col gap-4">
            <section aria-label="reportsearch">
              <div className="flex gap-4 items-center">
                <div className="flex gap-2 items-center">
                  <div className="text-[10pt]">Date</div>
                  <DatePicker selected={arrivalDepartureDate} onChange={(d: Date|null) => setArrivalDepartureDate(d)} dateFormat="yyyy-MM-dd" customInput={<InputCustom variant="form" size="md" />} placeholderText="yyyy-mm-dd" isClearable showIcon />
                </div>
                <ButtonCustom onClick={async () => {
                  setIsLoading(true);
                  const cd = arrivalDepartureDate ? getISODateTimeString(arrivalDepartureDate.toLocaleDateString('sv-SE')) : '';
                  const res = await getPickupDropoffReport(cd);
                  setIsLoading(false);
                  if (res.message) {
                    // toast handled by caller normally; keep simple
                  }
                  if (!res.error) setReportData(res.data);
                }}>View Report</ButtonCustom>
              </div>
            </section>

            {reportData && <PickupDropoffReport report={reportData} />}
          </div>
        </GroupContent>
      </Group>
    </div>
  );
}
