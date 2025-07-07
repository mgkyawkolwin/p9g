
const negativeSpecialCharactersAll = '`~!@#\\$%\\^&\\*\\(\\)\\-_=\\+\\[\\{\\]\\}\\\\|;:\\\'",<>\\.\\?\\/';
const negativeSpecialCharactersAddress = '`~!@\\$%\\^&\\*_=\\+\\[\\{\\]\\}\\\\|;:\\\'"<>\\?\\/';
export const RegularExpressions = {
    name: `^[^${negativeSpecialCharactersAll}]*$`,
    country: `^[a-zA-Z]$`,
    email: `^[a-zA-Z0-9.-_]+@[a-zA-Z0-9]+\\.[a-zA-Z]{2,3}$`,
    nationalId: `^[^${negativeSpecialCharactersAll}]*$`,
    passport: `^[a-zA-Z0-9]*$`,
    phone: `^[0-9()+ ]*$`,
    address: `^[^${negativeSpecialCharactersAddress}]*$`
}