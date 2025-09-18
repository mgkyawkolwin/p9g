import { createMap, mapFrom } from '@automapper/core';
import { classes } from '@automapper/classes';
import mapper from './automapper';

createMap(mapper, "ReservationEntity", "Reservation");
createMap(mapper, "Reservation", "ReservationEntity");