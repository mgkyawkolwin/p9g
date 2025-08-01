-- truncate table p9g.reservation;
-- insert into p9g.reservation
/**
Rsv 4220 invalid discount, deposit
**/
select uuid() as id,
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
'KWR' as depositCurrency,
null as depositDateUTC,
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
'f7052b5f-58be-11f0-ad6b-b88d122a4ff4' as reservationStatusId, -- 'NEW'
rsv.clubnetamount + rsv.singlecharge + rsv.extracharge as totalAmount,
0 as paidAmount,
rsv.discount as discountAmount,
0 as tax,
0 as taxAmount,
rsv.clubnetamount + rsv.singlecharge + rsv.extracharge - rsv.discount as netAmount,
0 as dueAmount,
'(#'+ rsv.RsvNo + ')' + rsv.remarks as remark,
'MIDA' as location,
'1900-01-01' as createdAtUTC,
'00000000-0000-0000-0000-000000000000' as createdBy,
'1900-01-01' as updatedAtUTC,
'00000000-0000-0000-0000-000000000000' as updatedBy
from p9g.mida_rsv as rsv
left join p9g.config as rType on rType.text = rsv.customertype;


-- NORMAL ROOM PAYMENT, single charge???? extra charge???
insert into payment
select 
uuid() as id,
rsv.id,
'NORMAL' as paymentType,
'1900-01-01' as paymentDateUTC,
rsv.totalAmount as amount,
rsv.totalAmount as amountInCurrency,
'KWR' as currency,
case when rsv.paymentMode = 'Bank' then 'BANK' else 'CASH' end as paymentMode,
'' as remark,
'1900-01-01' as createdAtUTC,
'00000000-0000-0000-0000-000000000000' as createdBy,
'1900-01-01' as updatedAtUTC,
'00000000-0000-0000-0000-000000000000' as updatedBy
from p9g.reservation rsv


-- BANK BILL PICKUP PAYMENT
insert into bill
select 
uuid() as id,
'1900-01-01' as dateUTC,
'PICKUP' as paymentType,
case when rsv.paymentMode = 'Bank' then 'BANK' else 'CASH' end as paymentMode,
rsv.id as reservationId,
'Pick Up' as itemName,
coalesce(rsv.pickUpFee,0) as unitPrice,
1 as quantity,
coalesce(rsv.pickUpFee,0) as amount,
coalesce(rsv.pickUpFeeCurrency, 'KWR') as currency,
1 as isPaid,
'1900-01-01' as paidOnUTC,
'1900-01-01' as createdAtUTC,
'00000000-0000-0000-0000-000000000000' as createdBy,
'1900-01-01' as updatedAtUTC,
'00000000-0000-0000-0000-000000000000' as updatedBy
from p9g.reservation rsv


-- BANK BILL DROPOFF PAYMENT
insert into bill
select 
uuid() as id,
'1900-01-01' as dateUTC,
'DROPOFF' as paymentType,
case when rsv.paymentMode = 'Bank' then 'BANK' else 'CASH' end as paymentMode,
rsv.id as reservationId,
'Drop Off' as itemName,
coalesce(rsv.dropOffFee,0) as unitPrice,
1 as quantity,
coalesce(rsv.dropOffFee,0) as amount,
coalesce(rsv.dropOffFeeCurrency, 'KWR') as currency,
1 as isPaid,
'1900-01-01' as paidOnUTC,
'1900-01-01' as createdAtUTC,
'00000000-0000-0000-0000-000000000000' as createdBy,
'1900-01-01' as updatedAtUTC,
'00000000-0000-0000-0000-000000000000' as updatedBy
from p9g.reservation rsv