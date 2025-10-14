import { ConfigPermissions } from "./ConfigPermissions";
import IAuthorizer from "./IAuthorizer";

export default class ConfigAuthorizer implements IAuthorizer {

    isAuthorized(user: any, resource: string, action: string): boolean {
        if (!user || !user.role) {
            return false;
        }

        const rolePermissions : Array<string> = ConfigPermissions[user.role];
        if (!rolePermissions) {
            return false;
        }

        const resourcePermissions = rolePermissions.find((perm: string) => resource.startsWith(perm));
        if (!resourcePermissions) {
            return false;
        }

        return true;
    }
}