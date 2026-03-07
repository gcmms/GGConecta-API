import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '../common/constants/roles.enum';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { DisposeInventoryItemDto } from './dto/dispose-inventory-item.dto';
import { CreateInventoryLoanDto, ReturnInventoryLoanDto } from './dto/create-inventory-loan.dto';
import {
  CreateInventoryMaintenanceDto,
  UpdateInventoryMaintenanceDto
} from './dto/create-inventory-maintenance.dto';

@ApiTags('Inventory')
@ApiBearerAuth('bearerAuth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('items')
  async listItems() {
    try {
      return await this.inventoryService.listItems();
    } catch (error: any) {
      throw this.wrapError(error, 'Erro ao listar itens de inventário.');
    }
  }

  @Get('items/:id')
  async findItem(@Param('id') idParam: string) {
    const id = this.parseId(idParam);
    try {
      return await this.inventoryService.findItemById(id);
    } catch (error: any) {
      throw this.wrapError(error, 'Erro ao carregar item de inventário.');
    }
  }

  @Post('items')
  async createItem(@Body() body: CreateInventoryItemDto) {
    try {
      const item = await this.inventoryService.createItem(body);
      return { message: 'Item cadastrado com sucesso.', item };
    } catch (error: any) {
      throw this.wrapError(error, 'Erro ao cadastrar item de inventário.');
    }
  }

  @Patch('items/:id')
  async updateItem(@Param('id') idParam: string, @Body() body: UpdateInventoryItemDto) {
    const id = this.parseId(idParam);
    try {
      const item = await this.inventoryService.updateItem(id, body);
      return { message: 'Item atualizado com sucesso.', item };
    } catch (error: any) {
      throw this.wrapError(error, 'Erro ao atualizar item de inventário.');
    }
  }

  @Patch('items/:id/dispose')
  async disposeItem(@Param('id') idParam: string, @Body() body: DisposeInventoryItemDto) {
    const id = this.parseId(idParam);
    try {
      const item = await this.inventoryService.disposeItem(id, body);
      return { message: 'Baixa patrimonial registrada com sucesso.', item };
    } catch (error: any) {
      throw this.wrapError(error, 'Erro ao registrar baixa patrimonial.');
    }
  }

  @Delete('items/:id')
  async deleteItem(@Param('id') idParam: string) {
    const id = this.parseId(idParam);
    try {
      await this.inventoryService.deleteItem(id);
      return { message: 'Item excluído com sucesso.' };
    } catch (error: any) {
      throw this.wrapError(error, 'Erro ao excluir item de inventário.');
    }
  }

  @Get('loans')
  async listLoans() {
    try {
      return await this.inventoryService.listLoans();
    } catch (error: any) {
      throw this.wrapError(error, 'Erro ao listar empréstimos.');
    }
  }

  @Post('loans')
  async createLoan(@Body() body: CreateInventoryLoanDto) {
    try {
      const loan = await this.inventoryService.createLoan(body);
      return { message: 'Empréstimo registrado com sucesso.', loan };
    } catch (error: any) {
      throw this.wrapError(error, 'Erro ao registrar empréstimo.');
    }
  }

  @Patch('loans/:id/return')
  async returnLoan(@Param('id') idParam: string, @Body() body: ReturnInventoryLoanDto) {
    const id = this.parseId(idParam);
    try {
      const loan = await this.inventoryService.returnLoan(id, body);
      return { message: 'Devolução registrada com sucesso.', loan };
    } catch (error: any) {
      throw this.wrapError(error, 'Erro ao registrar devolução.');
    }
  }

  @Get('maintenance')
  async listMaintenanceRequests() {
    try {
      return await this.inventoryService.listMaintenanceRequests();
    } catch (error: any) {
      throw this.wrapError(error, 'Erro ao listar solicitações de manutenção.');
    }
  }

  @Post('maintenance')
  async createMaintenanceRequest(@Body() body: CreateInventoryMaintenanceDto) {
    try {
      const request = await this.inventoryService.createMaintenanceRequest(body);
      return { message: 'Solicitação de manutenção criada com sucesso.', request };
    } catch (error: any) {
      throw this.wrapError(error, 'Erro ao criar solicitação de manutenção.');
    }
  }

  @Patch('maintenance/:id')
  async updateMaintenanceRequest(
    @Param('id') idParam: string,
    @Body() body: UpdateInventoryMaintenanceDto
  ) {
    const id = this.parseId(idParam);
    try {
      const request = await this.inventoryService.updateMaintenanceRequest(id, body);
      return { message: 'Solicitação de manutenção atualizada com sucesso.', request };
    } catch (error: any) {
      throw this.wrapError(error, 'Erro ao atualizar solicitação de manutenção.');
    }
  }

  @Get('maintenance/report')
  async maintenanceReport() {
    try {
      return await this.inventoryService.maintenanceReport();
    } catch (error: any) {
      throw this.wrapError(error, 'Erro ao gerar relatório de manutenção.');
    }
  }

  private parseId(idParam: string) {
    const id = Number(idParam);
    if (!Number.isInteger(id) || id <= 0) {
      throw new HttpException({ message: 'ID inválido.' }, HttpStatus.BAD_REQUEST);
    }
    return id;
  }

  private wrapError(error: any, defaultMessage: string) {
    const status = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;
    const message = status === HttpStatus.INTERNAL_SERVER_ERROR ? defaultMessage : error?.message;
    return new HttpException({ message: message || 'Erro.' }, status);
  }
}
