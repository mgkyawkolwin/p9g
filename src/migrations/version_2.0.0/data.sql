-- check if there any invalid datetime data
select count(*) from reservation where hour(date_add(checkindate, interval 7 hour)) > 0;
select count(*) from roomReservation where hour(date_add(checkindate, interval 7 hour)) > 0;
select count(*) from roomCharge where hour(date_add(startdate, interval 7 hour)) > 0;

--

select count(*) from reservation where hour(checkindate) = 17;
select count(*) from roomReservation where hour(checkindate) = 17;
select count(*) from roomCharge where hour(startdate) = 17;

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

select count(*) from reservation where hour(checkindate) = 17;
select count(*) from roomReservation where hour(checkindate) = 17;
select count(*) from roomCharge where hour(startdate) = 17;