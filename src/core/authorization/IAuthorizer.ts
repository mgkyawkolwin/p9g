export default interface IAuthorizer {
    isAuthorized(user: any, resource: string, action: string): boolean;
}