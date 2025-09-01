# Conventions

## Naming Conventions

### General

#### Varibla Name
Use camel case. 
const myConstVariable = 0;

#### Component, Class, Interface
Use pascal case.
MyCustomDialog, ReservationService, IReservationService.

#### File Name
Use small casing for framework files.
page.tsx
action.ts
route.ts
custombutton.tsx

Use pacal casing for domain, service, repositories.
Reservation.ts
IReservationService.ts
ReservationRepository.ts

### Function Name
Use domain + verb + quantities/status

reservationCreate();

reservationGetAll();
reservationGetList();
reservationGetListById();
reservationGetById();

reservationUpdate();
reservationUpdateAll();
reservationUpdateById();
reservationUpdateList();
reservationUpdateListById();

reservationDelete();
reservationDeleteAll();
reservationDeleteById();
reservationDeleteList();

reservationGetCancel();
reservationGetNew();

reservationCancel();

reservationGetListCancel();
reservationUpdateRoom();
reservationDeleteCancel();

## Code Style

### Imports
Import external libraries first. 
Followed by empty line.
Import internal libraries.

### Component, Class, Interface