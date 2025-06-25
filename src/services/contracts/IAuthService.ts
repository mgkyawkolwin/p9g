
export default interface IAuth {

    signMeIn(id : string, password : string) : void;

    signMeOut() : void;

    isAuthenticated() : boolean;

    isAuthorized(roles : [string]) : boolean;
    
}