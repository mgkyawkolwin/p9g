-- truncate table p9g.reservation;
-- insert into p9g.reservation
/**
Rsv 4220 invalid discount, deposit
**/
insert into reservation
select
rsv.id as id,
rType.id as reservationTypeId,
null as promotionPackageId,
case when CustomerType = 'Member' then '3de777df-5a1a-11f0-9a7b-b88d122a4ff4' else null end as prepaidPackageId,
null as tourCompany,
(str_to_date(CONCAT(rsv.arrivedate, ' ', rsv.arrivetime), '%m/%d/%Y %h:%i:%s %p') - interval 7 hour) as arrivalDateTimeUTC,
rsv.arriveairline as arrivalFlight,
(str_to_date(CONCAT(rsv.depdate, ' ', rsv.deptime), '%m/%d/%Y %h:%i:%s %p') - interval 7 hour) as departureDateTimeUTC,
rsv.depairline as departureFlight,
(str_to_date(rsv.checkin, '%m/%d/%Y') - interval 7 hour) as checkInDateUTC,
(str_to_date(rsv.checkout, '%m/%d/%Y') - interval 7 hour) as checkOutDateUTC,
rsv.days as noOfDays,
rsv.deposit as depositAmount,
rsv.deposit as depositAmountInCurrency,
'KWR' as depositCurrency,
null as depositDateUTC,
rsv.paymenttypes as depositPaymentMode,
rsv.room as roomNo,
case when rsv.singlecharge > 0 then 1 else 0 end as isSingleOccupancy,
rsv.pers as noOfGuests,
null as pickUpTypeId,
0 as pickUpFee, -- case when rsv.pickupfeekrw > 0 then rsv.pickupfeekrw when rsv.pickupfeeusd > 0 then rsv.pickupfeeusd when rsv.pickfeethb > 0 then rsv.pickupfeethb else 0 end as pickUpFee,
null as pickUpFeeCurrency, -- case when pickupfeekrw > 0 then 'KRW' when pickupfeeusd > 0 then 'USD' when pickfeethb > 0 then 'THB' else null end as pickUpFeeCurrency,
null as pickUpFeePaidOnUTC,
null as pickupcarno,
null as pickupdriver,
null as dropofftypeid,
0 as dropOffFee,
null as dropOffFeeCurrency,
null as dropOffFeePaidOnUTC,
null as dropoffcarno,
null as dropoffdriver,
case when paymenttypes = 'Canceled' then 'f705afcd-58be-11f0-ad6b-b88d122a4ff4' else 'f7052b5f-58be-11f0-ad6b-b88d122a4ff4' end as reservationStatusId, -- 'NEW'
rsv.clubnetamount + rsv.singlecharge + rsv.extracharge as totalAmount,
0 as paidAmount,
cast(rsv.discount as decimal) as discountAmount,
0 as tax,
0 as taxAmount,
rsv.clubnetamount + rsv.singlecharge + rsv.extracharge - rsv.discount as netAmount,
0 as dueAmount,
concat('(#', rsv.RsvNo,')',rsv.remarks) as remark,
'MIDA' as location,
'1900-01-01' as createdAtUTC,
'00000000-0000-0000-0000-000000000000' as createdBy,
'1900-01-01' as updatedAtUTC,
'00000000-0000-0000-0000-000000000000' as updatedBy
from p9g.mida_rsv as rsv
left join p9g.config as rType on rType.text = rsv.customertype


-- NORMAL ROOM PAYMENT, single charge???? extra charge???
insert into payment
select 
uuid() as id,
rsv.id,
'NORMAL' as paymentType,
'1900-01-01' as paymentDateUTC,
rsv.clubnetamount + rsv.singlecharge + rsv.extracharge - rsv.discount as amount,
rsv.clubnetamount + rsv.singlecharge + rsv.extracharge - rsv.discount as amountInCurrency,
'KWR' as currency,
rsv.paymentTypes as paymentMode,
'' as remark,
'1900-01-01' as createdAtUTC,
'00000000-0000-0000-0000-000000000000' as createdBy,
'1900-01-01' as updatedAtUTC,
'00000000-0000-0000-0000-000000000000' as updatedBy
from p9g.mida_rsv rsv


