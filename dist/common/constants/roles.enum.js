"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleHierarchy = exports.Role = void 0;
var Role;
(function (Role) {
    Role["ADMIN"] = "Administrador";
    Role["MEMBER"] = "Membro";
    Role["NON_MEMBER"] = "N\u00E3o membro";
})(Role || (exports.Role = Role = {}));
exports.roleHierarchy = [Role.ADMIN, Role.MEMBER, Role.NON_MEMBER];
//# sourceMappingURL=roles.enum.js.map