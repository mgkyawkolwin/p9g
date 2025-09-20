import Bill from "../domain/Bill";
import CurrencyTotal from "./CurrencyTotal";

export default class Invoice{
    public UnPaidBills: Bill[] = [];
    public UnPaidTotals: CurrencyTotal[] = [];
    public PaidBills: Bill[] = [];
    public PaidTotals: CurrencyTotal[] = [];
}