-- BANK BILL PICKUP PAYMENT
insert into bill
select 
uuid() as id,
'1900-01-01' as dateUTC,
'PICKUP' as paymentType,
rsv.paymenttypes as paymentMode,
rsv.id as reservationId,
'Pick Up' as itemName,
case when rsv.pickupfeekrw > 0 then rsv.pickupfeekrw
when rsv.pickupfeethb > 0 then rsv.pickupfeethb
when rsv.pickupfeeusd > 0 then rsv.pickupfeeusd
else 0
end as unitPrice,
1 as quantity,
case when rsv.pickupfeekrw > 0 then rsv.pickupfeekrw
when rsv.pickupfeethb > 0 then rsv.pickupfeethb
when rsv.pickupfeeusd > 0 then rsv.pickupfeeusd
else 0
end as amount,
case when rsv.pickupfeekrw > 0 then 'KRW'
when rsv.pickupfeethb > 0 then 'THB'
when rsv.pickupfeeusd > 0 then 'USD'
else 'USD'
end as currency,
1 as isPaid,
'1900-01-01' as paidOnUTC,
'1900-01-01' as createdAtUTC,
'00000000-0000-0000-0000-000000000000' as createdBy,
'1900-01-01' as updatedAtUTC,
'00000000-0000-0000-0000-000000000000' as updatedBy
from p9g.kkc_rsv rsv


-- BANK BILL DROPOFF PAYMENT
insert into bill
select 
uuid() as id,
'1900-01-01' as dateUTC,
'DROPOFF' as paymentType,
rsv.paymenttypes as paymentMode,
rsv.id as reservationId,
'Drop Off' as itemName,
case when rsv.dropofffeekrw > 0 then rsv.dropofffeekrw
when rsv.dropofffeethb > 0 then rsv.dropofffeethb
when rsv.dropofffeeusd > 0 then rsv.dropofffeeusd
else 0
end as unitPrice,
1 as quantity,
case when rsv.dropofffeekrw > 0 then rsv.dropofffeekrw
when rsv.dropofffeethb > 0 then rsv.dropofffeethb
when rsv.dropofffeeusd > 0 then rsv.dropofffeeusd
else 0
end as amount,
case when rsv.dropofffeekrw > 0 then 'KRW'
when rsv.dropofffeethb > 0 then 'THB'
when rsv.dropofffeeusd > 0 then 'USD'
else 'USD'
end as currency,
1 as isPaid,
'1900-01-01' as paidOnUTC,
'1900-01-01' as createdAtUTC,
'00000000-0000-0000-0000-000000000000' as createdBy,
'1900-01-01' as updatedAtUTC,
'00000000-0000-0000-0000-000000000000' as updatedBy
from p9g.mida_rsv rsv


-- ROOM RESERVATION
insert into roomReservation (id, roomId, reservationId, noOfExtraBed, checkInDateUTC, checkOutDateUTC, createdAtUTC, createdBy, updatedAtUTC, updatedBy)
select
uuid() as id,
r.id as roomId,
rsv.id as reservationId,
0 as noOfExtraBed,
(str_to_date(rsv.checkin, '%m/%d/%Y') - interval 7 hour) as checkInDateUTC,
(str_to_date(rsv.checkout, '%m/%d/%Y') - interval 7 hour) as checkOutDateUTC,
'1900-01-01' as createdAtUTC,
'00000000-0000-0000-0000-000000000000' as createdBy,
'1900-01-01' as updatedAtUTC,
'00000000-0000-0000-0000-000000000000' as updatedBy
from (select * from p9g.kkc_rsv where room != '' and room is not null and room not in ('KK101','101101','U')) as rsv
left join room as r on r.roomNo = rsv.room



