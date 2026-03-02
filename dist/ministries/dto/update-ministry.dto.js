"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMinistryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_ministry_dto_1 = require("./create-ministry.dto");
class UpdateMinistryDto extends (0, swagger_1.PartialType)(create_ministry_dto_1.CreateMinistryDto) {
}
exports.UpdateMinistryDto = UpdateMinistryDto;
//# sourceMappingURL=update-ministry.dto.js.map