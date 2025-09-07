-- check if there any invalid datetime data
select count(*) from reservation where hour(date_add(checkindate, interval 7 hour)) > 0;
select count(*) from roomReservation where hour(date_add(checkindate, interval 7 hour)) > 0;
select count(*) from roomCharge where hour(date_add(startdate, interval 7 hour)) > 0;

-- (1) first check records
select count(*) from reservation;
select count(*) from reservation where hour(checkindate) = 17;
select count(*) from reservation where hour(checkindate) <> 17;
select count(*) from roomReservation;
select count(*) from roomReservation where hour(checkindate) = 17;
select count(*) from roomReservation where hour(checkindate) <> 17;
select count(*) from roomCharge;
select count(*) from roomCharge where hour(startdate) = 17;
select count(*) from roomCharge where hour(startdate) <> 17;

-- (2) update correct reservations
update reservation 
set arrivaldatetime = date_add(arrivaldatetime, interval 7 hour),
departuredatetime = date_add(departuredatetime, interval 7 hour),
checkindate = date_add(checkindate, interval 7 hour),
checkoutdate = date_add(checkoutdate, interval 7 hour)
where hour(checkindate) = 17;

update roomReservation
set checkindate = date_add(checkindate, interval 7 hour),
checkoutdate = date_add(checkoutdate, interval 7 hour)
where hour(checkindate) = 17;

update roomCharge
set startdate = date_add(startdate, interval 7 hour),
enddate = date_add(enddate, interval 7 hour)
where hour(startdate) = 17;

-- (3) update wrong dates
update reservation 
set checkindate = CAST(CAST(checkindate AS DATE) AS DATETIME),
checkoutdate = CAST(CAST(checkoutdate AS DATE) AS DATETIME)
where hour(checkindate) <> 0;

update roomReservation
set checkindate = CAST(CAST(checkindate AS DATE) AS DATETIME),
checkoutdate = CAST(CAST(checkoutdate AS DATE) AS DATETIME)
where hour(checkindate) <> 0;

update roomCharge
set startdate = CAST(CAST(startdate AS DATE) AS DATETIME),
enddate = CAST(CAST(enddate AS DATE) AS DATETIME)
where hour(startdate) <> 0;

-- (4) check final data, all sould return zero counts
select count(*) from reservation where hour(checkindate) <> 0;
select count(*) from roomReservation where hour(checkindate) <> 0;
select count(*) from roomCharge where hour(startdate) <> 0;